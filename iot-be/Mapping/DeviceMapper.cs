using IotServer.Dtos.Devices;
using IotServer.Entities;
using Riok.Mapperly.Abstractions;

namespace IotServer.Mapping;

[Mapper]
public partial class DeviceMapper
{
    public partial DeviceDto ToDto(Device entity);
    public partial List<DeviceDto> ToDtos(List<Device> entities);
}
