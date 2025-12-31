# Hướng dẫn Build và Update Version

## 📦 Build lần đầu

### 1. Cài đặt dependencies (nếu chưa)
```bash
npm install
```

### 2. Build file cài đặt
```bash
npm run build:win
```

### 3. Lấy file cài đặt
File `.exe` sẽ được tạo trong thư mục:
```
dist/Vòng Quay May Mắn Setup 1.0.0.exe
```

## 🔄 Update Version mới

### Bước 1: Sửa version
Mở `package.json`, tìm dòng:
```json
"version": "1.0.0"
```

Đổi thành version mới theo quy tắc:
- **Bug fix nhỏ**: 1.0.0 → 1.0.1
- **Tính năng mới**: 1.0.0 → 1.1.0
- **Thay đổi lớn**: 1.0.0 → 2.0.0

Ví dụ:
```json
"version": "1.1.0"
```

### Bước 2: Build version mới
```bash
npm run build:win
```

### Bước 3: Phát hành
File mới sẽ có tên theo version:
```
dist/Vòng Quay May Mắn Setup 1.1.0.exe
```

Gửi file này cho người dùng.

## 💾 Dữ liệu khi Update

**QUAN TRỌNG**: Khi user cài đặt version mới:
- ✅ Dữ liệu `data.json` sẽ **ĐƯỢC GIỮ NGUYÊN**
- ✅ Danh sách người chơi không bị mất
- ✅ Danh sách giải thưởng không bị mất
- ✅ Lịch sử trúng thưởng vẫn còn

File `data.json` được lưu tại:
```
C:\Users\[TenUser]\AppData\Roaming\vong-quay-may-man\data.json
```

## 🎨 Thêm Icon (Tùy chọn)

### 1. Tạo thư mục build
```bash
mkdir build
```

### 2. Thêm icon
- Tạo file icon `.ico` (256x256 pixels)
- Đặt tên `icon.ico`
- Copy vào thư mục `build/`

### 3. Cập nhật package.json
Thêm vào phần `"win"`:
```json
"win": {
  "target": [...],
  "icon": "build/icon.ico"
}
```

### 4. Build lại
```bash
npm run build:win
```

## 🚀 Các lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm start` | Chạy app để test |
| `npm run build:win` | Build file cài đặt Windows |
| `npm run build:dir` | Build thư mục (test nhanh) |
| `npm run build` | Build cho tất cả platform |

## 📝 Checklist trước khi phát hành

- [ ] Test app bằng `npm start`
- [ ] Sửa version trong `package.json`
- [ ] Chạy `npm run build:win`
- [ ] Test file `.exe` vừa build
- [ ] Kiểm tra app có chạy đúng không
- [ ] Kiểm tra version hiển thị (nếu có)
- [ ] Gửi file cho người dùng

## ❓ FAQ

**Q: User phải gỡ version cũ trước khi cài mới không?**
A: Không cần! File `.exe` sẽ tự động gỡ version cũ và cài version mới.

**Q: Dữ liệu có bị mất không?**
A: Không, file `data.json` được giữ nguyên.

**Q: Build bao lâu?**
A: Lần đầu khoảng 2-3 phút. Các lần sau nhanh hơn.

**Q: File build có dung lượng bao nhiêu?**
A: Khoảng 150-200 MB (do có Electron runtime).

**Q: Có thể build trên Mac/Linux không?**
A: Có, nhưng cần config thêm. Hiện tại chỉ config build Windows.
