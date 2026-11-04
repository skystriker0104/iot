using IotServer.Entities;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.Users.AnyAsync())
        {
            db.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "Administrator",
                Email = "admin@iot.local",
                Role = "Admin"
            });
        }

        if (!await db.Sensors.AnyAsync())
        {
            db.Sensors.AddRange(
                new Sensor { Code = "temp", Name = "Nhiệt độ", Unit = "°C" },
                new Sensor { Code = "humidity", Name = "Độ ẩm", Unit = "%" },
                new Sensor { Code = "light", Name = "Ánh sáng", Unit = "%" });
        }

        if (!await db.Devices.AnyAsync())
        {
            db.Devices.AddRange(
                new Device { Id = 1, Code = "green", Name = "Green LED" },
                new Device { Id = 2, Code = "red", Name = "Red LED" },
                new Device { Id = 3, Code = "yellow", Name = "Yellow LED" });
        }

        await db.SaveChangesAsync();
    }
}
