namespace IotServer.Dtos.Sensors;

public class SensorDataDto
{
    public long Id { get; set; }
    public int SensorId { get; set; }
    public string SensorCode { get; set; } = "";
    public string SensorName { get; set; } = "";
    public string SensorUnit { get; set; } = "";
    public double Value { get; set; }
    public DateTime CreatedAt { get; set; }
}
