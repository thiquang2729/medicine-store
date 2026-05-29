Cách 2: Copy file lên Cloud rồi mới Restore
Bước 1: Tải file dump từ máy local lên thư mục của user SSH trên Cloud Chạy lệnh này từ máy local:

bash
scp data_backup.dump <tên_user_ssh_cloud>@<ip_máy_chủ_cloud>:/home/<tên_user_ssh_cloud>/
Bước 2: SSH vào máy chủ Cloud

bash
ssh <tên_user_ssh_cloud>@<ip_máy_chủ_cloud>
Bước 3: Chạy lệnh Restore từ bên trong máy chủ Cloud

bash
docker exec -i khunglongchau-db pg_restore -U admin -d khunglongchau -1 < /home/<tên_user_ssh_cloud>/data_backup.dump