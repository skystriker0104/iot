using IotServer.Dtos.Devices;

namespace IotServer.Services.Interfaces;

public interface IDeviceService
{
    Task<List<DeviceDto>> GetAllAsync(CancellationToken ct = default);
    Task<ControlDeviceResponse> ControlAsync(int userId, ControlDeviceRequest request, CancellationToken ct = default);
}
