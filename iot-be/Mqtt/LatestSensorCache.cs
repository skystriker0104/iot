using System.Collections.Concurrent;

namespace IotServer.Mqtt;

public record SensorReading(double Value, DateTime CreatedAt);

public class LatestSensorCache
{
    private readonly ConcurrentDictionary<string, SensorReading> _items = new();

    public void Set(string code, double value, DateTime at)
        => _items[code] = new SensorReading(value, at);

    public Dictionary<string, SensorReading> GetAll()
        => _items.ToDictionary(x => x.Key, x => x.Value);
}
