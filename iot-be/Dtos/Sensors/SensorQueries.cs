using System.ComponentModel.DataAnnotations;

namespace IotServer.Dtos.Sensors;

public class ChartDataQuery
{
    [Range(1, int.MaxValue)] public int SensorId { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    [Range(10, 2000)] public int MaxPoints { get; set; } = 500;
}

public class SensorHistoryQuery
{
    public int? SensorId { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
    public bool SortDesc { get; set; } = true;
}
