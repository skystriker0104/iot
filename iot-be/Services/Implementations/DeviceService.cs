using IotServer.Data;
using IotServer.Dtos.Devices;
using IotServer.Entities;
using IotServer.Mapping;
using IotServer.Middleware;
using IotServer.Mqtt;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace IotServer.Services.Implementations;

public class DeviceService(
    IDeviceRepository devices,
    IActionHistoryRepository histories,
    IUnitOfWork uow,
    IMqttPublisher mqtt,
    PendingCommandRegistry registry,
    DeviceMapper mapper,
    IOptions<MqttOptions> options) : IDeviceService
{
    private readonly MqttOptions _opt = options.Value;

    public async Task<List<DeviceDto>> GetAllAsync(CancellationToken ct = default)
        => mapper.ToDtos(await devices.GetAllAsync(ct));

    public async Task<ControlDeviceResponse> ControlAsync(
        int userId, ControlDeviceRequest request, CancellationToken ct = default)
    {
        var action = request.Action.ToUpperInvariant(); // ON | OFF

        var device = await devices.GetByIdAsync(request.DeviceId, ct)
            ?? throw new AppException(StatusCodes.Status404NotFound, "Không tìm thấy thiết bị");

        if (!mqtt.IsConnected)
            throw new AppException(StatusCodes.Status503ServiceUnavailable, "Chưa kết nối được MQTT broker");

        // Đăng ký chờ phản hồi TRƯỚC khi publish. false = thiết bị đang có lệnh khác
        if (!registry.TryRegister(device.Id, out var waitTask))
            throw new AppException(StatusCodes.Status409Conflict, "Thiết bị đang xử lý lệnh trước đó");

        try
        {
            // Lưu Pending TRƯỚC khi publish để handler esp_status tìm thấy
            var history = new ActionHistory
            {
                DeviceId = device.Id,
                UserId = userId,
                Action = action,
                Status = ActionStatus.Pending
            };
            await histories.AddAsync(history, ct);
            await uow.SaveChangesAsync(ct);

            try
            {
                await mqtt.PublishAsync(_opt.ControlTopic, $"{device.Code}_{action.ToLowerInvariant()}", ct);
            }
            catch (Exception) when (!ct.IsCancellationRequested)
            {
                await FailAsync(history);
                throw new AppException(StatusCodes.Status503ServiceUnavailable, "Không gửi được lệnh tới broker");
            }

            try
            {
                var status = await waitTask.WaitAsync(TimeSpan.FromSeconds(_opt.ControlTimeoutSeconds), ct);

                // Handler MQTT đã cập nhật ActionHistory và Device.IsOn trong DB
                return new ControlDeviceResponse
                {
                    DeviceId = device.Id,
                    Action = action,
                    Status = status.Status.ToLowerInvariant(),
                    State = status.State
                };
            }
            catch (TimeoutException)
            {
                await FailAsync(history);
                throw new AppException(StatusCodes.Status504GatewayTimeout, "ESP không phản hồi");
            }
            catch (OperationCanceledException)
            {
                await FailAsync(history);
                throw;
            }
        }
        finally
        {
            registry.Remove(device.Id);
        }
    }

    private async Task FailAsync(ActionHistory history)
    {
        history.Status = ActionStatus.Failed;
        history.RespondedAt = DateTime.UtcNow.AddHours(7);
        await uow.SaveChangesAsync(CancellationToken.None);
    }
}
