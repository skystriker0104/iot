using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface IDeviceRepository : IRepository<Device>
{
    Task<List<Device>> GetAllAsync(CancellationToken ct = default);
    Task<Device?> GetByIdAsync(int id, CancellationToken ct = default);
}
