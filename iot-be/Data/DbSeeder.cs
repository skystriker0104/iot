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
                FullName = "Nguyễn Văn An",
                Email = "admin@iot.local",
                Role = "Admin"
            });
        }
        else
        {
            var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (adminUser != null && adminUser.FullName != "Nguyễn Văn An")
            {
                adminUser.FullName = "Nguyễn Văn An";
            }
        }

        if (!await db.Sensors.AnyAsync())
        {
            db.Sensors.AddRange(
                new Sensor { Code = "temp", Name = "Nhiệt độ", Unit = "°C" },
                new Sensor { Code = "humidity", Name = "Độ ẩm", Unit = "%" },
                new Sensor { Code = "light", Name = "Ánh sáng", Unit = "%" });
        }

        // Device.Code khớp segment topic firmware: iot/esp8266_01/{code}/set|status
        var ledSeeds = new[]
        {
            new Device { Id = 1, Code = "led1", Name = "LED 1" },
            new Device { Id = 2, Code = "led2", Name = "LED 2" },
            new Device { Id = 3, Code = "led3", Name = "LED 3" }
        };

        var existing = await db.Devices.ToDictionaryAsync(d => d.Id);
        foreach (var seed in ledSeeds)
        {
            if (!existing.TryGetValue(seed.Id, out var dev))
            {
                db.Devices.Add(seed);
            }
            else if (dev.Code != seed.Code)
            {
                // DB cũ dùng green/red/yellow → đổi sang led1/led2/led3
                dev.Code = seed.Code;
                dev.Name = seed.Name;
            }
        }

        await db.SaveChangesAsync();
    }
}
