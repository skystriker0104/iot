using IotServer.Dtos.Common;
using IotServer.Entities;

namespace IotServer.Repositories.Interfaces;

public interface ISensorDataRepository : IRepository<DataSensor>
{
    Task<DataSensor?> GetLatestBySensorAsync(int sensorId, CancellationToken ct = default);

    Task<List<DataSensor>> GetRangeAsync(
        int sensorId, DateTime from, DateTime to, CancellationToken ct = default);

    Task<(List<DataSensor> Items, int Total)> GetPagedAsync(
        int? sensorId, string? sensorCode, DateTime? from, DateTime? to, SearchKeyword? keyword,
        bool sortDesc, int page, int pageSize, CancellationToken ct = default);
}
