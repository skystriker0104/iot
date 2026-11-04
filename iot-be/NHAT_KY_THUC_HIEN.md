# 📝 Nhật ký Triển khai Backend IoT Server

Tài liệu ghi lại toàn bộ tiến độ và các bước thực hiện trên `iot-server` (ASP.NET Core .NET 10).

---

## 📌 Bước 1: Khởi tạo project (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

### 1.1 Khởi tạo Project & .gitignore
- Chạy lệnh: `dotnet new webapi -n IotServer -o iot-server --use-controllers --force`
- Tạo file `.gitignore` chuẩn cho .NET: `dotnet new gitignore`
- Thêm bỏ qua file bảo mật vào `.gitignore`:
  ```
  # Sensitive local configuration
  appsettings.Development.json
  ```

### 1.2 Cài đặt các NuGet Packages
Đã cài đặt đúng phiên bản tương thích .NET 10:
- `Microsoft.EntityFrameworkCore.SqlServer` (v10.0.13)
- `Microsoft.EntityFrameworkCore.Design` (v10.0.13)
- `Microsoft.AspNetCore.Authentication.JwtBearer` (v10.0.13)
- `Microsoft.AspNetCore.OpenApi` (v10.0.11)
- `MQTTnet` (v5.2.0.1603)
- `BCrypt.Net-Next` (v4.2.0)
- `Riok.Mapperly` (v4.3.1)
- `Swashbuckle.AspNetCore.SwaggerUI` (v10.3.0)

### 1.3 Dọn dẹp file mẫu
Đã xoá các file sinh tự động không dùng đến:
- `WeatherForecast.cs`
- `Controllers/WeatherForecastController.cs`
- `IotServer.http`

### 1.4 Tạo cấu trúc thư mục phân tầng
Đã tạo đầy đủ các thư mục theo đúng quy chuẩn kiến trúc trong `CLAUDE.md`:
```
iot-server/
├── Controllers/
├── Services/
│   ├── Interfaces/
│   └── Implementations/
├── Repositories/
│   ├── Interfaces/
│   └── Implementations/
├── Mapping/
├── Mqtt/
├── Data/
├── Entities/
├── Dtos/
└── Middleware/
```

### 1.5 Cấu hình ứng dụng
- **`appsettings.json`**: Cấu hình mẫu kết nối SQL Server, thông số JWT, và các thông số MQTT Broker (Host, Port, Topic sensor/control/status, Interval, Timeout).
- **`appsettings.Development.json`**: Cấu hình thật cho môi trường Dev (được bảo vệ trong `.gitignore`):
  - Chuỗi kết nối SQL Server: `Server=localhost;Database=IotDb;Trusted_Connection=True;TrustServerCertificate=True`
  - JWT Key 32 ký tự.
  - Broker LAN: `192.168.67.41:34215`.

### 1.6 MqttOptions
Đã tạo class `Mqtt/MqttOptions.cs` binding với section `"Mqtt"` trong configuration:
```csharp
namespace IotServer.Mqtt;

public class MqttOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1883;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string ClientId { get; set; } = "iot-server";
    public string SensorTopic { get; set; } = "sensor_data";
    public string StatusTopic { get; set; } = "esp_status";
    public string ControlTopic { get; set; } = "led_control";
    public int SensorSaveIntervalSeconds { get; set; } = 10;
    public int ControlTimeoutSeconds { get; set; } = 5;
}
```

### 1.7 Cấu hình Program.cs & Swagger UI
- Đã cấu hình `AddControllers()`, `AddOpenApi()`, `Configure<MqttOptions>()`.
- Cấu hình SwaggerUI trỏ tới OpenAPI v1 JSON: `app.UseSwaggerUI(o => o.SwaggerEndpoint("/openapi/v1.json", "IotServer v1"))`.
- Thêm endpoint kiểm tra tạm thời: `GET /api/v1/ping` $\rightarrow$ trả về `"pong"`.

### 1.8 Khởi tạo Git & Commit ban đầu
- Khởi tạo repo git: `git init`
- Kiểm tra `git status` đảm bảo `appsettings.Development.json` không bị theo dõi.
- Commit ban đầu: `git commit -m "init iot-server"` (Commit hash `136267b`).

### 1.9 Định vị Agent Rules & Skills
- `CLAUDE.md`: đặt tại root `iot-server/CLAUDE.md`
- `SKILL.md`: đặt tại duy nhất `iot-server/.claude/skills/iot-server/SKILL.md` (đã xoá thư mục thừa `skill/`).

### 1.10 Kết quả kiểm thử mốc hoàn thành
- [x] `dotnet build`: **0 Error**, build thành công.
- [x] `dotnet run`: Server khởi động lắng nghe tại `http://localhost:5171` (và `https://localhost:7039`).
- [x] Gọi `GET /api/v1/ping`: Trả về `pong` thành công.
- [x] Swagger UI sẵn sàng tại `/swagger`.
- [x] `git status`: Sạch sẽ, không lộ `appsettings.Development.json`.

---

## 📌 Bước 2: Data layer (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

### 2.1 Tạo các Entities (`Entities/`)
- `ActionStatus.cs`: Enum trạng thái `Pending`, `Success`, `Failed`.
- `User.cs`: Tài khoản, BCrypt hash, Role, CreatedAt.
- `Sensor.cs`: Mã sensor (`temp`, `humidity`, `light`), tên tiếng Việt và đơn vị đo.
- `Device.cs`: Thiết bị điều khiển (3 LED), mã code (`green`, `red`, `yellow`), `IsOn` trạng thái hiện tại.
- `DataSensor.cs`: Bản ghi chuỗi thời gian dữ liệu đo, liên kết ngoại tới `Sensor`.
- `ActionHistory.cs`: Nhật ký điều khiển LED, trạng thái pending/success/failed, liên kết `Device` và `User`.

### 2.2 Cấu hình `IUnitOfWork` và `AppDbContext` (`Data/`)
- `IUnitOfWork.cs`: Khai báo `Task<int> SaveChangesAsync(CancellationToken ct = default);`.
- `AppDbContext.cs`:
  - Kế thừa `DbContext` và implement `IUnitOfWork` (tận dụng `SaveChangesAsync` sẵn có của EF Core).
  - Khai báo 5 `DbSet`: `Users`, `Sensors`, `Devices`, `DataSensors`, `ActionHistories`.
  - Cấu hình Fluent API:
    - `Device.Id`: Sử dụng `ValueGeneratedNever()` để khớp chính xác với `deviceId` của ESP8266 (1, 2, 3), không dùng tự tăng IDENTITY.
    - `ActionHistory.Status`: Lưu dưới dạng chuỗi `nvarchar(20)` qua `HasConversion<string>()`.
    - Tạo các Index tối ưu truy vấn:
      - Unique index trên `User.Username`, `Sensor.Code`, `Device.Code`.
      - Compound index trên `DataSensors(SensorId, CreatedAt)`.
      - Index trên `ActionHistories(DeviceId, Status)` và `ActionHistories(CreatedAt)`.

### 2.3 Migration & Cập nhật Database SQL Server
- Đã chạy `dotnet ef migrations add Init -o Data/Migrations`: Tạo migration đầu tiên.
- Đã chạy `dotnet ef database update`:
  - Tạo mới cơ sở dữ liệu `IotDb` trên máy chủ SQL Server `localhost`.
  - Tạo thành công bảng `__EFMigrationsHistory` và 5 bảng: `Devices`, `Sensors`, `Users`, `DataSensors`, `ActionHistories`.

### 2.4 Khởi tạo dữ liệu mẫu (`Data/DbSeeder.cs`)
- Sử dụng phương pháp Seed theo Scope lúc ứng dụng khởi động (`DbSeeder.SeedAsync(db)`):
  - **Admin User**: `admin` / `Admin@123` (được băm bằng `BCrypt.Net.BCrypt.HashPassword` chuẩn an toàn).
  - **Sensors**: 3 cảm biến (`temp` - Nhiệt độ, `humidity` - Độ ẩm, `light` - Ánh sáng).
  - **Devices**: 3 LED với `Id` chuẩn 1, 2, 3 (`green` - Green LED, `red` - Red LED, `yellow` - Yellow LED).
- Đảm bảo tính Idempotent: Kiểm tra `AnyAsync()` trước khi thêm, không bao giờ bị chèn dữ liệu trùng lặp khi khởi động lại ứng dụng.

### 2.5 Cấu trúc Repository Pattern (`Repositories/`)
Tách biệt hoàn toàn tầng truy xuất dữ liệu theo đúng nguyên tắc:
- `IRepository<T>` / `Repository<T>`: Base generic repository (cung cấp `AddAsync`, `AddRangeAsync`, `Remove`). Tuyệt đối không gọi `SaveChanges()`.
- `IUserRepository` / `UserRepository`: Truy vấn User theo `Id` hoặc `Username`.
- `ISensorRepository` / `SensorRepository`: Lấy danh sách cảm biến (`GetAllAsync`) và tìm theo `Code` (có `AsNoTracking()`).
- `IDeviceRepository` / `DeviceRepository`: Lấy danh sách thiết bị và lấy theo `Id`.
- `ISensorDataRepository` / `SensorDataRepository`: Quản lý lưu dữ liệu cảm biến theo lô.
- `IActionHistoryRepository` / `ActionHistoryRepository`: Cung cấp hàm `GetLatestPendingAsync(deviceId)` để phục vụ ghép lệnh phản hồi từ ESP8266.
- Đã đăng ký tất cả Repositories với vòng đời `Scoped` trong `Program.cs`.

### 2.6 Kết quả kiểm thử mốc hoàn thành
- [x] **`dotnet build`**: `0 Error(s)`.
- [x] **SQL Server (IotDb)**:
  - Bảng `Users`: Có 1 dòng `admin` với PasswordHash dạng `$2a$11$...`.
  - Bảng `Sensors`: Có 3 dòng (`temp`, `humidity`, `light`).
  - Bảng `Devices`: Có 3 dòng với `Id = 1, 2, 3` và `Code = green, red, yellow`.
- [x] **Kiểm thử Idempotent**: Chạy `dotnet run` lần 2, database không bị chèn thêm bất kỳ dòng trùng nào.
- [x] **Bảo mật**: `appsettings.Development.json` không nằm trong git status.

---

## 📌 Bước 3: MQTT (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

### 3.1 Khởi tạo các Payload Model (`Mqtt/MqttMessages.cs`)
- `SensorPayload`: Chứa các trường nullable `Temp`, `Humidity`, `Light`.
- `EspStatusPayload`: Khớp 100% với contract phản hồi từ ESP8266 (`DeviceId`, `DeviceName`, `Action`, `Status`, `State`).

### 3.2 Bộ nhớ đệm Sensor thời gian thực (`Mqtt/LatestSensorCache.cs`)
- Sử dụng `ConcurrentDictionary<string, SensorReading>` an toàn luồng.
- Hàm `Set(code, value, at)` và `GetAll()` giúp API `GET /sensors/latest` truy xuất O(1) từ RAM, không cần chạm tới Database.

### 3.3 Quản lý lệnh chờ phản hồi (`Mqtt/PendingCommandRegistry.cs`)
- Giải quyết bài toán ESP không có `correlationId`: Ghép lệnh theo `deviceId`.
- Dùng `ConcurrentDictionary<int, TaskCompletionSource<EspStatusPayload>>`:
  - `TryRegister(deviceId, out task)`: Tạo TCS với cờ `TaskCreationOptions.RunContinuationsAsynchronously`. Trả về `false` nếu thiết bị đang có lệnh chờ (service sẽ trả mã HTTP 409 Conflict).
  - `TryComplete(deviceId, status)`: Complete task khi nhận được phản hồi `esp_status` từ ESP8266.
  - `Remove(deviceId)`: Dọn dẹp khi timeout 5s.

### 3.4 Interface Publish (`Mqtt/IMqttPublisher.cs`)
- Tách biệt abstraction: Giúp Service tầng nghiệp vụ publish message mà không bị dính chặt vào thư viện `MQTTnet`.

### 3.5 Message Handler (`Mqtt/MqttMessageHandler.cs`)
- **Xử lý `sensor_data` (`HandleSensorAsync`)**:
  - Deserialize JSON an toàn với `try/catch` bọc ngoài, không làm sập tiến trình.
  - Kiểm tra khoảng giá trị hợp lệ: `temp` (-20..80°C), `humidity` (0..100%), `light` (0..100%).
  - Cập nhật giá trị mới nhất vào `LatestSensorCache`.
  - **Cơ chế Throttle**: Chỉ lưu vào DB khi khoảng cách giữa 2 lần ghi $\ge$ `SensorSaveIntervalSeconds` (mặc định 10s).
  - Sử dụng `IServiceScopeFactory.CreateScope()` để lấy `ISensorRepository`, `ISensorDataRepository`, `IUnitOfWork` (tuân thủ nguyên tắc DI giữa BackgroundService và Scoped DbContext).
- **Xử lý `esp_status` (`HandleStatusAsync`)**:
  - Bỏ qua các lệnh lạ (`DeviceId == 0`).
  - Tìm bản ghi `ActionHistory` có trạng thái `Pending` mới nhất của `DeviceId`.
  - Cập nhật trạng thái `Success`/`Failed` và `RespondedAt = UtcNow`.
  - Nếu thành công, cập nhật trạng thái `Device.IsOn` (`state == "ON"`).
  - Gọi `uow.SaveChangesAsync()` trước khi gọi `registry.TryComplete` để đảm bảo dữ liệu đã vào DB khi Task của API đánh thức.

### 3.6 MqttService (`Mqtt/MqttService.cs`)
- Kế thừa `BackgroundService` và implement `IMqttPublisher`.
- Vòng lặp duy trì kết nối trong `ExecuteAsync`:
  - Sử dụng timeout kết nối 5 giây (`.WithTimeout(TimeSpan.FromSeconds(5))`) tránh treo luồng khi đổi mạng hotspot.
  - Tự động Reconnect sau mỗi 5s nếu mất kết nối.
  - Subscribe lại các topic `_opt.SensorTopic` và `_opt.StatusTopic` sau mỗi lần kết nối lại.
  - Publish lệnh điều khiển lên broker với QoS 1 (`AtLeastOnce`).

### 3.7 Đăng ký DI (`Program.cs`)
- Đăng ký Singleton các thành phần MQTT:
  ```csharp
  builder.Services.AddSingleton<LatestSensorCache>();
  builder.Services.AddSingleton<PendingCommandRegistry>();
  builder.Services.AddSingleton<MqttMessageHandler>();
  builder.Services.AddSingleton<MqttService>();
  builder.Services.AddSingleton<IMqttPublisher>(sp => sp.GetRequiredService<MqttService>());
  builder.Services.AddHostedService(sp => sp.GetRequiredService<MqttService>());
  ```
  *(Sử dụng cùng 1 instance cho cả IMqttPublisher và HostedService).*

### 3.8 Kết quả kiểm thử mốc hoàn thành
- [x] **`dotnet build`**: `0 Error(s)` (Tương thích 100% với API MQTTnet v5).
- [x] **Vận hành thử nghiệm**: Background service khởi động đúng quy trình, tự động kích hoạt tiến trình kết nối tới broker local `localhost:1883` (`mosquitto`).
- [x] **Test 1 — Nhận dữ liệu sensor**:
  - Dùng `mosquitto_pub` publish vào topic `sensor_data` payload `{"temp":28.5,"humidity":70,"light":45}`.
  - Console xuất log: `info: IotServer.Mqtt.MqttMessageHandler: Đã lưu 3 dòng sensor`.
  - Kiểm tra SQL Server `IotDb.dbo.DataSensors`: Lưu thành công 3 dòng (`temp: 28.5`, `humidity: 70`, `light: 45`).
- [x] **Test 2 — Nhận phản hồi LED**:
  - Thêm 1 dòng `Pending` giả vào `ActionHistories` (`DeviceId = 1, Action = 'ON'`).
  - Dùng `mosquitto_pub` publish vào `esp_status` payload `{"deviceId":1,"deviceName":"GREEN_LED","action":"ON","status":"success","state":"ON"}`.
  - Kiểm tra SQL Server:
    - `ActionHistories`: Bản ghi chuyển sang `Status = Success` và cập nhật `RespondedAt`.
    - `Devices`: Cột `IsOn` của Green LED (Id = 1) chuyển thành `True`.
- [x] **Bảo mật**: `appsettings.Development.json` vẫn nằm an toàn trong `.gitignore`.

---

### 4a. Nền tảng (Middleware, CORS, JWT, Swagger) & Auth (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

#### 4a.1 Cấu hình CORS (`appsettings.json`)
- Đã thêm section `"Cors"` cho phép Origin `http://localhost:5173` (Frontend Vite/React):
  ```json
  "Cors": {
    "Origins": [ "http://localhost:5173" ]
  }
  ```

#### 4a.2 Xử lý lỗi toàn cục (`Middleware/`)
- `AppException.cs`: Exception tuỳ chỉnh mang mã HTTP (`StatusCode`) và thông điệp lỗi (`message`).
- `GlobalExceptionHandler.cs`:
  - Implement `IExceptionHandler` chuẩn của ASP.NET Core 10.
  - Tự động bắt `AppException` và trả về `ProblemDetails` theo đúng status code.
  - Bắt các lỗi chưa lường trước và trả về HTTP 500 với thông báo chung "Lỗi hệ thống".
  - Giúp Controller và Service không cần `try/catch` thủ công.

#### 4a.3 Base Controller (`Controllers/ApiControllerBase.cs`)
- Đặt `[ApiController]` và `[Authorize]` trên toàn bộ API.
- Cung cấp property `UserId` lấy trực tiếp từ claim `sub` của JWT.
- Không đặt Route cố định ở Base class để tránh sinh duplicate route ở các Controller con.

#### 4a.4 Dtos & JwtOptions
- `Services/JwtOptions.cs`: Ánh xạ cấu hình `"Jwt"` (`Issuer`, `Audience`, `Key`, `ExpireMinutes`).
- `Dtos/Auth/LoginRequest.cs`: Chứa `Username` và `Password` với attribute `[Required]`.
- `Dtos/Auth/LoginResponse.cs`: Trả về `Token` và `ExpiresAt`.

#### 4a.5 Dịch vụ xác thực (`Services/AuthService.cs`)
- `IAuthService` & `AuthService`:
  - Kiểm tra tài khoản bằng `IUserRepository.GetByUsernameAsync`.
  - So khớp mật khẩu bằng `BCrypt.Net.BCrypt.Verify`.
  - Thông báo chung khi sai tài khoản/mật khẩu: "Sai tên đăng nhập hoặc mật khẩu" (HTTP 401).
  - Ký token JWT bằng `HMAC-SHA256` với khóa bí mật từ `JwtOptions`.

#### 4a.6 Controller Auth (`Controllers/AuthController.cs`)
- Endpoint `POST /api/v1/auth/login` được gắn `[AllowAnonymous]`.

#### 4a.7 Cấu hình tích hợp trong `Program.cs`
- Đăng ký `GlobalExceptionHandler` và `ProblemDetails`.
- Đăng ký CORS policy `"Frontend"`.
- Cấu hình JWT Bearer với `TokenValidationParameters` chặt chẽ (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ClockSkew = TimeSpan.Zero`).
- Cấu hình OpenAPI DocumentTransformer: Tích hợp `OpenApiSecurityScheme` dạng `Bearer (JWT)` tự động bổ sung nút **Authorize** trên giao diện Swagger UI.
- Pipeline sắp xếp đúng thứ tự chuẩn: `UseExceptionHandler()` $\rightarrow$ `UseSwaggerUI()` $\rightarrow$ `UseHttpsRedirection()` $\rightarrow$ `UseCors("Frontend")` $\rightarrow$ `UseAuthentication()` $\rightarrow$ `UseAuthorization()` $\rightarrow$ `MapControllers()`.
- Endpoint test tạm thời: `GET /api/v1/ping` có `RequireAuthorization()`.

#### 4a.8 Kết quả kiểm thử mốc 4a
- [x] **`dotnet build`**: `0 Error(s)`.
- [x] **Test 1**: `POST /api/v1/auth/login` với `admin` / `Admin@123` $\rightarrow$ Trả về HTTP 200, JWT token hợp lệ và `expiresAt`.
- [x] **Test 2**: Đăng nhập sai mật khẩu $\rightarrow$ Trả về HTTP 401 với JSON ProblemDetails `{"title":"Sai tên đăng nhập hoặc mật khẩu","status":401}`.
- [x] **Test 3**: Gửi request rỗng $\rightarrow$ Trả về HTTP 400 Bad Request.
- [x] **Test 4**: `GET /api/v1/ping` không có token $\rightarrow$ Trả về HTTP 401 Unauthorized.
- [x] **Test 5**: `GET /api/v1/ping` kèm header `Authorization: Bearer <token>` $\rightarrow$ Trả về HTTP 200 `"pong"`.
- [x] **Test 6**: Swagger UI (`/swagger`) và OpenAPI Spec (`/openapi/v1.json`) hoạt động hoàn hảo với SecurityScheme Bearer.

---

### 4b. Sensors + Devices (Điều khiển thiết bị & Đồ thị cảm biến) (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

#### 4b.1 Dtos (`Dtos/`)
- `Dtos/Common/PagedResult.cs`: Generic class cho kết quả phân trang (`Items`, `Page`, `PageSize`, `Total`, `TotalPages`).
- `Dtos/Sensors/SensorLatestDto.cs`: Dữ liệu cảm biến mới nhất (`SensorId`, `Code`, `Name`, `Unit`, `Value`, `CreatedAt`).
- `Dtos/Sensors/SensorDataDto.cs`: Bản ghi lịch sử đo (`Id`, `SensorId`, `SensorCode`, `SensorName`, `SensorUnit`, `Value`, `CreatedAt`).
- `Dtos/Sensors/ChartDataDto.cs`: `ChartPointDto` (`CreatedAt`, `Value`) và `ChartDataDto` (`SensorId`, `Code`, `Name`, `Unit`, `Points`).
- `Dtos/Sensors/SensorQueries.cs`:
  - `ChartDataQuery`: `SensorId`, `From`, `To` (sử dụng `DateTimeOffset?` chuẩn ISO 8601 kèm `Z` từ FE), `MaxPoints` (10-2000, mặc định 500).
  - `SensorHistoryQuery`: `SensorId`, `From`, `To`, `Page`, `PageSize` (1-100), `SortDesc` (mặc định true).
- `Dtos/Devices/DeviceDtos.cs`:
  - `DeviceDto`: `Id`, `Code`, `Name`, `IsOn`.
  - `ControlDeviceRequest`: `DeviceId`, `Action` (Validate regex `^(on|off)$`).
  - `ControlDeviceResponse`: `DeviceId`, `Action`, `Status`, `State`.

#### 4b.2 Cập nhật Repository (`Repositories/`)
- `ISensorRepository` & `SensorRepository`: Bổ sung `GetAllAsync()`, `GetByIdAsync(int id)`, `GetByCodeAsync(string code)`.
- `ISensorDataRepository` & `SensorDataRepository`:
  - `GetLatestBySensorAsync(int sensorId)`: Lấy dữ liệu mới nhất theo sensor.
  - `GetRangeAsync(int sensorId, DateTime from, DateTime to)`: Truy vấn dữ liệu theo dải thời gian vẽ biểu đồ.
  - `GetPagedAsync(...)`: Lọc linh hoạt theo `sensorId`, `from`, `to`, phân trang với `Skip`/`Take`, sắp xếp theo `CreatedAt` và `Id`, nạp navigation property `Sensor`.

#### 4b.3 Object Mapper với Riok.Mapperly (`Mapping/`)
- Cấu hình Source Generator compile-time hiệu năng cao, zero-overhead:
  - `SensorMapper.cs`: Tự động flatten `DataSensor.Sensor.Code/Name/Unit` sang `SensorDataDto.SensorCode/SensorName/SensorUnit`. Cấu hình `[MapperIgnoreSource]` để loại bỏ triệt để warning RMG020.
  - `DeviceMapper.cs`: Map `Device` sang `DeviceDto`.

#### 4b.4 Dịch vụ Cảm biến (`Services/Implementations/SensorService.cs`)
- `GetLatestAsync`: Đọc đồng thời danh sách cảm biến, ưu tiên lấy giá trị tức thời từ RAM cache `LatestSensorCache` (tốc độ nano-giây), fallback về DB `GetLatestBySensorAsync` nếu BE vừa khởi động lại mà ESP chưa gửi bản tin mới.
- `GetChartDataAsync`:
  - Kiểm tra tồn tại cảm biến (404 nếu không tìm thấy).
  - Mặc định dải thời gian 1 giờ gần nhất (`UtcDateTime`).
  - Chống truy vấn tải nặng: Giới hạn tối đa dải thời gian 24 giờ (400 nếu vượt quá).
  - Thuật toán Downsampling thông minh: Nếu tổng số bản ghi vượt quá `MaxPoints`, thực hiện downsample đều `i % step == 0` để giảm tải băng thông và tối ưu render trên Chart Frontend.
- `GetHistoryAsync`: Phân trang lịch sử đo, trả về `PagedResult<SensorDataDto>`.

#### 4b.5 Dịch vụ Điều khiển Thiết bị (`Services/Implementations/DeviceService.cs`)
- Hiện thực luồng điều khiển LED an toàn, bất đồng bộ với độ trễ thấp và ngăn ngừa race condition:
  1. Kiểm tra trạng thái kết nối MQTT broker (404 nếu không thấy thiết bị, 503 nếu broker ngắt kết nối).
  2. **Đăng ký TCS trước khi Publish**: Dùng `PendingCommandRegistry.TryRegister` kiểm tra thiết bị có đang bận lệnh nào khác không (HTTP 409 Conflict nếu đang bận).
  3. **Lưu ActionHistory trước khi Publish**: Ghi bản ghi `ActionHistory` trạng thái `Pending` vào DB để khi ESP phản hồi siêu nhanh thì message handler đã có sẵn bản ghi trong DB để đối chiếu.
  4. **Publish lệnh xuống Broker**: Định dạng `${device.Code}_${action.ToLower()}` (ví dụ: `green_on`). Nếu publish lỗi $\rightarrow$ chuyển trạng thái lịch sử sang `Failed` và trả 503.
  5. **Chờ phản hồi từ ESP**: Bất đồng bộ với `waitTask.WaitAsync` (timeout 5 giây).
  6. **Cơ chế Fail-safe & Unregister**: Mọi nhánh ngoại lệ (TimeoutException, OperationCanceledException, Broker error) đều gọi `FailAsync` cập nhật trạng thái `ActionHistory.Status = Failed`. Khối `finally` luôn gọi `registry.Remove(device.Id)` giải phóng trạng thái chờ, đảm bảo thiết bị không bao giờ bị khoá treo vĩnh viễn.

#### 4b.6 Controllers (`Controllers/`)
- `SensorsController.cs`:
  - `GET /api/v1/sensors/latest`: Dữ liệu mới nhất 3 cảm biến.
  - `GET /api/v1/sensors/chart-data`: Dữ liệu biểu đồ kèm query filter và downsample.
  - `GET /api/v1/sensors/history`: Phân trang lịch sử cảm biến.
- `DevicesController.cs`:
  - `GET /api/v1/devices`: Danh sách thiết bị và trạng thái bật/tắt `isOn`.
  - `POST /api/v1/devices/control`: Điều khiển thiết bị với `UserId` lấy tự động từ JWT claim.

#### 4b.7 Đăng ký Dependency Injection (`Program.cs`)
- Đăng ký Singletons cho Mappers: `builder.Services.AddSingleton<SensorMapper>()`, `builder.Services.AddSingleton<DeviceMapper>()`.
- Đăng ký Scoped cho Services: `ISensorService` $\rightarrow$ `SensorService`, `IDeviceService` $\rightarrow$ `DeviceService`.

#### 4b.8 Kết quả kiểm thử mốc 4b (10/10 Tests Passed)
- [x] **Build**: `dotnet build` đạt 0 Error(s), 0 Warning từ Mapperly.
- [x] **Test 1 (Sensors Latest)**: `GET /api/v1/sensors/latest` trả về danh mục 3 cảm biến (`temp`, `humidity`, `light`) kèm `value` và `createdAt` chính xác.
- [x] **Test 2 (Sensors History)**: `GET /api/v1/sensors/history?pageSize=5` phân trang chuẩn, trả về đúng 5 phần tử kèm `total` và `totalPages`. Hỗ trợ filter theo `sensorId` và sắp xếp `sortDesc`.
- [x] **Test 3 (Chart Data)**: `GET /api/v1/sensors/chart-data?sensorId=1` trả về các điểm `points` trong 1 giờ gần nhất, tuân thủ giới hạn `MaxPoints`.
- [x] **Test 4 (Sensor Validations)**:
  - `sensorId: 99` $\rightarrow$ HTTP 404 "Không tìm thấy cảm biến".
  - Khoảng thời gian `from` $\ge$ `to` hoặc vượt quá 24h $\rightarrow$ HTTP 400.
  - `pageSize: 500` $\rightarrow$ HTTP 400 Validation Error (vượt ngưỡng 100).
- [x] **Test 5 (Devices List)**: `GET /api/v1/devices` trả về đầy đủ 3 thiết bị LED (green, red, yellow).
- [x] **Test 6 (Control Device ON/OFF)**:
  - `POST /api/v1/devices/control {"deviceId":1,"action":"ON"}` $\rightarrow$ Phản hồi `status: "success", state: "ON"`.
  - `GET /api/v1/devices` xác nhận `isOn: true`.
  - Gửi lệnh `OFF` $\rightarrow$ `isOn: false`.
- [x] **Test 7 (Kiểm tra Database ActionHistories)**: Bản ghi trong SQL Server được cập nhật đầy đủ `Status = "Success"`, `UserId = 1 (Admin)`, `RespondedAt` ghi nhận thời điểm phản hồi chuẩn xác.
- [x] **Test 8 (Device Validations)**:
  - `action: "TOGGLE"` $\rightarrow$ HTTP 400 "Action chỉ nhận ON hoặc OFF".
  - `deviceId: 99` $\rightarrow$ HTTP 404 "Không tìm thấy thiết bị".
- [x] **Test 9 (Timeout & Fail-safe)**:
  - Khi ESP không phản hồi (hoặc broker không có phản hồi `esp_status`): Sau đúng 5 giây API trả về HTTP 504 Gateway Timeout ("ESP không phản hồi").
  - Trạng thái bản ghi `ActionHistory` tự động đổi sang `Failed`.
  - Thiết bị được gỡ khỏi `PendingCommandRegistry`, gọi lại lệnh tiếp theo ngay lập tức không bị lỗi 409.
- [x] **Test 10 (Concurrency & Race Condition)**:
  - Gửi 2 request điều khiển đồng thời tới cùng 1 thiết bị $\rightarrow$ Request thứ nhất bắt đầu xử lý, request thứ hai lập tức bị chặn với HTTP 409 Conflict ("Thiết bị đang xử lý lệnh trước đó").

---

### 4c. ActionHistory + Profile & Dọn dẹp (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

#### 4c.1 Dtos (`Dtos/`)
- `Dtos/History/ActionHistoryDtos.cs`:
  - `ActionHistoryDto`: `Id`, `DeviceId`, `DeviceCode`, `DeviceName`, `UserId`, `Username`, `Action`, `Status`, `CreatedAt`, `RespondedAt`.
  - `ActionHistoryQuery`: Phân trang (`Page`, `PageSize` 1-100), lọc linh hoạt `DeviceId`, `Status` (enum `ActionStatus`), `From`/`To` (`DateTimeOffset?` UTC ISO 8601).
- `Dtos/Profile/ProfileDtos.cs`:
  - `ProfileDto`: `Id`, `Username`, `FullName`, `Email`, `Role`, `CreatedAt` (Không bao giờ chứa trường `PasswordHash`).
  - `UpdateProfileRequest`: `FullName`, `Email` (Không cho phép đổi `Username` hoặc `Role` qua API).
  - `ChangePasswordRequest`: `CurrentPassword`, `NewPassword` (tối thiểu 6 ký tự).

#### 4c.2 Cập nhật Repository (`Repositories/`)
- `IActionHistoryRepository` & `ActionHistoryRepository`:
  - `GetLatestPendingAsync(deviceId)`: Giữ nguyên tracking để MQTT handler đối chiếu cập nhật trạng thái.
  - `GetPagedAsync(...)`: Lọc theo `deviceId`, `status`, dải thời gian `from`/`to`, sắp xếp `CreatedAt DESC, Id DESC`, phân trang `Skip/Take`, nạp eager-loading `Include(x => x.Device)` và `Include(x => x.User)` với `AsNoTracking()`.

#### 4c.3 Object Mapper với Riok.Mapperly (`Mapping/`)
- `ActionHistoryMapper.cs`: Tự động flatten `Device.Code/Name` và `User.Username` sang DTO, enum `Status` tự động chuyển đổi sang chuỗi.
- `ProfileMapper.cs`: Ánh xạ `User` sang `ProfileDto` kèm `[MapperIgnoreSource(nameof(User.PasswordHash))]` loại trừ hash mật khẩu.
- Build sạch sẽ 0 Error, 0 Warning từ Mapperly.

#### 4c.4 Services (`Services/`)
- `ActionHistoryService.cs`: Thực hiện truy vấn phân trang qua repository, trả về `PagedResult<ActionHistoryDto>`.
- `ProfileService.cs`:
  - `GetAsync`: Lấy thông tin cá nhân theo `UserId` từ JWT.
  - `UpdateAsync`: Cập nhật `FullName` và `Email` được trim khoảng trắng, lưu DB qua `IUnitOfWork`.
  - `ChangePasswordAsync`: Xác minh mật khẩu cũ bằng `BCrypt.Verify`, băm mật khẩu mới bằng `BCrypt.HashPassword`, lưu DB.

#### 4c.5 Controllers (`Controllers/`)
- `ActionHistoryController.cs`: Endpoint `GET /api/v1/action-history` với query model binding.
- `ProfileController.cs`:
  - `GET /api/v1/profile`: Lấy profile của người dùng hiện tại (`UserId` trích xuất tự động từ JWT).
  - `PUT /api/v1/profile`: Cập nhật thông tin.
  - `PUT /api/v1/profile/password`: Đổi mật khẩu, trả về HTTP 204 No Content.

#### 4c.6 Đăng ký DI & Dọn dẹp (`Program.cs`)
- Đăng ký DI: `ActionHistoryMapper` (Singleton), `ProfileMapper` (Singleton), `ActionHistoryService` (Scoped), `ProfileService` (Scoped).
- Dọn dẹp: Đã xoá bỏ hoàn toàn endpoint test tạm thời `GET /api/v1/ping`.

#### 4c.7 Kết quả kiểm thử mốc 4c (9/9 Tests Passed)
- [x] **Build**: `dotnet build` 0 Error, 0 Warning Mapperly.
- [x] **Test 1 (ActionHistory Paged)**: `GET /api/v1/action-history?pageSize=5` trả về 5 bản ghi mới nhất, có đủ `deviceName`, `deviceCode`, `username` ("admin"), `status` ("Success" hoặc "Failed").
- [x] **Test 2 (Filter ActionHistory)**: Lọc theo `deviceId=1` và `status=Failed` trả về danh sách chính xác; lọc theo dải thời gian `from`/`to` (ISO UTC `Z`) hoạt động chuẩn xác.
- [x] **Test 3 (Validation ActionHistory)**: `status=Foo` trả về HTTP 400 Bad Request.
- [x] **Test 4 (Profile Details)**: `GET /api/v1/profile` trả về thông tin Admin (`admin`, `Administrator`, `admin@iot.local`, role `Admin`), không để lộ trường nhạy cảm `passwordHash`.
- [x] **Test 5 (Update Profile)**: `PUT /api/v1/profile` cập nhật thành công FullName và Email. Gửi email sai định dạng `invalid-email` trả về HTTP 400 Bad Request.
- [x] **Test 6 (Change Password)**:
  - Sai mật khẩu hiện tại $\rightarrow$ HTTP 400 "Mật khẩu hiện tại không đúng".
  - Đúng mật khẩu hiện tại $\rightarrow$ Đổi thành công, trả về HTTP 204 No Content.
- [x] **Test 7 (Xác thực đăng nhập lại & Rollback)**:
  - Đăng nhập bằng mật khẩu cũ $\rightarrow$ HTTP 401 Unauthorized.
  - Đăng nhập bằng mật khẩu mới $\rightarrow$ HTTP 200 OK, lấy được token mới.
  - Đổi lại về mật khẩu chuẩn ban đầu `Admin@123` để đồng bộ cơ sở dữ liệu và seed, đăng nhập lại thành công với HTTP 200.
- [x] **Test 8 (Xoá Endpoint Ping)**: `GET /api/v1/ping` trả về HTTP 404 Not Found.
- [x] **Test 9 (Danh mục API hoàn chỉnh)**: Swagger OpenAPI spec hiển thị chính xác 10 endpoints chuẩn RESTful của toàn hệ thống:
  - Auth (1): `POST /api/v1/auth/login`
  - Sensors (3): `GET /api/v1/sensors/latest`, `GET /api/v1/sensors/chart-data`, `GET /api/v1/sensors/history`
  - Devices (2): `GET /api/v1/devices`, `POST /api/v1/devices/control`
  - Action History (1): `GET /api/v1/action-history`
  - Profile (3): `GET /api/v1/profile`, `PUT /api/v1/profile`, `PUT /api/v1/profile/password`

---

### 4d. Tối ưu trước khi nối FE (UtcDateTimeConverter & Bỏ HTTPS redirect khi Dev) (Đã hoàn thành ✅)

**Thời gian:** 15/10/2026

#### 1. Xử lý lệch múi giờ với `UtcDateTimeConverter`
- **Vấn đề**: Giá trị `DateTime` lưu trong SQL Server khi đọc lên có `Kind = Unspecified`, làm JSON tuần tự hóa thành chuỗi dạng `2026-10-15T01:00:00` (thiếu hậu tố `Z`). Trình duyệt / JavaScript parse chuỗi này sẽ hiểu nhầm là giờ local của máy khách, gây lệch 7 tiếng so với giờ UTC chuẩn.
- **Giải pháp**: Tạo `Dtos/Common/UtcDateTimeConverter.cs` kế thừa `JsonConverter<DateTime>`, ép `DateTime.SpecifyKind(value, DateTimeKind.Utc)` khi serialize, đảm bảo mọi trường ngày tháng luôn có hậu tố `Z` (chuẩn ISO 8601).
- **Cấu hình**: Đăng ký converter trong `builder.Services.AddControllers().AddJsonOptions(...)`.
- **Kết quả**: Cả `sensors/history` và `action-history` đều trả về chuỗi timestamp kết thúc bằng `Z` chuẩn xác.

#### 2. Vô hiệu hóa HTTPS Redirection trong môi trường Development
- **Vấn đề**: Frontend chạy tại `http://localhost:5173` gọi API Backend `http://localhost:5171`. Nếu bật `app.UseHttpsRedirection()`, ASP.NET Core sẽ chuyển hướng request preflight `OPTIONS` sang `https://localhost:7039`. Trình duyệt chặn chuyển hướng preflight và báo lỗi CORS.
- **Giải pháp**: Bọc `app.UseHttpsRedirection()` trong điều kiện `if (!app.Environment.IsDevelopment())`.
- **Kết quả**: Request HTTP từ Frontend đến `http://localhost:5171` không bị 307 Redirect, CORS preflight hoạt động trơn tru.

#### 3. Bảng Hợp đồng API (API Contract) cho Frontend

| Phương thức & Endpoint | Dữ liệu gửi (Request) | Dữ liệu nhận (Response) | Mô tả |
|------------------------|-----------------------|-------------------------|-------|
| `POST /api/v1/auth/login` | `{username, password}` | `{token, expiresAt}` | Đăng nhập hệ thống (không cần token) |
| `GET /api/v1/sensors/latest` | Không | `[{sensorId, code, name, unit, value, createdAt}]` | 3 cảm biến với giá trị mới nhất |
| `GET /api/v1/sensors/chart-data` | Query: `?sensorId&from&to&maxPoints` | `{sensorId, code, name, unit, points:[{createdAt, value}]}` | Dữ liệu vẽ biểu đồ (tối đa 24h) |
| `GET /api/v1/sensors/history` | Query: `?sensorId&from&to&page&pageSize&sortDesc` | `{items:[{id, sensorId, sensorCode, sensorName, sensorUnit, value, createdAt}], page, pageSize, total, totalPages}` | Phân trang lịch sử đo |
| `GET /api/v1/devices` | Không | `[{id, code, name, isOn}]` | Danh sách 3 đèn LED và trạng thái bật/tắt |
| `POST /api/v1/devices/control` | `{deviceId, action: "ON"\|"OFF"}` | `{deviceId, action, status, state}` | Điều khiển bật/tắt đèn |
| `GET /api/v1/action-history` | Query: `?deviceId&status&from&to&page&pageSize` | `{items:[{id, deviceId, deviceCode, deviceName, userId, username, action, status, createdAt, respondedAt}], page, pageSize, total, totalPages}` | Phân trang lịch sử điều khiển |
| `GET /api/v1/profile` | Không | `{id, username, fullName, email, role, createdAt}` | Xem thông tin tài khoản hiện tại |
| `PUT /api/v1/profile` | `{fullName, email}` | `{id, username, fullName, email, role, createdAt}` | Cập nhật họ tên, email |
| `PUT /api/v1/profile/password` | `{currentPassword, newPassword}` | HTTP 204 No Content | Đổi mật khẩu |

**Quy ước chung cho Frontend:**
- Mọi request (trừ login) gửi kèm header: `Authorization: Bearer <token>`.
- Tham số thời gian `from`/`to` gửi dạng `date.toISOString()`.
- Lỗi trả về dạng RFC 7807 ProblemDetails `{title, status}`: hiển thị `title` trực tiếp cho người dùng.
- Mã lỗi đặc thù cần xử lý:
  - `401 Unauthorized`: Hết hạn/sai token $\rightarrow$ Đăng xuất, chuyển về trang `/login`.
  - `409 Conflict`: Thiết bị đang bận xử lý lệnh trước đó $\rightarrow$ Thông báo người dùng chờ vài giây.
  - `503 Service Unavailable`: Mất kết nối MQTT Broker $\rightarrow$ Cảnh báo hệ thống kết nối.
  - `504 Gateway Timeout`: ESP không phản hồi $\rightarrow$ Cảnh báo thiết bị phần cứng mất nguồn/mất WiFi.
