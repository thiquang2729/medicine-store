# Hướng Dẫn Sao Lưu & Khôi Phục Dữ Liệu PostgreSQL Lên Cloud AWS EC2

Tài liệu này hướng dẫn bạn cách xuất cơ sở dữ liệu Postgres từ container Docker cục bộ (ở máy local) của bạn, tải lên máy chủ Cloud (AWS EC2) và tiến hành khôi phục (restore) dữ liệu vào container Postgres trên Cloud.

---

## 🛠️ Quy Trình Thực Hiện Gồm 3 Bước

### Bước 1: Xuất (Export) Dữ Liệu Từ Máy Local
Để đảm bảo file sao lưu nhị phân (`.dump`) không bị lỗi font hoặc lỗi định dạng nhị phân trên hệ điều hành Windows (do PowerShell chuyển hướng `>` thường tự ý encode file), bạn hãy chạy chuỗi lệnh sau tại terminal máy local:

```bash
# 1. Tạo file dump nhị phân ngay bên trong thư mục /tmp của container db cục bộ
docker exec -it khunglongchau-db pg_dump -U admin -F c -b -v -f /tmp/data_backup.dump khunglongchau

# 2. Sao chép (copy) file dump vừa tạo từ container ra thư mục hiện tại của máy local
docker cp khunglongchau-db:/tmp/data_backup.dump ./data_backup.dump

# 3. Xóa file dump tạm thời bên trong container để tránh tốn dung lượng
docker exec -it khunglongchau-db rm /tmp/data_backup.dump
```
*Sau khi chạy xong, bạn sẽ thấy file nhị phân `data_backup.dump` xuất hiện trực tiếp trong thư mục dự án ở máy local của bạn.*

---

### Bước 2: Tải File Dump Lên Máy Chủ Cloud (AWS EC2)
Sử dụng lệnh `scp` kèm theo file khóa riêng tư `.pem` của bạn để tải file dump lên thư mục `/home/ubuntu` của máy chủ AWS EC2. 
*(Chạy lệnh này từ máy local của bạn)*:

```bash
scp -i "đường_dẫn_đến_file/khunglongchau-key.pem" data_backup.dump ubuntu@<IP_TĨNH_AWS_EC2>:/home/ubuntu/
```
**Giải thích:**
- `-i "..."`: Đường dẫn đến file private key `.pem` dùng để kết nối AWS EC2.
- `data_backup.dump`: File nguồn cần tải lên.
- `ubuntu@<IP_TĨNH_AWS_EC2>:/home/ubuntu/`: Tên người dùng (`ubuntu`), IP máy chủ EC2 và thư mục đích trên máy chủ.

---

### Bước 3: Khôi Phục (Restore) Dữ Liệu Vào DB Trên Cloud
Sau khi file dump đã được tải lên thành công, hãy SSH vào máy chủ EC2 để thực hiện khôi phục.

1. **SSH vào máy chủ EC2**:
   ```bash
   ssh -i "đường_dẫn_đến_file/khunglongchau-key.pem" ubuntu@<IP_TĨNH_AWS_EC2>
   ```

2. **Khôi phục dữ liệu vào container database trên EC2**:
   *(Hãy đảm bảo rằng các container trên Cloud đã được khởi chạy bằng lệnh `docker compose up -d`)*
   
   Chạy lệnh khôi phục dữ liệu nhị phân:
   ```bash
   docker exec -i khunglongchau-db pg_restore -U admin -d khunglongchau -v < /home/ubuntu/data_backup.dump
   ```

3. **Kiểm tra dữ liệu sau khi khôi phục thành công**:
   Chạy câu lệnh SQL trực tiếp xem dữ liệu bảng sản phẩm đã được nhập thành công chưa:
   ```bash
   docker exec -it khunglongchau-db psql -U admin -d khunglongchau -c "SELECT COUNT(*) FROM \"Product\";"
   ```
