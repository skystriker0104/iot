using IotServer.Dtos.Profile;

namespace IotServer.Services.Interfaces;

public interface IProfileService
{
    Task<ProfileDto> GetAsync(int userId, CancellationToken ct = default);
    Task<ProfileDto> UpdateAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken ct = default);
}
