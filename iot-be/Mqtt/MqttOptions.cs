namespace IotServer.Mqtt;

public class MqttOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1883;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string ClientId { get; set; } = "iot-server";
    public string SensorTopic { get; set; } = "sensor_data";
    public string StatusTopic { get; set; } = "esp_status";
    public string ControlTopic { get; set; } = "led_control";
    public int SensorSaveIntervalSeconds { get; set; } = 10;
    public int ControlTimeoutSeconds { get; set; } = 5;
}
