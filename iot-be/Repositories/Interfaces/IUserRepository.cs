using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
}
