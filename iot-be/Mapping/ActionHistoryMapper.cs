using IotServer.Dtos.History;
using IotServer.Entities;
using Riok.Mapperly.Abstractions;

namespace IotServer.Mapping;

[Mapper]
public partial class ActionHistoryMapper
{
    // DeviceCode/DeviceName tự flatten từ Device.Code/Name; Status enum tự map sang chuỗi
    [MapProperty("User.Username", nameof(ActionHistoryDto.Username))]
    public partial ActionHistoryDto ToDto(ActionHistory entity);

    public partial List<ActionHistoryDto> ToDtos(List<ActionHistory> entities);
}
