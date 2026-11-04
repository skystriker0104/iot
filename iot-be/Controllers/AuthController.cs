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
}
