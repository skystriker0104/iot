using IotServer.Dtos.Profile;
using IotServer.Entities;
using Riok.Mapperly.Abstractions;

namespace IotServer.Mapping;

[Mapper]
public partial class ProfileMapper
{
    [MapperIgnoreSource(nameof(User.PasswordHash))]
    public partial ProfileDto ToDto(User entity);
}
