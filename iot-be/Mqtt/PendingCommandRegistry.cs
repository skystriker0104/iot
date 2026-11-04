using System.Collections.Concurrent;

namespace IotServer.Mqtt;

public class PendingCommandRegistry
{
    private readonly ConcurrentDictionary<int, TaskCompletionSource<EspStatusPayload>> _pending = new();

    // false = thiết bị này đang có lệnh chờ (service trả 409)
    public bool TryRegister(int deviceId, out Task<EspStatusPayload> task)
    {
        var tcs = new TaskCompletionSource<EspStatusPayload>(
            TaskCreationOptions.RunContinuationsAsynchronously);

        if (_pending.TryAdd(deviceId, tcs))
        {
            task = tcs.Task;
            return true;
        }

        task = null!;
        return false;
    }

    public void TryComplete(int deviceId, EspStatusPayload status)
    {
        if (_pending.TryRemove(deviceId, out var tcs))
            tcs.TrySetResult(status);
    }

    public void Remove(int deviceId) => _pending.TryRemove(deviceId, out _);
}
