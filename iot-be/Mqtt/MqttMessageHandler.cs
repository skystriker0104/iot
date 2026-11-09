using System.Text.Json;
using IotServer.Data;
using IotServer.Dtos.Sensors;
using IotServer.Entities;
using IotServer.Hubs;
using IotServer.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;

namespace IotServer.Mqtt;

public class MqttMessageHandler(
    IServiceScopeFactory scopeFactory,
    IOptions<MqttOptions> options,
    LatestSensorCache cache,
    PendingCommandRegistry registry,
    IHubContext<IotHub> hubContext,
    ILogger<MqttMessageHandler> logger)
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };
    private readonly MqttOptions _opt = options.Value;
    private DateTime _lastSavedUtc = DateTime.MinValue;

    public async Task HandleAsync(string topic, string payload)
    {
        try
        {
            if (topic == _opt.SensorTopic) await HandleSensorAsync(payload);
            else if (_opt.ParseStatusDeviceCode(topic) is { } deviceCode) await HandleStatusAsync(deviceCode, payload);
        }
        catch (JsonException ex)
        {
            logger.LogWarning("Payload sai định dạng trên topic {Topic}: {Message}", topic, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi xử lý message MQTT trên topic {Topic}", topic);
        }
    }

    private async Task HandleSensorAsync(string payload)
    {
        var data = JsonSerializer.Deserialize<SensorPayload>(payload, Json);
        if (data is null) return;

        var now = DateTime.UtcNow;
        var values = new Dictionary<string, double>();

        if (data.Temp is { } t && InRange(t, -20, 80)) values["temp"] = t;
        if (data.Humidity is { } h && InRange(h, 0, 100)) values["humidity"] = h;
        if (data.Light is { } l && InRange(l, 0, 1023)) values["light"] = l; // ADC thô của LDR

        if (values.Count == 0)
        {
            logger.LogWarning("sensor_data không có giá trị hợp lệ: {Payload}", payload);
            return;
        }

        foreach (var (code, value) in values)
            cache.Set(code, value, now);

        // Bắn SignalR broadcast tới tất cả các client Web đang xem trang Tổng quan (Dashboard)
        try
        {
            await hubContext.Clients.All.SendAsync("ReceiveSensorData", new
            {
                temp = values.GetValueOrDefault("temp"),
                humidity = values.GetValueOrDefault("humidity"),
                light = values.GetValueOrDefault("light"),
                recordedAt = DateTime.SpecifyKind(now, DateTimeKind.Utc) // ISO UTC, FE tự đổi sang giờ địa phương
            });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể gửi SignalR ReceiveSensorData");
        }

        // Throttle: chỉ ghi DB mỗi SensorSaveIntervalSeconds
        if ((now - _lastSavedUtc).TotalSeconds < _opt.SensorSaveIntervalSeconds) return;

        using var scope = scopeFactory.CreateScope();
        var sensorRepo = scope.ServiceProvider.GetRequiredService<ISensorRepository>();
        var dataRepo = scope.ServiceProvider.GetRequiredService<ISensorDataRepository>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var sensors = await sensorRepo.GetAllAsync();
        var rows = sensors
            .Where(s => values.ContainsKey(s.Code))
            .Select(s => new DataSensor { SensorId = s.Id, Value = values[s.Code], CreatedAt = now })
            .ToList();

        if (rows.Count == 0) return;

        await dataRepo.AddRangeAsync(rows);
        await uow.SaveChangesAsync();

        _lastSavedUtc = now;
        logger.LogInformation("Đã lưu {Count} dòng sensor vào DB", rows.Count);

        // Bắn SignalR broadcast danh sách bản ghi mới vừa lưu vào DB cho trang Dữ liệu cảm biến
        try
        {
            var sensorMap = sensors.ToDictionary(s => s.Id);
            var records = rows.Select(r => new SensorDataDto
            {
                Id = r.Id,
                SensorId = r.SensorId,
                SensorCode = sensorMap.TryGetValue(r.SensorId, out var s) ? s.Code : "",
                SensorName = sensorMap.TryGetValue(r.SensorId, out var s2) ? s2.Name : "",
                SensorUnit = sensorMap.TryGetValue(r.SensorId, out var s3) ? s3.Unit : "",
                Value = r.Value,
                CreatedAt = r.CreatedAt
            }).ToList();

            await hubContext.Clients.All.SendAsync("ReceiveNewSensorRecords", records);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể gửi SignalR ReceiveNewSensorRecords");
        }
    }

    // Firmware publish (retained) "ON"/"OFF" lên {BaseTopic}/led{n}/status khi:
    // vừa kết nối MQTT, sau lệnh bật/tắt từng LED, và sau lệnh leds/set.
    // Firmware không gửi status khi lệnh sai → BE timeout → Failed.
    private async Task HandleStatusAsync(string deviceCode, string payload)
    {
        var state = payload.Trim().ToUpperInvariant();
        if (state is not ("ON" or "OFF"))
        {
            logger.LogWarning("Trạng thái không hợp lệ từ {Code}: {Payload}", deviceCode, payload);
            return;
        }

        using var scope = scopeFactory.CreateScope();
        var historyRepo = scope.ServiceProvider.GetRequiredService<IActionHistoryRepository>();
        var deviceRepo = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var device = await deviceRepo.GetByCodeAsync(deviceCode);
        if (device is null)
        {
            logger.LogWarning("Nhận status cho thiết bị không tồn tại: {Code}", deviceCode);
            return;
        }

        // Luôn đồng bộ trạng thái thật của LED (kể cả message retained khi BE vừa kết nối)
        device.IsOn = state == "ON";

        // Chỉ chốt lệnh Pending khi trạng thái khớp action đã gửi
        var history = await historyRepo.GetLatestPendingAsync(device.Id);
        var matched = history is not null && history.Action.Equals(state, StringComparison.OrdinalIgnoreCase);
        if (matched)
        {
            history!.Status = ActionStatus.Success;
            history.RespondedAt = DateTime.UtcNow;
        }

        await uow.SaveChangesAsync();

        var msg = new EspStatusPayload
        {
            DeviceId = device.Id,
            DeviceName = device.Name,
            Action = state,
            Status = "success",
            State = state
        };

        // Bắn SignalR broadcast trạng thái thiết bị thời gian thực
        try
        {
            await hubContext.Clients.All.SendAsync("ReceiveDeviceStatus", new
            {
                deviceId = msg.DeviceId,
                deviceName = msg.DeviceName,
                action = msg.Action,
                status = msg.Status,
                state = msg.State
            });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể gửi SignalR ReceiveDeviceStatus");
        }

        if (matched)
            registry.TryComplete(device.Id, msg);
    }

    private static bool InRange(double v, double min, double max) => v >= min && v <= max;
}
