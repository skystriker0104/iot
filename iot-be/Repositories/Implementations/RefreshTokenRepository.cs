using IotServer.Data;
using IotServer.Entities;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class RefreshTokenRepository(AppDbContext db)
    : Repository<RefreshToken>(db), IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        => Set.Include(x => x.User).FirstOrDefaultAsync(x => x.Token == tokenHash, ct);

    public Task<List<RefreshToken>> GetActiveByUserAsync(int userId, CancellationToken ct = default)
        => Set.Where(x => x.UserId == userId && !x.IsRevoked).ToListAsync(ct);
}
