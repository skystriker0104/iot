using IotServer.Dtos.Common;
using IotServer.Dtos.Sensors;
using IotServer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

[Route("api/sensors")]
[Route("api/v1/sensors")]
public class SensorsController(ISensorService service) : ApiControllerBase
{
    // Lấy số đo mới nhất của các cảm biến (dùng cho trang Dashboard)
    [HttpGet("latest")]
    public async Task<ActionResult<List<SensorLatestDto>>> Latest(CancellationToken ct)
        => Ok(await service.GetLatestAsync(ct));

    // Dữ liệu chuỗi thời gian vẽ biểu đồ Recharts
    [HttpGet("chart-data")]
    public async Task<ActionResult<ChartDataDto>> ChartData([FromQuery] ChartDataQuery query, CancellationToken ct)
        => Ok(await service.GetChartDataAsync(query, ct));

    // Endpoint chuẩn DOCX Mục 3.4.2: GET /api/sensor-data
    [HttpGet("/api/sensor-data")]
    [HttpGet("history")]
    public async Task<ActionResult<PagedResult<SensorDataDto>>> GetAllSensorData(
        [FromQuery] SensorHistoryQuery query, CancellationToken ct)
        => Ok(await service.GetHistoryAsync(query, ct));

    // Endpoint chuẩn DOCX Mục 3.4.2: GET /api/sensors/{id}/data
    [HttpGet("{id:int}/data")]
    public async Task<ActionResult<PagedResult<SensorDataDto>>> GetDataBySensorId(
        int id, [FromQuery] SensorHistoryQuery query, CancellationToken ct)
    {
        query.SensorId = id;
        return Ok(await service.GetHistoryAsync(query, ct));
    }
}
