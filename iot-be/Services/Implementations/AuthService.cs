using System.Security.Claims;
using System.Text;
using IotServer.Dtos.Auth;
using IotServer.Middleware;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace IotServer.Services.Implementations;

public class AuthService(IUserRepository users, IOptions<JwtOptions> options) : IAuthService
{
    private readonly JwtOptions _jwt = options.Value;

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByUsernameAsync(request.Username, ct);

        // Thông báo chung, không lộ là sai username hay sai mật khẩu
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new AppException(StatusCodes.Status401Unauthorized, "Sai tên đăng nhập hoặc mật khẩu");

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

        var token = new JsonWebTokenHandler().CreateToken(descriptor);

        return new LoginResponse { Token = token, ExpiresAt = expires };
    }
}
