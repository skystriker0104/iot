using System.ComponentModel.DataAnnotations;
using IotServer.Entities;

namespace IotServer.Dtos.History;

public class ActionHistoryDto
{
    public long Id { get; set; }
    public int DeviceId { get; set; }
    public string DeviceCode { get; set; } = "";
    public string DeviceName { get; set; } = "";
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
}

public class ActionHistoryQuery
{
    public int? DeviceId { get; set; }
    public ActionStatus? Status { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
}
