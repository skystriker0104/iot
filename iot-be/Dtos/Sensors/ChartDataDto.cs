namespace IotServer.Dtos.Sensors;

public class ChartPointDto
{
    public DateTime CreatedAt { get; set; }
    public double Value { get; set; }
}

public class ChartDataDto
{
    public int SensorId { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Unit { get; set; } = "";
    public List<ChartPointDto> Points { get; set; } = [];
}
