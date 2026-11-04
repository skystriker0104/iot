# iot-server — Agent rules

Luôn áp dụng khi làm việc trong project này. Quy trình chi tiết và nghiệp vụ từng tính năng nằm trong skill `iot-server`.

## Tổng quan

- ASP.NET Core Web API (.NET 10), **1 project**, chia layer theo thư mục. Không phải Clean Architecture.
- EF Core + SQL Server, MQTTnet (BackgroundService), JWT + BCrypt, Mapperly.
- Frontend React (`../iot`) chỉ gọi REST tới BE. FE không nói chuyện trực tiếp với MQTT broker hay ESP8266.
- Luồng dữ liệu: ESP8266 ⇄ MQTT broker ⇄ BE (MqttService) ⇄ DB; FE → HTTP → BE.

## Cấu trúc thư mục

```
Controllers/    mỏng: nhận request, gọi Service, trả response
Services/       Interfaces/ + Implementations/ — chứa logic nghiệp vụ
Repositories/   Interfaces/ + Implementations/ — chỉ query dữ liệu
Mapping/        Mapperly mappers (Entity ⇄ Dto)
Mqtt/           MqttOptions, MqttService, MqttMessageHandler
Data/           AppDbContext, DbSeeder, Migrations
Entities/       User, Sensor, Device, DataSensor, ActionHistory
Dtos/           request/response riêng cho từng endpoint
Middleware/     ExceptionHandler
```

## Quy tắc layer

- Luồng gọi duy nhất: `Controller → Service → Repository → DbContext`. Không bỏ qua layer, không gọi ngược.
- **Controller**: không chứa logic, không dùng `DbContext`/Repository, không biết Entity. Chỉ làm việc với Dto.
- **Service**: nơi duy nhất chứa nghiệp vụ. Gọi Repository và `IUnitOfWork`, dùng Mapper đổi Entity sang Dto.
- **Repository**: chỉ query và add/remove. **Không** gọi `SaveChanges`, trả Entity (hoặc projection), không chứa nghiệp vụ.
- **IUnitOfWork**: có `SaveChangesAsync()`; Service gọi một lần sau khi xong cả cụm thao tác.
- **Dto**: không bao giờ trả Entity ra ngoài API. Request và response tách riêng.
- **Mapper**: Mapperly, đăng ký Singleton. List lớn (history, chart) dùng `ProjectTo` để chỉ select cột cần.

## Quy tắc code

- Mọi method I/O là `async`, nhận `CancellationToken`, hậu tố `Async`.
- DI: Repository và Service `AddScoped`; `MqttService` Singleton + `AddHostedService`; Mapper Singleton.
- BackgroundService/MQTT handler không inject `DbContext` trực tiếp. Dùng `IServiceScopeFactory.CreateScope()` cho mỗi message.
- Thời gian lưu DB là **UTC** (`DateTime.UtcNow`). Việc đổi múi giờ để FE làm.
- Lỗi trả về dạng ProblemDetails qua `ExceptionHandler` middleware. Không `try/catch` rồi nuốt lỗi trong controller.
- Danh sách luôn phân trang (`page`, `pageSize`, tối đa 100). Không trả toàn bộ bảng.
- API prefix `/api/v1/...`. Mọi controller có `[Authorize]` trừ login.
- Không hardcode: host, port, user, password, JWT secret, topic. Tất cả nằm trong `appsettings` (`Mqtt`, `Jwt`, `ConnectionStrings`).

## Nghiệp vụ cốt lõi (tóm tắt)

- Sensor: 3 loại `temp`, `humidity`, `light`. Mỗi message `sensor_data` tách thành 3 dòng `DataSensor` cùng timestamp.
- Device: 3 LED, Id **1 = green, 2 = red, 3 = yellow**, khớp `deviceId` firmware. `Device.Code` = `green` / `red` / `yellow`.
- Điều khiển LED: Pending → publish → chờ `esp_status` → Success/Failed. Chi tiết ở skill.
- Không có `CorrelationId`: ghép lệnh và phản hồi bằng `deviceId`.

## MQTT contract (không tự đổi)

| Hướng | Topic | Payload |
| --- | --- | --- |
| ESP → BE | `sensor_data` | `{"temp":28.5,"humidity":70.0,"light":45}` |
| BE → ESP | `led_control` | chuỗi thuần: `green_on`, `red_off`, `yellow_on`, `all_on`, `all_off` |
| ESP → BE | `esp_status` | `{"deviceId":1,"deviceName":"GREEN_LED","action":"ON","status":"success","state":"ON"}` |

- BE **không** subscribe `temp_data`, `humidity_data`, `light_data` (trùng với `sensor_data`).
- ClientId của BE là `iot-server`. **Không dùng `ESP8266`** vì sẽ kick client của ESP.
- Đổi topic hoặc payload nghĩa là đổi firmware ESP: phải hỏi user trước.

## Bảo mật

- Mật khẩu hash bằng BCrypt. Không log mật khẩu, token, credential MQTT.
- Credential WiFi/MQTT, JWT secret, connection string thật chỉ nằm trong `appsettings.Development.json` hoặc user-secrets, không commit.
- Đăng nhập sai trả 401 với thông báo chung, không tiết lộ là sai username hay sai mật khẩu.

## Cách làm việc với user

- Ngôn ngữ trả lời: tiếng Việt, ngắn gọn, đi thẳng vào kỹ thuật.
- Ưu tiên **hướng dẫn từng bước** để user tự làm; không tự động sửa hàng loạt file.
- **Chỉ sửa đúng phạm vi được yêu cầu.** Không refactor, không đổi tên, không thêm tính năng ngoài ý. Thấy vấn đề khác thì nói ra, không tự sửa.
- Khi giao code: đưa từng file đã thay đổi, nói rõ file nào đổi và đổi gì. Không đóng gói zip.
- Môi trường dev: không cần backup DB cho thay đổi nhỏ (ví dụ thêm cột nullable). Việc có thể mất dữ liệu (xoá bảng/cột, đổi kiểu) thì phải báo trước.
- Dùng đúng convention đã có trong project. Không thêm thư viện mới khi chưa hỏi.

## Không được làm

- Không trả Entity trong response, không đặt logic trong Controller hoặc Repository.
- Không gọi `SaveChanges` trong Repository.
- Không inject `DbContext` vào class Singleton hoặc BackgroundService.
- Không subscribe topic lẻ, không đổi MQTT contract, không dùng clientId `ESP8266`.
- Không lưu mọi message 2 giây/lần vào DB (xem throttle trong skill).
- Không commit secret hay credential.
