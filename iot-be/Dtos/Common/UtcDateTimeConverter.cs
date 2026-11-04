using System.Text.Json;
using System.Text.Json.Serialization;

namespace IotServer.Dtos.Common;

// Mọi DateTime trong DB và cache đều là UTC, nên luôn ghi ra kèm "Z"
public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => reader.GetDateTime();

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString("yyyy-MM-ddTHH:mm:ss.fff+07:00"));
}
