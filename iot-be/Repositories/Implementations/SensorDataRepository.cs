using IotServer.Data;
using IotServer.Dtos.Common;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class SensorDataRepository(AppDbContext db)
    : Repository<DataSensor>(db), ISensorDataRepository
{
    private const int Tz = SearchKeyword.LocalOffsetHours;

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
        int? sensorId, string? sensorCode, DateTime? from, DateTime? to, SearchKeyword? keyword,
        bool sortDesc, int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<DataSensor> q = Set.AsNoTracking().Include(x => x.Sensor);

        if (sensorId.HasValue) q = q.Where(x => x.SensorId == sensorId.Value);
        if (!string.IsNullOrEmpty(sensorCode)) q = q.Where(x => x.Sensor.Code == sensorCode);
        if (from.HasValue) q = q.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(x => x.CreatedAt <= to.Value);
        if (keyword is not null) q = ApplyKeyword(q, keyword);

        var total = await q.CountAsync(ct);

        q = sortDesc
            ? q.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            : q.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    private static IQueryable<DataSensor> ApplyKeyword(IQueryable<DataSensor> q, SearchKeyword k)
    {
        if (k.Hour is { } h) q = q.Where(x => x.CreatedAt.AddHours(Tz).Hour == h);
        if (k.Minute is { } mi) q = q.Where(x => x.CreatedAt.AddHours(Tz).Minute == mi);
        if (k.Second is { } s) q = q.Where(x => x.CreatedAt.AddHours(Tz).Second == s);
        if (k.Day is { } d) q = q.Where(x => x.CreatedAt.AddHours(Tz).Day == d);
        if (k.Month is { } mo) q = q.Where(x => x.CreatedAt.AddHours(Tz).Month == mo);
        if (k.Year is { } y) q = q.Where(x => x.CreatedAt.AddHours(Tz).Year == y);
        if (k.Id is { } id) q = q.Where(x => x.Id == id);

        if (k.Number is { } v)
        {
            // Số nhập vào khớp Id hoặc giá trị đo (sai số ±0.05)
            long? asId = v % 1 == 0 ? (long)v : null;
            q = q.Where(x => x.Id == asId || (x.Value >= v - 0.05 && x.Value < v + 0.05));
        }

        foreach (var t in k.Texts)
            q = q.Where(x => x.Sensor.Name.Contains(t) || x.Sensor.Code.Contains(t) || x.Sensor.Unit.Contains(t));

        return q;
    }
}
