using System.Globalization;
using System.Text.RegularExpressions;

namespace IotServer.Dtos.Common;

// Phân tích ô tìm kiếm của FE thành các tiêu chí lọc. Mỗi token (cách nhau bởi khoảng trắng) là một điều kiện AND:
//   "20:15", "20:15:00", "20h", "20h15" → giờ/phút/giây (giờ Việt Nam)
//   "22/09", "22/09/2026"              → ngày/tháng/năm (giờ Việt Nam)
//   "#S12", "#H5", "12"                → Id (số thực/nguyên còn khớp theo giá trị đo)
//   chữ khác                           → tìm theo tên/mã
public partial class SearchKeyword
{
    // DB lưu UTC, người dùng nhập giờ Việt Nam
    public const int LocalOffsetHours = 7;

    public int? Hour { get; private set; }
    public int? Minute { get; private set; }
    public int? Second { get; private set; }
    public int? Day { get; private set; }
    public int? Month { get; private set; }
    public int? Year { get; private set; }
    public long? Id { get; private set; }
    public double? Number { get; private set; }
    public List<string> Texts { get; } = [];

    public static SearchKeyword? Parse(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        var k = new SearchKeyword();
        foreach (var token in input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (k.TryTime(token) || k.TryDate(token) || k.TryId(token) || k.TryNumber(token)) continue;
            k.Texts.Add(token);
        }
        return k;
    }

    private bool TryTime(string t)
    {
        var m = TimeRegex().Match(t);
        if (!m.Success) m = HourRegex().Match(t);
        if (!m.Success) return false;

        int? Part(int i) => m.Groups[i].Success ? int.Parse(m.Groups[i].Value) : null;
        int h = Part(1)!.Value; int? mi = Part(2), s = Part(3);
        if (h > 23 || mi > 59 || s > 59) return false;

        (Hour, Minute, Second) = (h, mi, s);
        return true;
    }

    private bool TryDate(string t)
    {
        var m = DateRegex().Match(t);
        if (!m.Success) return false;

        int d = int.Parse(m.Groups[1].Value), mo = int.Parse(m.Groups[2].Value);
        if (d is < 1 or > 31 || mo is < 1 or > 12) return false;

        (Day, Month) = (d, mo);
        if (m.Groups[3].Success) Year = int.Parse(m.Groups[3].Value);
        return true;
    }

    private bool TryId(string t)
    {
        var m = IdRegex().Match(t);
        if (!m.Success) return false;
        Id = long.Parse(m.Groups[1].Value);
        return true;
    }

    private bool TryNumber(string t)
    {
        if (!double.TryParse(t, NumberStyles.Float, CultureInfo.InvariantCulture, out var v)) return false;
        Number = v;
        return true;
    }

    [GeneratedRegex(@"^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$")] private static partial Regex TimeRegex();
    [GeneratedRegex(@"^(\d{1,2})[hH](\d{1,2})?$")] private static partial Regex HourRegex();
    [GeneratedRegex(@"^(\d{1,2})/(\d{1,2})(?:/(\d{4}))?$")] private static partial Regex DateRegex();
    [GeneratedRegex(@"^#[A-Za-z]?(\d+)$")] private static partial Regex IdRegex();
}
