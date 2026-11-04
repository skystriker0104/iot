using System.ComponentModel.DataAnnotations;

namespace IotServer.Dtos.Devices;

public class DeviceDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsOn { get; set; }
}

public class ControlDeviceRequest
{
    [Range(1, int.MaxValue)] public int DeviceId { get; set; }

    [Required]
    [RegularExpression("(?i)^(on|off|turn_on|turn_off)$", ErrorMessage = "Action chỉ nhận ON hoặc OFF")]
    public string Action { get; set; } = "";
}

public class ControlDeviceCommandBody
{
    [Required]
    [RegularExpression("(?i)^(on|off|turn_on|turn_off)$", ErrorMessage = "Action chỉ nhận ON hoặc OFF")]
    public string Action { get; set; } = "";
}

public class ControlDeviceResponse
{
    public int DeviceId { get; set; }
    public string Action { get; set; } = "";
    public string Status { get; set; } = "";
    public string State { get; set; } = "";
}
