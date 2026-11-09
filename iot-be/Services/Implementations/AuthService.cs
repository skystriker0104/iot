using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using IotServer.Data;
using IotServer.Dtos.Auth;
using IotServer.Entities;
using IotServer.Middleware;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace IotServer.Services.Implementations;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork uow,
    IOptions<JwtOptions> options,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly JwtOptions _jwt = options.Value;

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByUsernameAsync(request.Username, ct);

        // Thông báo chung, không lộ là sai username hay sai mật khẩu
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new AppException(StatusCodes.Status401Unauthorized, "Sai tên đăng nhập hoặc mật khẩu");

        var (refresh, refreshEntity) = NewRefreshToken(user.Id);
        await refreshTokens.AddAsync(refreshEntity, ct);
        await uow.SaveChangesAsync(ct);

        return BuildResponse(user, refresh, refreshEntity.ExpiresAt);
    }

    // Token rotation: mỗi refresh token chỉ dùng được 1 lần
    public async Task<LoginResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var stored = await refreshTokens.GetByTokenHashAsync(Hash(request.RefreshToken), ct)
            ?? throw new AppException(StatusCodes.Status401Unauthorized, "Refresh token không hợp lệ");

        if (stored.IsRevoked)
        {
            // Token đã bị thay thế mà vẫn được gửi lại → nghi lộ token, thu hồi toàn bộ phiên của user
            if (stored.ReplacedByToken is not null)
            {
                logger.LogWarning("Phát hiện dùng lại refresh token của user {UserId}, thu hồi mọi phiên", stored.UserId);
                foreach (var t in await refreshTokens.GetActiveByUserAsync(stored.UserId, ct))
                    Revoke(t, null);
                await uow.SaveChangesAsync(ct);
            }
            throw new AppException(StatusCodes.Status401Unauthorized, "Refresh token đã bị thu hồi");
        }

        if (stored.ExpiresAt <= DateTime.UtcNow)
            throw new AppException(StatusCodes.Status401Unauthorized, "Refresh token đã hết hạn");

        var (refresh, refreshEntity) = NewRefreshToken(stored.UserId);
        Revoke(stored, refreshEntity.Token);
        await refreshTokens.AddAsync(refreshEntity, ct);
        await uow.SaveChangesAsync(ct);

        return BuildResponse(stored.User, refresh, refreshEntity.ExpiresAt);
    }

    public async Task LogoutAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var stored = await refreshTokens.GetByTokenHashAsync(Hash(request.RefreshToken), ct);
        if (stored is null || stored.IsRevoked) return;

        Revoke(stored, null);
        await uow.SaveChangesAsync(ct);
    }

    private LoginResponse BuildResponse(User user, string refreshToken, DateTime refreshExpiresAt)
    {
        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpireMinutes);

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim("sub", user.Id.ToString()),
                new Claim("name", user.Username),
                new Claim("role", user.Role)
            ]),
            Issuer = _jwt.Issuer,
            Audience = _jwt.Audience,
            Expires = expires,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key)),
                SecurityAlgorithms.HmacSha256)
        };

        return new LoginResponse
        {
            AccessToken = new JsonWebTokenHandler().CreateToken(descriptor),
            ExpiresAt = expires,
            RefreshToken = refreshToken,
            RefreshExpiresAt = refreshExpiresAt
        };
    }

    private (string Raw, RefreshToken Entity) NewRefreshToken(int userId)
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        return (raw, new RefreshToken
        {
            UserId = userId,
            Token = Hash(raw),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshExpireDays)
        });
    }

    private static void Revoke(RefreshToken token, string? replacedByHash)
    {
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.ReplacedByToken = replacedByHash;
    }

    private static string Hash(string raw)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
