# Kế hoạch cải tổ Backend `iot-server` theo Báo cáo Bài tập lớn (.docx)

## 1. Tổng quan & Mục tiêu

Đối chiếu giữa **Báo cáo Bài tập lớn** (`Báo cáo Bài tập lớn_ Hệ thống Giám sát và Điều khiển IoT (1) (1).docx`) và hiện trạng mã nguồn **`iot-server`** (ASP.NET Core Web API), kế hoạch này tập trung vào 4 mục tiêu cốt lõi:

1. **Chuẩn hóa Database Schema 6 bảng**: Bổ sung bảng `RefreshTokens`, hoàn thiện các trường còn thiếu trong `Users`, `Sensors`, `Devices`, `DataSensors`, `Actions`.
2. **Quy chuẩn hóa Response Envelope toàn hệ thống**: Tất cả API trả về cấu trúc thống nhất theo Mục 3.4.1 của Báo cáo:
   `{ code, success, message, data, metaData }`.
3. **Đồng bộ hóa 100% danh mục Endpoints**: Chuẩn hóa URL theo chuẩn RESTful không dùng động từ, khớp chính xác từng route trong Mục 3.4.2 của Báo cáo.
4. **Bảo toàn tương thích với Firmware và Web Frontend**: Đảm bảo luồng MQTT thời gian thực của ESP8266 và Frontend React Ant Design vẫn kết nối thông suốt.

---

## 2. Bảng đối chiếu chênh lệch (Gap Analysis)

| Hạng mục | Quy định trong Báo cáo DOCX | Hiện trạng `iot-server` | Hành động cần thực hiện |
| :--- | :--- | :--- | :--- |
| **Response Wrapper** | `{ code, success, message, data, metaData }` | Trả object thô, `PagedResult<T>`, ProblemDetails | Xây dựng `ApiResponse<T>` + `MetaData` và Middleware/ActionFilter chuẩn |
| **Bảng RefreshTokens** | Bảng thứ 6 (Mục 3.2) quản lý phiên, refresh token | Chưa có Entity và Migration | Tạo `RefreshToken.cs`, cập nhật `AppDbContext` và tạo Migration |
| **Bảng Devices** | `id`, `name`, `location`, `status`, `created_at` | `Id`, `Code`, `Name`, `IsOn` | Bổ sung `Location`, `Status` ('online'/'offline'), `CreatedAt` |
| **Bảng Sensors** | `id`, `name`, `sensor_type`, `unit`, `created_at` | `Id`, `Code`, `Name`, `Unit` | Bổ sung `SensorType`, `CreatedAt` |
| **Bảng Actions** | `action_type`, `action_status`, `created_at` | `Action`, `Status`, `CreatedAt`, `RespondedAt` | Map chuẩn tên trường sang DTO |
| **Đăng ký tài khoản** | `POST /api/auth/register` | Chưa có trong `AuthController` | Triển khai đăng ký có mã hóa BCrypt |
| **Làm mới Token** | `POST /api/auth/refresh` | Chưa có | Triển khai cấp lại JWT qua `refreshToken` |
| **Điều khiển thiết bị** | `POST /api/devices/{deviceId}/commands` | `POST /api/v1/devices/control` | Thêm route `POST /api/devices/{deviceId}/commands` |
| **Lấy dữ liệu cảm biến** | `GET /api/sensor-data`<br>`GET /api/sensors/{id}/data` | `GET /api/v1/sensors/history` | Thêm đúng 2 route chuẩn DOCX hỗ trợ filter/paging |
| **Lịch sử hoạt động** | `GET /api/device-activity` | `GET /api/v1/action-history` | Thêm route `GET /api/device-activity` |

---

## 3. Trình tự thực hiện đề xuất

- **Bước 1**: Cập nhật Entities (`RefreshToken`, `Device`, `Sensor`) & `AppDbContext` + Sinh Migration EF Core.
- **Bước 2**: Viết bộ Wrapper `ApiResponse<T>`, `MetaData` và cấu hình Middleware xử lý lỗi tập trung.
- **Bước 3**: Cập nhật `AuthService` và `AuthController` (Register, Login, Refresh Token).
- **Bước 4**: Nâng cấp `DevicesController` (`/api/devices`, `/api/devices/{deviceId}/commands`).
- **Bước 5**: Bổ sung các routes `/api/sensor-data`, `/api/sensors/{id}/data`, `/api/device-activity`.
- **Bước 6**: Chạy build `dotnet build`, chạy test các endpoint và khớp nối Frontend.

