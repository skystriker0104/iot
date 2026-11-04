using System.ComponentModel.DataAnnotations;

namespace IotServer.Dtos.Auth;

public class LoginRequest
{
    [Required] public string Username { get; set; } = "";
    [Required] public string Password { get; set; } = "";
}
