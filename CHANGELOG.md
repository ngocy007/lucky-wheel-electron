# Changelog

Tất cả những thay đổi quan trọng của project sẽ được ghi lại ở đây.

## [1.0.0] - 2025-12-31

### ✨ Tính năng
- Vòng quay may mắn với animation 10 giây
- UI vòng quay đẹp mắt với mũi tên chỉ vị trí trúng
- Popup chúc mừng khi có người trúng
- Panel quản trị (phím `)
  - Quản lý giải thưởng (thêm/xóa)
  - Quản lý người chơi (thêm/xóa)
  - Chỉ định người trúng hoặc random
  - Xem lịch sử trúng thưởng
  - Reset toàn bộ dữ liệu
- Tự động loại người đã trúng khỏi các lượt sau
- Lưu dữ liệu tự động vào file JSON
- Custom notification (không dùng alert/confirm)

### 🔧 Kỹ thuật
- Xây dựng bằng Electron
- Không cần database, dùng file JSON
- Phím tắt ` để mở admin
- Password admin: 123456

---

## Template cho version mới

Khi cập nhật version mới, copy template bên dưới và điền thông tin:

```markdown
## [X.X.X] - YYYY-MM-DD

### ✨ Tính năng mới
- Tính năng 1
- Tính năng 2

### 🐛 Bug fixes
- Fix lỗi 1
- Fix lỗi 2

### 🔧 Cải tiến
- Cải tiến 1
- Cải tiến 2

### ⚠️ Breaking changes
- Thay đổi không tương thích ngược (nếu có)
```

---

## Hướng dẫn sử dụng Changelog

### 1. Khi thêm tính năng mới
- Tạo section mới với version tiếp theo
- Thêm vào phần "✨ Tính năng mới"

### 2. Khi fix bug
- Thêm vào phần "🐛 Bug fixes"

### 3. Khi cải tiến hiệu năng hoặc UI
- Thêm vào phần "🔧 Cải tiến"

### 4. Quy tắc đánh version (Semantic Versioning)

**MAJOR.MINOR.PATCH** (ví dụ: 1.2.3)

- **MAJOR** (1.x.x): Thay đổi lớn, không tương thích ngược
- **MINOR** (x.2.x): Thêm tính năng mới, vẫn tương thích
- **PATCH** (x.x.3): Fix bug, cải tiến nhỏ

Ví dụ:
- 1.0.0 → 1.0.1: Fix lỗi vòng quay không dừng đúng vị trí
- 1.0.0 → 1.1.0: Thêm tính năng âm thanh khi quay
- 1.0.0 → 2.0.0: Thay đổi hoàn toàn cách lưu dữ liệu
