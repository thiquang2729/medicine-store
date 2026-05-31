# Cấu trúc Thư mục Dự án

Tài liệu này mô tả chi tiết cấu trúc thư mục và vai trò của các thành phần trong dự án **khunglongchau-web** (cửa hàng y tế/dược phẩm trực tuyến).

## Cấu trúc Tổng quan

```
khunglongchau-web/
├── .next/                  # Thư mục build/cache của Next.js
├── actions/                # Các Server Actions xử lý logic nghiệp vụ phía máy chủ
├── app/                    # Thư mục chính của Next.js App Router (pages, APIs, layout)
│   ├── (admin)/            # Route group dành cho giao diện quản trị viên
│   ├── (client)/           # Route group dành cho giao diện khách hàng
│   ├── admin/              # Giao diện/chức năng admin
│   ├── api/                # Các API routes
│   └── studio/             # Tích hợp Sanity Studio (CMS)
├── components/             # Các React components dùng chung trong giao diện
│   ├── admin/              # Các components riêng cho admin
│   ├── reviews/            # Các components phục vụ phần đánh giá sản phẩm
│   ├── shop/               # Các components phục vụ trang cửa hàng
│   └── ui/                 # Các UI components cơ bản (Shadcn/UI...)
├── config/                 # Các file cấu hình hệ thống (ví dụ: VNPay)
├── constants/              # Chứa các hằng số dùng chung trong ứng dụng
├── db/                     # Khởi tạo và quản lý kết nối cơ sở dữ liệu
├── docs/                   # Tài liệu hướng dẫn (ví dụ: Cấu hình email)
├── hooks/                  # Các Custom React Hooks dùng trong ứng dụng
├── images/                 # Tài nguyên hình ảnh tĩnh
├── lib/                    # Thư viện tiện ích, cấu hình xác thực, dịch vụ gửi email, stripe
├── prisma/                 # Schema cấu hình cơ sở dữ liệu Prisma (schema.prisma)
├── public/                 # Các tệp tĩnh truy cập trực tiếp từ trình duyệt
├── sanity/                 # Cấu hình CMS Sanity quản lý nội dung
├── services/               # Lớp dịch vụ tương tác dữ liệu (sản phẩm, đơn hàng, blog, banner...)
├── types/                  # Định nghĩa kiểu dữ liệu TypeScript
└── vnpay_nodejs/           # Mã nguồn liên quan đến tích hợp thanh toán qua VNPay
```

## Chi tiết các thư mục chính

### 1. `app/` (Next.js App Router)
Thư mục chứa toàn bộ các trang và API của ứng dụng theo cơ chế App Router mới của Next.js:
- `(admin)/` & `(client)/`: Phân chia layout và phân quyền giao diện người dùng và quản trị viên một cách sạch sẽ.
- `api/`: Các endpoint xử lý logic nghiệp vụ phía backend (thanh toán, webhook, chat...).
- `studio/`: Tích hợp CMS Sanity để biên tập viên dễ dàng chỉnh sửa bài viết, banner.

### 2. `actions/` (Server Actions)
Nơi chứa các hàm React Server Actions để trực tiếp gọi từ Client Components mà không cần thông qua API truyền thống:
- `couponActions.ts`: Xử lý mã giảm giá.
- `createCheckoutSession.ts`: Khởi tạo phiên thanh toán Stripe.
- `product.action.ts`: Các hành động liên quan đến sản phẩm.
- `review.action.ts`: Các hành động liên quan đến đánh giá.

### 3. `components/` (Giao diện React)
Bao gồm các component từ cơ bản (UI) đến các khối giao diện phức tạp:
- `admin/`, `reviews/`, `shop/`, `ui/`.
- Các file component độc lập như `AddToCartButton.tsx`, `Header.tsx`, `Footer.tsx`, `SearchBar.tsx`, `OrdersComponent.tsx`... giúp quản lý UI dạng module hóa hiệu quả.

### 4. `services/` (Data Services)
Đảm nhận vai trò truy vấn cơ sở dữ liệu thông qua Prisma/Sanity và cung cấp dữ liệu cho ứng dụng:
- `product.service.ts`: Lấy danh sách sản phẩm, chi tiết sản phẩm.
- `order.service.ts`: Xử lý đơn hàng.
- `category.service.ts`, `blog.service.ts`, `coupon.service.ts`, `review.service.ts`...

### 5. `lib/` (Thư viện & Utilities)
Chứa các thiết lập và các module phụ trợ:
- `email-service.ts` & `email-templates.tsx`: Thiết lập gửi email thông báo đơn hàng, trạng thái.
- `stripe.ts`: Cấu hình Stripe SDK.
- `adminAuth.ts`: Middleware/tiện ích phục vụ xác thực quyền admin.
- `utils.ts`: Chứa helper function như gộp class CSS (`cn`).

### 6. `prisma/` (ORM)
- `schema.prisma`: Định nghĩa cấu trúc dữ liệu cho Database (PostgreSQL/MySQL), phục vụ việc migration và tạo kiểu dữ liệu an toàn (Typesafe).

---

## Các tệp cấu hình quan trọng ở thư mục gốc và Docker

- `docker-compose.yml`: Cấu hình chạy toàn bộ hệ thống đa dịch vụ trên Docker, bao gồm:
  - **db**: Cơ sở dữ liệu PostgreSQL (cổng `5432`).
  - **web**: Ứng dụng Next.js Fullstack đóng vai trò là Frontend kiêm Core Backend (cổng `3000`).
  - **vnpay-backend**: Ứng dụng Express.js đóng vai trò Payment Gateway Backend phụ trợ (cổng `8888`).
- `Dockerfile`: Cấu hình Docker multi-stage để xây dựng và tối ưu ứng dụng Next.js (chế độ `standalone` và tự động sinh Prisma Client).
- `vnpay_nodejs/Dockerfile`: Cấu hình Docker để đóng gói ứng dụng Node.js Express cho dịch vụ thanh toán VNPay.
- `.env`: Lưu trữ biến môi trường (Database URL, Stripe key, VNPay config...).
- `package.json`: Khai báo các thư viện phụ thuộc và các câu lệnh script chạy dự án.
- `tsconfig.json`: Cấu hình TypeScript cho dự án.
- `sanity.config.ts` & `sanity.cli.ts`: Cấu hình CMS Sanity.

