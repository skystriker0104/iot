using IotServer.Data;
using IotServer.Dtos.Profile;
using IotServer.Entities;
using IotServer.Mapping;
using IotServer.Middleware;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;

namespace IotServer.Services.Implementations;

public class ProfileService(IUserRepository users, IUnitOfWork uow, ProfileMapper mapper) : IProfileService
{
    public async Task<ProfileDto> GetAsync(int userId, CancellationToken ct = default)
        => mapper.ToDto(await GetUserAsync(userId, ct));

    public async Task<ProfileDto> UpdateAsync(
        int userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await GetUserAsync(userId, ct);

        user.FullName = request.FullName.Trim();
        user.Email = request.Email.Trim();

        await uow.SaveChangesAsync(ct);
        return mapper.ToDto(user);
    }

    public async Task ChangePasswordAsync(
        int userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await GetUserAsync(userId, ct);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException(StatusCodes.Status400BadRequest, "Mật khẩu hiện tại không đúng");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await uow.SaveChangesAsync(ct);
    }

    private async Task<User> GetUserAsync(int userId, CancellationToken ct)
        => await users.GetByIdAsync(userId, ct)
           ?? throw new AppException(StatusCodes.Status404NotFound, "Không tìm thấy người dùng");
}
