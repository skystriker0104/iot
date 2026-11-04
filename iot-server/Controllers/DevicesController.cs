using IotServer.Dtos.Devices;
using IotServer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

[Route("api/devices")]
[Route("api/v1/devices")]
public class DevicesController(IDeviceService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<DeviceDto>>> GetAll(CancellationToken ct)
        => Ok(await service.GetAllAsync(ct));

    // Endpoint chuẩn RESTful theo Báo cáo DOCX Mục 3.4.2: POST /api/devices/{deviceId}/commands
    [HttpPost("{deviceId:int}/commands")]
    public async Task<ActionResult<ControlDeviceResponse>> Command(
        int deviceId, [FromBody] ControlDeviceCommandBody body, CancellationToken ct)
    {
        string action = body.Action.Equals("turn_on", StringComparison.OrdinalIgnoreCase) ? "ON" :
                        body.Action.Equals("turn_off", StringComparison.OrdinalIgnoreCase) ? "OFF" :
                        body.Action.ToUpperInvariant();

        return Ok(await service.ControlAsync(UserId, new ControlDeviceRequest
        {
            DeviceId = deviceId,
            Action = action
        }, ct));
    }

    // Endpoint cũ tương thích
    [HttpPost("control")]
    public async Task<ActionResult<ControlDeviceResponse>> Control(
        ControlDeviceRequest request, CancellationToken ct)
        => Ok(await service.ControlAsync(UserId, request, ct));
}
