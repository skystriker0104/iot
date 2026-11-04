# Kế hoạch BE iot-server theo firmware ESP8266

Oct 15, 2026 · @Tu

## Giao thức thật của ESP

ESP8266 dùng 5 topic với payload JSON đơn giản, riêng lệnh điều khiển là chuỗi thuần, nên BE phải khớp theo firmware và không cần sửa code ESP.

| Hướng | Topic | Payload |
| --- | --- | --- |
| ESP → BE | `sensor_data` | `{"temp":28.5,"humidity":70.0,"light":45}`, 2 giây/lần, chỉ gửi khi DHT đọc được |
| ESP → BE | `temp_data`, `humidity_data`, `light_data` | trùng với `sensor_data`, tách lẻ từng giá trị |
| BE → ESP | `led_control` | chuỗi thuần, không phải JSON: `green_on`, `red_off`, `yellow_on`, `all_on`, `all_off` |
| ESP → BE | `esp_status` | `{"deviceId":1,"deviceName":"GREEN_LED","action":"ON","status":"success","state":"ON"}` |

- `deviceId`: 1 = green, 2 = red, 3 = yellow.
- `all_on` / `all_off` làm ESP bắn 3 message `esp_status` liên tiếp.
- Lệnh lạ thì ESP trả `deviceId = 0`, `status = failed`.

## Những chỗ phải đổi so với kế hoạch cũ

Có 4 chỗ lệch giữa kế hoạch cũ và firmware thật: broker, cách lưu sensor, luồng điều khiển và trạng thái LED.

### 1. Topic và broker

- BE chỉ subscribe `sensor_data` và `esp_status`, bỏ qua 3 topic lẻ, không thì mỗi lần đo lưu trùng 2 lần.
- BE publish lệnh lên `led_control`.
- Broker là máy trong LAN (`192.168.67.41:34215`) có user/password, không phải EMQX công cộng, nên không cần đặt prefix topic nữa.
- `MqttOptions` thêm Username và Password.
- ClientId của BE phải khác `ESP8266` (ví dụ `iot-server`). Trùng clientId thì broker đá client cũ ra, hai bên kick nhau liên tục.
- IP và credential để trong `appsettings.Development.json` hoặc user-secrets, không push git. IP hotspot điện thoại có thể đổi mỗi lần kết nối.

### 2. Lưu dữ liệu sensor

- Mỗi message `sensor_data` tách thành 3 dòng `DataSensor` (temp, humidity, light) cùng một timestamp.
- ESP bắn mỗi 2 giây, tức khoảng 130k dòng/ngày, nên throttle ngay từ đầu: BE chỉ lưu mỗi 10-30 giây/lần.
- Giữ giá trị mới nhất trong memory để endpoint `latest` trả nhanh mà không chạm DB.

### 3. Luồng điều khiển: không có correlationId

- ESP không echo id nào, nên ghép lệnh với phản hồi bằng `deviceId`.
- Dùng `ConcurrentDictionary<int deviceId, TaskCompletionSource>`: control xong thì tạo TCS cho deviceId đó, handler `esp_status` nhận được thì complete TCS (timeout khoảng 5 giây).
- `Device` thêm field `Code` (`green`, `red`, `yellow`). Lệnh gửi đi là `$"{code}_{action.ToLower()}"`.
- `ActionHistory` bỏ `CorrelationId`. Khi nhận `esp_status`, tìm bản ghi Pending mới nhất của deviceId đó để cập nhật.
- Hạn chế: hai lệnh đồng thời vào cùng một LED thì ghép nhầm được, chấp nhận cho đồ án.
- Bản đầu API chỉ điều khiển từng LED. Nút bật tất cả ở FE thì gọi 3 lần.

### 4. Trạng thái LED có thể lệch

ESP không báo gì khi vừa bật hoặc reset (mọi LED về LOW), nên DB có thể ghi LED đang bật trong khi thực tế đã tắt. Bản đầu chấp nhận. Muốn sửa thì thêm một dòng trong `connectMQTT()` để ESP publish trạng thái khi vừa kết nối.

## Lưu ý phần cứng

D3 (GPIO0) và D4 (GPIO2) là chân quyết định chế độ boot của ESP8266, nên gắn LED vào đó đôi khi gây lỗi nạp code hoặc boot không lên. Đang chạy ổn thì giữ nguyên, nếu gặp reset lạ thì nghi hai chân này.

## Kế hoạch theo giai đoạn

Kế hoạch có 7 giai đoạn, mỗi giai đoạn có một mốc tự kiểm được ngay mà không phải đợi cả hệ thống xong.

1. **GĐ 0: Chuẩn bị.** Giao thức chốt theo bảng ở trên.
   - Cài .NET 10 SDK, `dotnet-ef`, MQTTX.
   - Mốc: MQTTX kết nối được broker bằng cùng user/password, subscribe `#` thấy ESP đang bắn dữ liệu.
2. **GĐ 1: Khởi tạo project.** `dotnet new webapi -n IotServer -o iot-server --use-controllers`.
   - Package: EF Core SqlServer + Design, MQTTnet, BCrypt.Net-Next, JwtBearer, Riok.Mapperly.
   - Tạo thư mục theo cấu trúc layered, bỏ `WeatherForecast`, thêm cấu hình `Mqtt`, `Jwt`, `ConnectionStrings` vào `appsettings.json`.
   - Mốc: `dotnet run` lên Swagger.
3. **GĐ 2: Data layer.** 5 entity, `AppDbContext`, migration đầu, `DbSeeder`, repository + `IUnitOfWork`.
   - `Device` thêm `Code`, `ActionHistory` bỏ `CorrelationId`.
   - Seed 3 LED với Id 1, 2, 3 đúng `deviceId` của ESP, cùng admin (BCrypt) và 3 sensor.
   - Index `DataSensor(SensorId, CreatedAt)`, unique `User.Username`.
   - Mốc: SSMS thấy đủ bảng và dữ liệu seed.
4. **GĐ 3: MQTT.** `MqttOptions`, `MqttService` (connect, reconnect, subscribe `sensor_data` và `esp_status`), `MqttMessageHandler` tạo scope cho mỗi message, publish `led_control`.
   - Mốc: MQTTX publish thử `sensor_data` thì DB có dòng mới, publish `esp_status` giả thì `ActionHistory` đổi Status.
5. **GĐ 4: Service, Mapper, Controller.** Làm theo thứ tự Auth, Sensors, Devices, ActionHistory, Profile, rồi global exception middleware và CORS cho `http://localhost:5173`.
   - Mốc: test từng endpoint trong Swagger, bấm Authorize bằng JWT.
6. **GĐ 5: Test end-to-end với ESP.** Bật ESP, dữ liệu sensor vào DB thật.
   - Gọi control từ Swagger thì LED sáng và `esp_status` về đúng deviceId.
   - Rút nguồn ESP rồi gọi control phải ra timeout và Status = Failed.
7. **GĐ 6: Nối Frontend.** Sửa từng file trong `iot/src/lib/api/` (`auth.ts`, `devices.ts`, `sensors.ts`, `history.ts`) từ mock sang API thật.
   - Base URL đặt qua env của Vite, chỉnh tay chỗ DTO lệch với type TS.
   - Mốc: đăng nhập từ web, xem biểu đồ (polling), bấm bật/tắt LED thật.

Việc để sau: job xoá dữ liệu cũ, refresh token, Dockerfile.
