using IotServer.Dtos.Sensors;
using IotServer.Entities;
using Riok.Mapperly.Abstractions;

namespace IotServer.Mapping;

[Mapper]
public partial class SensorMapper
{
    // SensorCode/SensorName/SensorUnit được Mapperly tự flatten từ Sensor.Code/Name/Unit
    public partial SensorDataDto ToDto(DataSensor entity);
    public partial List<SensorDataDto> ToDtos(List<DataSensor> entities);

    [MapperIgnoreSource(nameof(DataSensor.Id))]
    [MapperIgnoreSource(nameof(DataSensor.SensorId))]
    [MapperIgnoreSource(nameof(DataSensor.Sensor))]
    public partial ChartPointDto ToChartPoint(DataSensor entity);
    public partial List<ChartPointDto> ToChartPoints(List<DataSensor> entities);
}
