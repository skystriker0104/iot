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
            else if (topic == _opt.StatusTopic) await HandleStatusAsync(payload);
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

        var now = DateTime.UtcNow.AddHours(7);
        var values = new Dictionary<string, double>();

        if (data.Temp is { } t && InRange(t, -20, 80)) values["temp"] = t;
        if (data.Humidity is { } h && InRange(h, 0, 100)) values["humidity"] = h;
        if (data.Light is { } l && InRange(l, 0, 100)) values["light"] = l;

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
                time = now.ToString("HH:mm:ss")
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

    private async Task HandleStatusAsync(string payload)
    {
        var msg = JsonSerializer.Deserialize<EspStatusPayload>(payload, Json);
        if (msg is null) return;

        if (msg.DeviceId == 0)
        {
            logger.LogWarning("ESP báo lệnh lạ: {Action}", msg.Action);
            return;
        }

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

        using var scope = scopeFactory.CreateScope();
        var historyRepo = scope.ServiceProvider.GetRequiredService<IActionHistoryRepository>();
        var deviceRepo = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var history = await historyRepo.GetLatestPendingAsync(msg.DeviceId);
        if (history is null)
        {
            logger.LogWarning("Nhận esp_status cho device {Id} nhưng không có bản ghi Pending", msg.DeviceId);
        }
        else
        {
            history.Status = msg.Status.Equals("success", StringComparison.OrdinalIgnoreCase)
                ? ActionStatus.Success
                : ActionStatus.Failed;
            history.RespondedAt = DateTime.UtcNow.AddHours(7);
        }

        if (msg.Status.Equals("success", StringComparison.OrdinalIgnoreCase))
        {
            var device = await deviceRepo.GetByIdAsync(msg.DeviceId);
            if (device is not null)
            {
                device.IsOn = msg.State.Equals("on", StringComparison.OrdinalIgnoreCase);
            }
        }

        await uow.SaveChangesAsync();
        registry.TryComplete(msg.DeviceId, msg);
    }

    private static bool InRange(double v, double min, double max) => v >= min && v <= max;
}
