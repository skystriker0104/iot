using IotServer.Entities;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Sensor> Sensors => Set<Sensor>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DataSensor> DataSensors => Set<DataSensor>();
    public DbSet<ActionHistory> ActionHistories => Set<ActionHistory>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.Property(x => x.Username).HasMaxLength(50);
            e.Property(x => x.PasswordHash).HasMaxLength(100);
            e.Property(x => x.FullName).HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(100);
            e.Property(x => x.Role).HasMaxLength(20);
            e.HasIndex(x => x.Username).IsUnique();
        });

        b.Entity<Sensor>(e =>
        {
            e.Property(x => x.Code).HasMaxLength(20);
            e.Property(x => x.Name).HasMaxLength(50);
            e.Property(x => x.Unit).HasMaxLength(10);
            e.HasIndex(x => x.Code).IsUnique();
        });

        b.Entity<Device>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Code).HasMaxLength(20);
            e.Property(x => x.Name).HasMaxLength(50);
            e.HasIndex(x => x.Code).IsUnique();
        });

        b.Entity<DataSensor>(e =>
        {
            e.HasOne(x => x.Sensor).WithMany().HasForeignKey(x => x.SensorId);
            e.HasIndex(x => new { x.SensorId, x.CreatedAt });
        });

        b.Entity<ActionHistory>(e =>
        {
            e.Property(x => x.Action).HasMaxLength(10);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.Device).WithMany().HasForeignKey(x => x.DeviceId);
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => new { x.DeviceId, x.Status });
            e.HasIndex(x => x.CreatedAt);
        });
    }
}
