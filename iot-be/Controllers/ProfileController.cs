using IotServer.Dtos.Profile;
using IotServer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

[Route("api/profile")]
[Route("api/v1/profile")]
public class ProfileController(IProfileService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ProfileDto>> Get(CancellationToken ct)
        => Ok(await service.GetAsync(UserId, ct));

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> Update(UpdateProfileRequest request, CancellationToken ct)
        => Ok(await service.UpdateAsync(UserId, request, ct));

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        await service.ChangePasswordAsync(UserId, request, ct);
        return NoContent();
    }
}
