---
name: iot-server
description: Nghiệp vụ và quy trình làm việc trên iot-server (ASP.NET Core): xử lý dữ liệu sensor từ MQTT, điều khiển LED, ActionHistory, auth, thêm endpoint/sensor/device mới. Dùng khi sửa hoặc thêm bất kỳ tính năng nào của BE IoT.
---

# Skill: iot-server

Rule luôn áp dụng (layer, DI, bảo mật, cách làm việc) nằm trong `CLAUDE.md`. Skill này chứa nghiệp vụ và quy trình theo từng loại việc.

## 1. Nghiệp vụ

### 1.1 Nhận dữ liệu sensor

Nguồn: topic `sensor_data`, payload `{"temp":..,"humidity":..,"light":..}`, ESP gửi 2 giây/lần.

1. Parse JSON. Payload lỗi hoặc thiếu field thì log warning và bỏ qua, không làm sập service.
2. Kiểm tra khoảng giá trị hợp lệ (cấu hình được): `temp` -20..80 °C, `humidity` 0..100 %, `light` 0..100. Ngoài khoảng thì bỏ giá trị đó.
3. Cập nhật giá trị mới nhất vào bộ nhớ (cache trong Singleton) để endpoint `latest` trả nhanh.
4. **Throttle**: chỉ ghi DB khi đã qua `Mqtt:SensorSaveIntervalSeconds` (mặc định 10) kể từ lần ghi trước. ESP gửi 2 giây/lần, ghi hết là khoảng 130k dòng/ngày.
5. Mỗi lần ghi tạo 3 dòng `DataSensor` (một dòng mỗi sensor), cùng `CreatedAt` (UTC), qua một `SaveChangesAsync`.

### 1.2 Điều khiển LED

Endpoint: `POST /api/v1/devices/control` với `{ deviceId, action }`, `action` ∈ `ON` | `OFF`.

1. Validate: `deviceId` phải tồn tại và thuộc {1, 2, 3}; `action` hợp lệ. Sai thì 400.
2. Nếu thiết bị đang có lệnh Pending thì trả 409 (tránh ghép nhầm phản hồi vì ESP không có correlationId).
3. Tạo `ActionHistory` với `Status = Pending`, gắn `UserId` của người gọi.
4. Đăng ký `TaskCompletionSource` trong `ConcurrentDictionary<int deviceId, TCS>`.
5. Publish lên `led_control` chuỗi `$"{device.Code}_{action.ToLower()}"` (ví dụ `green_on`).
6. `await` TCS với timeout 5 giây (cấu hình được).
7. Khi `esp_status` về:
   - `status = success`: `ActionHistory.Status = Success`, `Device.IsOn = (state == "ON")`, `RespondedAt = UtcNow`.
   - `status = failed`: `ActionHistory.Status = Failed`, giữ nguyên `Device.IsOn`.
8. Timeout: `ActionHistory.Status = Failed`, trả 504 kèm thông báo ESP không phản hồi. Luôn xoá TCS khỏi dictionary (kể cả khi lỗi).
9. Response trả `{ deviceId, action, status, state }` từ kết quả cuối cùng.

Phạm vi bản đầu: chỉ điều khiển từng LED. `all_on`/`all_off` không có endpoint riêng (FE gọi 3 lần).

### 1.3 Nhận `esp_status`

- Payload ESP: `deviceId`, `deviceName`, `action`, `status`, `state`.
- `deviceId = 0` (lệnh lạ): chỉ log, không cập nhật DB.
- Không có Pending tương ứng (phản hồi trễ, hoặc ESP tự gửi): log, không tạo bản ghi mới.
- Tìm `ActionHistory` Pending mới nhất của `deviceId`, cập nhật rồi complete TCS nếu còn.

### 1.4 Truy vấn dữ liệu

| Endpoint | Quy tắc |
| --- | --- |
| `GET /sensors/latest` | giá trị mới nhất mỗi sensor, ưu tiên lấy từ cache; chưa có thì lấy từ DB |
| `GET /sensors/chart-data` | lọc `sensorId` + `from`/`to`; giới hạn khoảng thời gian tối đa; nếu quá nhiều điểm thì downsample (ví dụ tối đa 500 điểm) |
| `GET /sensors/history` | phân trang, lọc `sensorId`/`from`/`to`, mặc định sắp xếp `CreatedAt` giảm dần |
| `GET /devices` | danh sách LED + `IsOn` hiện tại |
| `GET /action-history` | phân trang, lọc `deviceId`/`status`/`from`/`to`, mới nhất trước |

`pageSize` tối đa 100. Mọi thời gian trả về là UTC (ISO 8601).

### 1.5 Auth và Profile

- `POST /auth/login`: so khớp BCrypt, đúng thì phát JWT (claim `sub`, `role`), sai thì 401 thông báo chung.
- `GET/PUT /profile`: chỉ thao tác trên user của JWT hiện tại. Không cho đổi `Role` hay `Username`. Đổi mật khẩu thì yêu cầu mật khẩu cũ.

## 2. Quy trình theo loại việc

### 2.1 Thêm endpoint mới

1. Tạo Dto request/response trong `Dtos/`.
2. Thêm method vào Repository (interface + implementation) nếu cần query mới.
3. Thêm method vào Service (interface + implementation), có logic và gọi `IUnitOfWork` nếu ghi dữ liệu.
4. Thêm map trong Mapper (`Mapping/`).
5. Thêm action vào Controller, mỏng, có `[Authorize]` nếu cần.
6. Test trong Swagger.

### 2.2 Thêm sensor mới

1. Firmware ESP thêm field vào `sensor_data` (hỏi user, đây là đổi contract).
2. Seed thêm dòng `Sensor` (tên, loại, đơn vị).
3. Thêm khoảng giá trị hợp lệ và xử lý trong handler `sensor_data`.
4. Kiểm tra `latest`, `chart-data`, `history` tự nhận sensor mới (không hardcode danh sách sensor).

### 2.3 Thêm thiết bị (LED) mới

1. Firmware thêm điều khiển và `deviceId` mới (hỏi user).
2. Seed thêm `Device` với `Id` = `deviceId` của ESP và `Code` tương ứng lệnh (`<code>_on` / `<code>_off`).
3. Không sửa luồng control, vì luồng dùng `Device.Code`.

### 2.4 Đổi schema DB

1. Sửa Entity và cấu hình trong `AppDbContext`.
2. `dotnet ef migrations add <TenMigration>` rồi `dotnet ef database update`.
3. Cột mới nên nullable hoặc có default để không vỡ dữ liệu cũ.
4. Cập nhật `DbSeeder` nếu liên quan dữ liệu mẫu.

### 2.5 Xử lý lỗi MQTT thường gặp

- BE và ESP đá nhau liên tục: clientId bị trùng. BE phải là `iot-server`.
- Không nhận được dữ liệu: kiểm tra IP broker (hotspot có thể đổi IP), user/password, topic subscribe.
- Mất kết nối: `MqttService` phải tự reconnect (delay vài giây) và subscribe lại sau khi connect.

## 3. Checklist trước khi giao

- [ ] Controller không có logic, không dùng Entity.
- [ ] Repository không gọi `SaveChanges`.
- [ ] Thời gian lưu là UTC.
- [ ] Danh sách có phân trang.
- [ ] Không hardcode secret, host, topic.
- [ ] MQTT contract không bị đổi.
- [ ] Đã nói rõ file nào đổi và đổi gì.
