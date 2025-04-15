# 🔐 Hệ Thống Kiểm Tra An Ninh Bằng Vân Tay

## 🧠 Thông Tin Môn Học

- **Môn học:** Thiết Kế Kiến Trúc Phần Mềm  
- **Giảng viên:** Nguyễn Mạnh Hùng  
- **Đề tài:** 26. Hệ Thống Kiểm Tra An Ninh Bằng Vân Tay  

---

## 📌 Tổng Quan Dự Án

Dự án này triển khai một hệ thống kiểm tra an ninh bằng vân tay trong khuôn khổ môn học *Thiết Kế Kiến Trúc Phần Mềm*. Hệ thống được xây dựng theo kiến trúc microservice và bao gồm **2 dịch vụ chính**:

1. **Model Management Service** - Quản lý mô hình đã huấn luyện
2. **Employee Statistics Service** - Thống kê nhân viên

Hệ thống sử dụng các mô hình học máy để nhận dạng vân tay và cung cấp thống kê, đảm bảo an ninh cho các khu vực hạn chế với cơ chế cảnh báo khi có truy cập trái phép.

---

## 🚀 Tính Năng

### 🧠 Model Management Service
> Quản lý và huấn luyện mô hình nhận dạng vân tay.

- Lưu trữ và quản lý các mô hình nhận dạng vân tay đã huấn luyện.
- Theo dõi lịch sử và phiên bản của các mô hình.
- Huấn luyện mô hình phát hiện vùng vân tay trong ảnh.
- Huấn luyện mô hình nhận diện vân tay của nhân viên.

### 👥 Employee Statistics Service
> Quản lý thông tin nhân viên và thống kê truy cập.

- Quản lý hồ sơ nhân viên và mẫu vân tay.
- Lưu trữ dữ liệu vân tay an toàn.
- Thống kê lịch sử truy cập và danh tính nhân viên.
- Nhận diện nhân viên qua camera giám sát.
- Phát cảnh báo khi phát hiện truy cập trái phép.

---

## 🧰 Công Nghệ Sử Dụng

| Công Nghệ     | Mục Đích |
|---------------|----------|
| **Java & Spring Boot** | Xây dựng các microservice |
| **Maven**              | Quản lý phụ thuộc và quá trình build |
| **MySQL**              | Lưu trữ thông tin nhân viên và metadata mô hình |
| **MinIO**              | Lưu trữ file mô hình và dữ liệu vân tay |

---
