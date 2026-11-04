using IotServer.Dtos.Common;
using IotServer.Dtos.History;
using IotServer.Mapping;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;

namespace IotServer.Services.Implementations;

public class ActionHistoryService(IActionHistoryRepository histories, ActionHistoryMapper mapper)
    : IActionHistoryService
{
    public async Task<PagedResult<ActionHistoryDto>> GetPagedAsync(
        ActionHistoryQuery query, CancellationToken ct = default)
    {
        var (items, total) = await histories.GetPagedAsync(
            query.DeviceId,
            query.Status,
            query.From?.UtcDateTime,
            query.To?.UtcDateTime,
            query.Page,
            query.PageSize,
            ct);

        return new PagedResult<ActionHistoryDto>
        {
            Items = mapper.ToDtos(items),
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total
        };
    }
}
