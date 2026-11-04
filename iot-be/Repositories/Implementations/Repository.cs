using IotServer.Data;
using IotServer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IotServer.Repositories.Implementations;

public class Repository<T>(AppDbContext db) : IRepository<T> where T : class
{
    protected readonly AppDbContext Db = db;
    protected DbSet<T> Set => Db.Set<T>();

    public async Task AddAsync(T entity, CancellationToken ct = default)
        => await Set.AddAsync(entity, ct);

    public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default)
        => await Set.AddRangeAsync(entities, ct);

    public void Remove(T entity) => Set.Remove(entity);
}
