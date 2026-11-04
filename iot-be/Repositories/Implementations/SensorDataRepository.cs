using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class SensorDataRepository(AppDbContext db)
    : Repository<DataSensor>(db), ISensorDataRepository
{
    public Task<DataSensor?> GetLatestBySensorAsync(int sensorId, CancellationToken ct = default)
        => Set.AsNoTracking()
              .Where(x => x.SensorId == sensorId)
              .OrderByDescending(x => x.CreatedAt)
              .FirstOrDefaultAsync(ct);

    public Task<List<DataSensor>> GetRangeAsync(
        int sensorId, DateTime from, DateTime to, CancellationToken ct = default)
        => Set.AsNoTracking()
              .Where(x => x.SensorId == sensorId && x.CreatedAt >= from && x.CreatedAt <= to)
              .OrderBy(x => x.CreatedAt)
              .ToListAsync(ct);

    public async Task<(List<DataSensor> Items, int Total)> GetPagedAsync(
        int? sensorId, DateTime? from, DateTime? to, bool sortDesc,
        int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<DataSensor> q = Set.AsNoTracking().Include(x => x.Sensor);

        if (sensorId.HasValue) q = q.Where(x => x.SensorId == sensorId.Value);
        if (from.HasValue) q = q.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(x => x.CreatedAt <= to.Value);

        var total = await q.CountAsync(ct);

        q = sortDesc
            ? q.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            : q.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }
}
