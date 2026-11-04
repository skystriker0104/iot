using Microsoft.AspNetCore.SignalR;
using IotServer.Dtos.Sensors;

namespace IotServer.Hubs;

public class IotHub : Hub
{
    // Broadcast tin nhắn chung giữa các client
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    // Client đăng ký vào nhóm nhận dữ liệu cảm biến
    public async Task JoinSensorGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "SensorSubscribers");
    }

    // Client rời nhóm nhận dữ liệu cảm biến
    public async Task LeaveSensorGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SensorSubscribers");
    }
}
