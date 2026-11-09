namespace IotServer.Mqtt;

public class MqttOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1883;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string ClientId { get; set; } = "iot-server";

    // Prefix topic khớp firmware: iot/<device_id>
    public string BaseTopic { get; set; } = "iot/esp8266_01";

    public int SensorSaveIntervalSeconds { get; set; } = 10;
    public int ControlTimeoutSeconds { get; set; } = 5;

    // ESP → BE: {"temperature":28.5,"humidity":70.0,"light":512}
    public string SensorTopic => $"{BaseTopic}/sensors";

    // ESP → BE: iot/esp8266_01/led1/status, payload "ON" | "OFF" (retained)
    public string StatusTopicFilter => $"{BaseTopic}/+/status";

    // BE → ESP: iot/esp8266_01/led1/set, payload "ON" | "OFF"
    public string ControlTopic(string deviceCode) => $"{BaseTopic}/{deviceCode}/set";

    // Trả về device code (led1, led2, led3) nếu topic là topic trạng thái, ngược lại null
    public string? ParseStatusDeviceCode(string topic)
    {
        var prefix = BaseTopic + "/";
        const string suffix = "/status";
        if (!topic.StartsWith(prefix, StringComparison.Ordinal) || !topic.EndsWith(suffix, StringComparison.Ordinal))
            return null;

        var code = topic[prefix.Length..^suffix.Length];
        return code.Length > 0 && !code.Contains('/') ? code : null;
    }
}
