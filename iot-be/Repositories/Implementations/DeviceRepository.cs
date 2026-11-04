using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class DeviceRepository(AppDbContext db) : Repository<Device>(db), IDeviceRepository
{
    public Task<List<Device>> GetAllAsync(CancellationToken ct = default)
        => Set.AsNoTracking().OrderBy(x => x.Id).ToListAsync(ct);

    public Task<Device?> GetByIdAsync(int id, CancellationToken ct = default)
        => Set.FirstOrDefaultAsync(x => x.Id == id, ct);
}
