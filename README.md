# Vòng Quay May Mắn

Ứng dụng vòng quay may mắn được xây dựng bằng Electron.

## Yêu cầu

- Node.js (v16 trở lên)
- npm

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm start
```

## Build ứng dụng

### Build file cài đặt Windows (.exe)

```bash
npm run build:win
```

File cài đặt sẽ được tạo trong thư mục `dist/`

### Build để test (không tạo installer)

```bash
npm run build:dir
```

## Cập nhật Version

### Bước 1: Thay đổi version trong package.json

Mở file `package.json` và sửa dòng `version`:

```json
{
  "version": "1.0.0"  // Đổi thành "1.1.0", "2.0.0", etc.
}
```

### Quy ước đánh version:

- **1.0.0** → **1.0.1**: Bug fixes nhỏ
- **1.0.0** → **1.1.0**: Thêm tính năng mới
- **1.0.0** → **2.0.0**: Thay đổi lớn

### Bước 2: Build version mới

```bash
npm run build:win
```

### Bước 3: Cài đặt update

Khi user chạy file `.exe` mới, ứng dụng sẽ tự động:
- Gỡ version cũ
- Cài đặt version mới
- **Giữ nguyên** file `data.json` (dữ liệu người chơi và giải thưởng)

## Phím tắt Admin

Nhấn phím **`** (backtick) để mở panel quản trị.

Mật khẩu mặc định: **123456**

## Cấu trúc thư mục

```
quay/
├── main.js          # File chính Electron
├── index.html       # UI vòng quay
├── wheel.js         # Logic vòng quay
├── admin.html       # UI quản trị
├── admin.js         # Logic quản trị
├── data.json        # Dữ liệu (auto-generated)
├── package.json     # Config npm
└── dist/           # Thư mục chứa file build
```

## Tính năng

### UI Vòng Quay
- Vòng quay với animation mượt mà (10 giây)
- Hiển thị người trúng thưởng
- Popup chúc mừng

### UI Admin (phím `)
- Quản lý giải thưởng (thêm/xóa)
- Quản lý người chơi (thêm/xóa)
- Chỉ định người trúng hoặc random
- Xem lịch sử trúng thưởng
- Reset toàn bộ dữ liệu

### Logic đặc biệt
- Người đã trúng sẽ tự động bị loại khỏi các lượt quay sau
- Giải thưởng có thể chỉ định người trúng cụ thể
- Dữ liệu tự động lưu vào file JSON

## License

MIT
