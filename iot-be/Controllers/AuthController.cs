using IotServer.Dtos.Auth;
using IotServer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

[Route("api/auth")]
[Route("api/v1/auth")]
public class AuthController(IAuthService auth) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
        => Ok(await auth.LoginAsync(request, ct));

    // Báo cáo mục 3.4.2: POST /api/auth/refresh
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> Refresh(RefreshTokenRequest request, CancellationToken ct)
        => Ok(await auth.RefreshAsync(request, ct));

    // Thu hồi refresh token khi đăng xuất. AllowAnonymous để vẫn logout được khi access token đã hết hạn
    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenRequest request, CancellationToken ct)
    {
        await auth.LogoutAsync(request, ct);
        return NoContent();
    }
}
