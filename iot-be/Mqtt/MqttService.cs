using System.Text;
using MQTTnet;
using MQTTnet.Protocol;
using Microsoft.Extensions.Options;

namespace IotServer.Mqtt;

public class MqttService : BackgroundService, IMqttPublisher
{
    private readonly MqttOptions _opt;
    private readonly MqttMessageHandler _handler;
    private readonly ILogger<MqttService> _logger;
    private readonly IMqttClient _client;

    public MqttService(IOptions<MqttOptions> options, MqttMessageHandler handler, ILogger<MqttService> logger)
    {
        _opt = options.Value;
        _handler = handler;
        _logger = logger;

        _client = new MqttClientFactory().CreateMqttClient();
        _client.ApplicationMessageReceivedAsync += OnMessageAsync;
    }

    public bool IsConnected => _client.IsConnected;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var builder = new MqttClientOptionsBuilder()
            .WithTcpServer(_opt.Host, _opt.Port)
            .WithClientId(_opt.ClientId)
            .WithCleanSession()
            .WithTimeout(TimeSpan.FromSeconds(5));

        if (!string.IsNullOrEmpty(_opt.Username))
            builder.WithCredentials(_opt.Username, _opt.Password);

        var clientOptions = builder.Build();

        // Vòng lặp: mỗi 5 giây kiểm tra, mất kết nối thì connect + subscribe lại
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!_client.IsConnected)
                {
                    _logger.LogInformation("MQTT đang kết nối tới {Host}:{Port}...", _opt.Host, _opt.Port);
                    await _client.ConnectAsync(clientOptions, stoppingToken);
                    await SubscribeAsync(stoppingToken);
                    _logger.LogInformation("MQTT đã kết nối {Host}:{Port}", _opt.Host, _opt.Port);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("MQTT kết nối thất bại, thử lại sau 5 giây: {Message}", ex.Message);
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        if (_client.IsConnected)
            await _client.DisconnectAsync(cancellationToken: CancellationToken.None);
    }

    private Task SubscribeAsync(CancellationToken ct)
    {
        var sub = new MqttClientSubscribeOptionsBuilder()
            .WithTopicFilter(_opt.SensorTopic)
            .WithTopicFilter(_opt.StatusTopic)
            .Build();

        return _client.SubscribeAsync(sub, ct);
    }

    private Task OnMessageAsync(MqttApplicationMessageReceivedEventArgs e)
    {
        var payload = e.ApplicationMessage.Payload.Length > 0
            ? Encoding.UTF8.GetString(e.ApplicationMessage.Payload)
            : string.Empty;

        return _handler.HandleAsync(e.ApplicationMessage.Topic, payload);
    }

    public async Task PublishAsync(string topic, string payload, CancellationToken ct = default)
    {
        if (!_client.IsConnected)
            throw new InvalidOperationException("MQTT chưa kết nối tới broker");

        var message = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payload)
            .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
            .Build();

        await _client.PublishAsync(message, ct);
    }

    public override void Dispose()
    {
        _client.Dispose();
        base.Dispose();
    }
}
