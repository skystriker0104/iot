using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface ISensorRepository : IRepository<Sensor>
{
    Task<List<Sensor>> GetAllAsync(CancellationToken ct = default);
    Task<Sensor?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Sensor?> GetByCodeAsync(string code, CancellationToken ct = default);
}
