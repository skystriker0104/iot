using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace IotServer.Hubs;

// Chỉ server push sự kiện (ReceiveSensorData, ReceiveNewSensorRecords, ReceiveDeviceStatus).
// Client phải gửi JWT qua query ?access_token= khi kết nối.
[Authorize]
public class IotHub : Hub
{
}
