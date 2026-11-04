using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class SensorRepository(AppDbContext db) : Repository<Sensor>(db), ISensorRepository
{
    public Task<List<Sensor>> GetAllAsync(CancellationToken ct = default)
        => Set.AsNoTracking().OrderBy(x => x.Id).ToListAsync(ct);

    public Task<Sensor?> GetByIdAsync(int id, CancellationToken ct = default)
        => Set.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<Sensor?> GetByCodeAsync(string code, CancellationToken ct = default)
        => Set.AsNoTracking().FirstOrDefaultAsync(x => x.Code == code, ct);
}
