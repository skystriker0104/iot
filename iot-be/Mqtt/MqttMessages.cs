using System.Text.Json.Serialization;

namespace IotServer.Mqtt;

// Payload firmware gửi lên topic {BaseTopic}/sensors
public class SensorPayload
{
    [JsonPropertyName("temperature")] public double? Temp { get; set; }
    [JsonPropertyName("humidity")] public double? Humidity { get; set; }

    // Giá trị ADC thô của LDR (analogRead A0: 0..1023)
    [JsonPropertyName("light")] public double? Light { get; set; }
}

// Kết quả chờ lệnh điều khiển. Firmware chỉ gửi chuỗi "ON"/"OFF" trên topic status,
// BE tự dựng object này để trả cho DeviceService và SignalR.
public class EspStatusPayload
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = "";
    public string Action { get; set; } = "";
    public string Status { get; set; } = "";
    public string State { get; set; } = "";
}
