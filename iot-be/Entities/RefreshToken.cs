namespace IotServer.Entities;

// Bảng RefreshTokens (Báo cáo mục 3.2). Token lưu dạng hash SHA-256, không lưu bản gốc.
public class RefreshToken
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
}
