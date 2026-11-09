namespace IotServer.Entities;

public class ActionHistory
{
    public long Id { get; set; }
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int? UserId { get; set; }
    public User? User { get; set; }
    public string Action { get; set; } = "";
    public ActionStatus Status { get; set; } = ActionStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }
}
