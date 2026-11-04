using IotServer.Dtos.Common;
using IotServer.Dtos.Sensors;
using IotServer.Mapping;
using IotServer.Middleware;
using IotServer.Mqtt;
using IotServer.Repositories.Interfaces;
using IotServer.Services.Interfaces;

namespace IotServer.Services.Implementations;

public class SensorService(
    ISensorRepository sensors,
    ISensorDataRepository sensorData,
    LatestSensorCache cache,
    SensorMapper mapper) : ISensorService
{
    private static readonly TimeSpan MaxChartRange = TimeSpan.FromHours(24);

    public async Task<List<SensorLatestDto>> GetLatestAsync(CancellationToken ct = default)
    {
        var all = await sensors.GetAllAsync(ct);
        var cached = cache.GetAll();
        var result = new List<SensorLatestDto>();

        foreach (var s in all)
        {
            double? value = null;
            DateTime? at = null;

            if (cached.TryGetValue(s.Code, out var reading))
            {
                value = reading.Value;
                at = reading.CreatedAt;
            }
            else
            {
                // Cache trống (vừa khởi động lại BE): lấy bản ghi mới nhất từ DB
                var last = await sensorData.GetLatestBySensorAsync(s.Id, ct);
                if (last is not null)
                {
                    value = last.Value;
                    at = last.CreatedAt;
                }
            }

            result.Add(new SensorLatestDto
            {
                SensorId = s.Id,
                Code = s.Code,
                Name = s.Name,
                Unit = s.Unit,
                Value = value,
                CreatedAt = at
            });
        }

        return result;
    }

    public async Task<ChartDataDto> GetChartDataAsync(ChartDataQuery query, CancellationToken ct = default)
    {
        var sensor = await sensors.GetByIdAsync(query.SensorId, ct)
            ?? throw new AppException(StatusCodes.Status404NotFound, "Không tìm thấy cảm biến");

        var to = query.To?.UtcDateTime ?? DateTime.UtcNow;
        var from = query.From?.UtcDateTime ?? to.AddHours(-1);

        if (from >= to)
            throw new AppException(StatusCodes.Status400BadRequest, "from phải nhỏ hơn to");
        if (to - from > MaxChartRange)
            throw new AppException(StatusCodes.Status400BadRequest, "Khoảng thời gian tối đa là 24 giờ");

        var items = await sensorData.GetRangeAsync(sensor.Id, from, to, ct);

        // Downsample đơn giản: lấy mỗi N điểm để không vượt MaxPoints
        if (items.Count > query.MaxPoints)
        {
            var step = (int)Math.Ceiling(items.Count / (double)query.MaxPoints);
            items = items.Where((_, i) => i % step == 0).ToList();
        }

        return new ChartDataDto
        {
            SensorId = sensor.Id,
            Code = sensor.Code,
            Name = sensor.Name,
            Unit = sensor.Unit,
            Points = mapper.ToChartPoints(items)
        };
    }

    public async Task<PagedResult<SensorDataDto>> GetHistoryAsync(
        SensorHistoryQuery query, CancellationToken ct = default)
    {
        var (items, total) = await sensorData.GetPagedAsync(
            query.SensorId,
            query.From?.UtcDateTime,
            query.To?.UtcDateTime,
            query.SortDesc,
            query.Page,
            query.PageSize,
            ct);

        return new PagedResult<SensorDataDto>
        {
            Items = mapper.ToDtos(items),
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total
        };
    }
}
