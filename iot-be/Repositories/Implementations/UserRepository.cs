using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class UserRepository(AppDbContext db) : Repository<User>(db), IUserRepository
{
    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
        => Set.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
        => Set.FirstOrDefaultAsync(x => x.Username == username, ct);
}
