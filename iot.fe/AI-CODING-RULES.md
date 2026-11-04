# Bộ quy tắc cho AI khi code dự án IoT Monitoring & Control Hub (`iot`)

> Áp dụng quy chuẩn kiến trúc và checklist từ `cbs-fe`.
> Dùng làm checklist bắt buộc trước khi AI viết/sửa code trong repo này.

---

## 0. Bối cảnh dự án (IoT Monitoring & Control Hub)

- **IoT Monitoring & Control Hub** - Hệ thống giám sát và điều khiển thiết bị IoT (ESP8266, DHT11, LDR, 3 LED) qua giao thức MQTT và RESTful API.
- Stack: **React 18 / Vite**, **Tailwind CSS**, **Zustand 5**, **Recharts**, **Lucide React**, **clsx**.
- Hai layout chính:
  - `(admin)/` - Layout sidebar + header cố định với các phân hệ: `tong-quan` (Dashboard), `du-lieu-cam-bien` (Sensor Data), `lich-su-hoat-dong` (Action History), `ho-so` (Profile & Academic Resources), `kien-truc` (Architecture & API Specs), `cau-hinh` (System & MQTT Settings).
  - `dang-nhap/` - Layout đăng nhập độc lập.

---

## 1. Giới hạn & cấu trúc file

- **Mỗi file < 600 dòng.** Vượt ngưỡng -> tách ngay: helper riêng, component con riêng, `const.tsx`, `type.ts`.
- Mỗi **page** gồm đúng 3 file cơ bản:
  ```
  src/app/(admin)/<page-slug>/
  ├── const.tsx   # hằng số, cấu hình cột bảng/form, options
  ├── type.ts     # type/interface cục bộ của page
  └── page.tsx    # logic + JSX
  ```
- **Không tạo thư mục `hooks/` riêng.** Vị trí đặt hook theo phạm vi dùng:
  | Phạm vi            | Vị trí                                            |
  | ------------------ | ------------------------------------------------- |
  | 1 page             | inline trong `page.tsx`                           |
  | 2–3 page liên quan | file trong thư mục page cha (`useSensorFilter.ts`)|
  | Toàn app (>= 3 nơi)| `src/lib/utils/hooks.ts`                          |
- Mỗi file trong `lib/api/` = **một domain nghiệp vụ**, chỉ export **hàm async**.

## 2. Thứ tự code bên trong component (bắt buộc)

```
1. Import
2. Khai báo ngoài component (type, const, helper thuần)
3. Trong component, theo đúng thứ tự:
   a. Biến      -> useRef, useState, useMemo, useContext, custom hook / store
   b. Function  -> useCallback (event handler, transform data)
   c. useEffect
   d. Early return (loading / error / empty)
   e. Return JSX
```

Quy tắc bổ sung:
- `useMemo` cho data transform và cho columns/config.
- `useCallback` cho mọi event handler.
- **Không khai báo `function handleX` thường bên trong component** -> bắt buộc `useCallback`, hoặc đưa ra ngoài component nếu không cần closure.

## 3. Quy ước đặt tên

| Đối tượng                     | Convention                | Ví dụ                                                      |
| ----------------------------- | ------------------------- | ---------------------------------------------------------- |
| Thư mục page / Component file | PascalCase / slug         | `SensorCard/`, `tong-quan/`                                |
| Util/helper file              | camelCase                 | `date.ts`, `string.ts`                                     |
| React component               | PascalCase                | `SensorDataTable`, `LiveClock`                             |
| Hook                          | `use` + PascalCase        | `useAppStore`, `useAuthStore`                              |
| Event handler                 | `handle` + PascalCase     | `handleSearch`, `handleToggle`                             |
| Boolean state                 | `is/has/can` + PascalCase | `isLoading`, `isLiveStreaming`                             |
| Hằng số module                | SCREAMING_SNAKE_CASE      | `DEFAULT_PAGE_SIZE`, `INITIAL_CHART_DATA`                  |
| Type / Interface              | PascalCase                | `SensorRecord`, `ActionRecord`                             |
| Enum                          | PascalCase                | `SensorTypeEnum`, `DeviceStatusEnum`                       |

## 4. Hằng số & Enum

- **Cấm hard-code chuỗi/số mang ngữ nghĩa phân loại** (`type`, `status`, `role`, `mode`, `action`...). Bắt buộc khai báo `enum` và derive options từ enum đó.

## 5. DateTime & Chuỗi

- Mọi field DateTime là `string` ISO 8601 hoặc format chuẩn qua `lib/utils/date.ts`.
- Tìm kiếm, chuẩn hóa chuỗi và đối sánh ngày giờ qua `lib/utils/string.ts`.

---

## Checklist nhanh trước khi commit code

```
[ ] File < 600 dòng; page có đủ const.tsx / type.ts / page.tsx
[ ] Không tạo thư mục hooks/ riêng bừa bãi
[ ] Thứ tự trong component: biến -> useCallback -> useEffect -> early return -> render
[ ] Không có function thường khai báo trong component (chỉ useCallback hoặc ngoài component)
[ ] Đặt tên đúng convention (component/hook/handler/boolean/const/type/enum)
[ ] Import đúng 4 nhóm, có `import type` cho type-only
[ ] Không hard-code chuỗi/số phân loại -> dùng enum
[ ] JSX > 40 dòng hoặc lặp lại -> tách component con
[ ] Conditional class -> dùng clsx() / cn()
[ ] DateTime parse/format qua lib/utils/date.ts
[ ] Hàm normalize chuỗi -> dùng từ lib/utils/string.ts
```
