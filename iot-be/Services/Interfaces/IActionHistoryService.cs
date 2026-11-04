using IotServer.Dtos.Common;
using IotServer.Dtos.History;

namespace IotServer.Services.Interfaces;

public interface IActionHistoryService
{
    Task<PagedResult<ActionHistoryDto>> GetPagedAsync(ActionHistoryQuery query, CancellationToken ct = default);
}
