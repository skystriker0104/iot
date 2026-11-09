using IotServer.Dtos.Common;
using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface IActionHistoryRepository : IRepository<ActionHistory>
{
    Task<ActionHistory?> GetLatestPendingAsync(int deviceId, CancellationToken ct = default);

    Task<(List<ActionHistory> Items, int Total)> GetPagedAsync(
        int? deviceId, ActionStatus? status, string? action, DateTime? from, DateTime? to,
        SearchKeyword? keyword, int page, int pageSize, CancellationToken ct = default);
}
