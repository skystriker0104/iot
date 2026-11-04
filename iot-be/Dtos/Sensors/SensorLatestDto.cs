namespace IotServer.Dtos.Sensors;

public class SensorLatestDto
{
    public int SensorId { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Unit { get; set; } = "";
    public double? Value { get; set; }
    public DateTime? CreatedAt { get; set; }
}
