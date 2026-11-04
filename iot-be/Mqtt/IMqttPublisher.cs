namespace IotServer.Mqtt;

public interface IMqttPublisher
{
    bool IsConnected { get; }
    Task PublishAsync(string topic, string payload, CancellationToken ct = default);
}
