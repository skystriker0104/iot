using IotServer.Dtos.Common;
using IotServer.Dtos.History;
using IotServer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

// Endpoint chuẩn DOCX Mục 3.4.2: GET /api/device-activity
[Route("api/device-activity")]
[Route("api/v1/action-history")]
public class ActionHistoryController(IActionHistoryService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ActionHistoryDto>>> GetAll(
        [FromQuery] ActionHistoryQuery query, CancellationToken ct)
        => Ok(await service.GetPagedAsync(query, ct));
}
