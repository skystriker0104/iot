namespace IotServer.Mqtt;

public class SensorPayload
{
    public double? Temp { get; set; }
    public double? Humidity { get; set; }
    public double? Light { get; set; }
}

public class EspStatusPayload
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = "";
    public string Action { get; set; } = "";
    public string Status { get; set; } = "";
    public string State { get; set; } = "";
}
