using IotServer.Data;
using IotServer.Dtos.Common;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class ActionHistoryRepository(AppDbContext db)
    : Repository<ActionHistory>(db), IActionHistoryRepository
{
    private const int Tz = SearchKeyword.LocalOffsetHours;

    public Task<ActionHistory?> GetLatestPendingAsync(int deviceId, CancellationToken ct = default)
        => Set.Where(x => x.DeviceId == deviceId && x.Status == ActionStatus.Pending)
              .OrderByDescending(x => x.CreatedAt)
              .FirstOrDefaultAsync(ct);

    public async Task<(List<ActionHistory> Items, int Total)> GetPagedAsync(
        int? deviceId, ActionStatus? status, string? action, DateTime? from, DateTime? to,
        SearchKeyword? keyword, int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<ActionHistory> q = Set.AsNoTracking()
            .Include(x => x.Device)
            .Include(x => x.User);

        if (deviceId.HasValue) q = q.Where(x => x.DeviceId == deviceId.Value);
        if (status.HasValue) q = q.Where(x => x.Status == status.Value);
        if (!string.IsNullOrEmpty(action)) q = q.Where(x => x.Action == action);
        if (from.HasValue) q = q.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(x => x.CreatedAt <= to.Value);
        if (keyword is not null) q = ApplyKeyword(q, keyword);

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    private static IQueryable<ActionHistory> ApplyKeyword(IQueryable<ActionHistory> q, SearchKeyword k)
    {
        if (k.Hour is { } h) q = q.Where(x => x.CreatedAt.AddHours(Tz).Hour == h);
        if (k.Minute is { } mi) q = q.Where(x => x.CreatedAt.AddHours(Tz).Minute == mi);
        if (k.Second is { } s) q = q.Where(x => x.CreatedAt.AddHours(Tz).Second == s);
        if (k.Day is { } d) q = q.Where(x => x.CreatedAt.AddHours(Tz).Day == d);
        if (k.Month is { } mo) q = q.Where(x => x.CreatedAt.AddHours(Tz).Month == mo);
        if (k.Year is { } y) q = q.Where(x => x.CreatedAt.AddHours(Tz).Year == y);
        if (k.Id is { } id) q = q.Where(x => x.Id == id);
        if (k.Number is { } v && v % 1 == 0)
        {
            var n = (long)v;
            q = q.Where(x => x.Id == n);
        }

        foreach (var t in k.Texts)
        {
            var upper = t.ToUpperInvariant();
            ActionStatus? st = upper switch
            {
                "SUCCESS" => ActionStatus.Success,
                "FAIL" or "FAILED" => ActionStatus.Failed,
                "PENDING" or "LOADING" => ActionStatus.Pending,
                _ => null
            };

            q = q.Where(x =>
                x.Device.Name.Contains(t) ||
                x.Device.Code.Contains(t) ||
                (x.User != null && x.User.Username.Contains(t)) ||
                x.Action == upper ||
                (st != null && x.Status == st));
        }

        return q;
    }
}
