using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class ActionHistoryRepository(AppDbContext db)
    : Repository<ActionHistory>(db), IActionHistoryRepository
{
    public Task<ActionHistory?> GetLatestPendingAsync(int deviceId, CancellationToken ct = default)
        => Set.Where(x => x.DeviceId == deviceId && x.Status == ActionStatus.Pending)
              .OrderByDescending(x => x.CreatedAt)
              .FirstOrDefaultAsync(ct);

    public async Task<(List<ActionHistory> Items, int Total)> GetPagedAsync(
        int? deviceId, ActionStatus? status, DateTime? from, DateTime? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<ActionHistory> q = Set.AsNoTracking()
            .Include(x => x.Device)
            .Include(x => x.User);

        if (deviceId.HasValue) q = q.Where(x => x.DeviceId == deviceId.Value);
        if (status.HasValue) q = q.Where(x => x.Status == status.Value);
        if (from.HasValue) q = q.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(x => x.CreatedAt <= to.Value);

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
