using IotServer.Dtos.Common;
using IotServer.Dtos.Sensors;

namespace IotServer.Services.Interfaces;

public interface ISensorService
{
    Task<List<SensorLatestDto>> GetLatestAsync(CancellationToken ct = default);
    Task<ChartDataDto> GetChartDataAsync(ChartDataQuery query, CancellationToken ct = default);
    Task<PagedResult<SensorDataDto>> GetHistoryAsync(SensorHistoryQuery query, CancellationToken ct = default);
}
