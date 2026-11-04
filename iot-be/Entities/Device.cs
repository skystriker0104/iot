namespace IotServer.Entities;

public class Device
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsOn { get; set; }
}
