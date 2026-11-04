using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Controllers;

[ApiController]
[Authorize]
public abstract class ApiControllerBase : ControllerBase
{
    // claim "sub" do AuthService phát ra
    protected int UserId => int.Parse(User.FindFirst("sub")!.Value);
}
