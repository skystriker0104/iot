using System.ComponentModel.DataAnnotations;

namespace IotServer.Dtos.Auth;

public class RefreshTokenRequest
{
    [Required] public string RefreshToken { get; set; } = "";
}
