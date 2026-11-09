using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    // Có tracking + Include User để Service cập nhật trạng thái thu hồi
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);

    Task<List<RefreshToken>> GetActiveByUserAsync(int userId, CancellationToken ct = default);
}
