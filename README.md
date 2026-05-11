# 💊 Nhà Thuốc Khủng Long Châu

> Website thương mại điện tử dược phẩm - Mua thuốc, thực phẩm chức năng và thiết bị y tế trực tuyến

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/) [![Sanity](https://img.shields.io/badge/Sanity-3.95-red)](https://www.sanity.io/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)](https://tailwindcss.com/) [![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com/)

---

## 📱 Giới Thiệu

**Nhà Thuốc Khủng Long Châu** là website thương mại điện tử chuyên về dược phẩm, được xây dựng trên nền tảng Next.js 15 App Router. Hệ thống cung cấp đầy đủ tính năng mua sắm trực tuyến từ duyệt sản phẩm, giỏ hàng, thanh toán đa kênh (VNPay, MoMo, COD), đến quản lý đơn hàng và hệ thống blog sức khỏe.

## ✨ Tính Năng Chính

### 🛒 Mua Sắm
- Duyệt sản phẩm theo danh mục, thương hiệu, loại sản phẩm
- Tìm kiếm sản phẩm nhanh chóng
- Xem thông tin chi tiết thuốc (thành phần, công dụng, liều dùng, tác dụng phụ...)
- Giỏ hàng với quản lý số lượng
- Danh sách yêu thích (wishlist)

### 💳 Thanh Toán Đa Kênh
- Thanh toán khi nhận hàng (COD)
- Thanh toán qua VNPay
- Thanh toán qua MoMo
- Áp dụng mã giảm giá (coupon)

### 📦 Quản Lý Đơn Hàng
- Theo dõi trạng thái đơn hàng (chờ xử lý → xử lý → vận chuyển → giao hàng)
- Lịch sử đơn hàng
- Email xác nhận đơn hàng tự động

### ⭐ Đánh Giá Sản Phẩm
- Đánh giá sao (1-5)
- Viết nhận xét với ưu/nhược điểm
- Upload hình ảnh đánh giá
- Phản hồi từ admin

### 📰 Blog Sức Khỏe
- Bài viết về sức khỏe, sơ cấp cứu
- Phân loại theo danh mục blog
- Rich text content với hình ảnh

### 💬 Chat Hỗ Trợ
- Chat trực tiếp với nhân viên tư vấn
- Giao diện quản lý chat cho admin

### 🎯 Banner & Khuyến Mãi
- Banner quảng cáo carousel
- Popup khuyến mãi với tần suất tùy chỉnh
- Sản phẩm nổi bật, deal hot

### 🔐 Xác Thực & Phân Quyền
- Đăng nhập/Đăng ký qua Clerk (Email, Google, v.v.)
- Phân quyền Admin / Khách hàng
- Quản lý địa chỉ giao hàng

## 🛠️ Công Nghệ Sử Dụng

**Frontend:** Next.js 15 (App Router, Turbopack), React 19, TailwindCSS 4, Framer Motion, Zustand, Radix UI  
**Backend/CMS:** Sanity CMS, Next.js API Routes, Server Actions  
**Auth:** Clerk  
**Thanh toán:** VNPay, MoMo  
**Email:** Nodemailer  
**Khác:** TypeScript, Embla Carousel, Lucide Icons, React Hot Toast

## ⚡ Cài Đặt & Chạy Dự Án

### 1️⃣ Clone Repository & Cài Dependencies

```bash
git clone <repository-url>
cd khunglongchau-web

# Cài đặt dependencies
npm install
```

### 2️⃣ Cấu Hình Biến Môi Trường

```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

**Biến môi trường quan trọng:**

```env
# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your-read-token
SANITY_API_WRITE_TOKEN=your-write-token

# VNPay
VNP_TMNCODE=your-tmncode
VNP_HASHSECRET=your-hash-secret
VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNP_RETURN_URL="http://localhost:3000/vnpay-return"

# MoMo
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_PARTNER_CODE=MOMO
MOMO_REDIRECT_URL=http://localhost:3000/momo-return

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Store Info
STORE_NAME="Nhà Thuốc Khủng Long Châu"
STORE_SUPPORT_PHONE="0123456789"
STORE_SUPPORT_EMAIL="support@example.com"
```

### 3️⃣ Cấu Hình Sanity CMS

1. Tạo project tại [Sanity.io](https://www.sanity.io/)
2. Cập nhật `NEXT_PUBLIC_SANITY_PROJECT_ID` và `NEXT_PUBLIC_SANITY_DATASET` trong `.env`
3. Tạo API tokens (Read/Write) tại Sanity Dashboard → Settings → API
4. Truy cập Sanity Studio tại: `http://localhost:3000/studio`

### 4️⃣ Chạy Ứng Dụng

```bash
# Chạy development server (Turbopack)
npm run dev
# App chạy tại http://localhost:3000

# Build production
npm run build

# Chạy production
npm start
```

## 📁 Cấu Trúc Dự Án

```
khunglongchau-web/
├── app/
│   ├── (client)/                      # Route group - Trang khách hàng
│   │   ├── page.tsx                   # Trang chủ
│   │   ├── product/                   # Chi tiết sản phẩm
│   │   ├── category/                  # Danh mục sản phẩm
│   │   ├── brand/                     # Sản phẩm theo thương hiệu
│   │   ├── shop/                      # Cửa hàng
│   │   ├── cart/                      # Giỏ hàng
│   │   ├── orders/                    # Đơn hàng
│   │   ├── wishlist/                  # Yêu thích
│   │   ├── blog/                      # Blog sức khỏe
│   │   ├── search/                    # Tìm kiếm
│   │   ├── deal/                      # Khuyến mãi
│   │   ├── vnpay-return/              # Callback VNPay
│   │   ├── momo-return/               # Callback MoMo
│   │   └── success/                   # Đặt hàng thành công
│   ├── (admin)/                       # Route group - Admin
│   │   └── test-email/                # Test email
│   ├── api/                           # API Routes
│   │   ├── vnpay/                     # VNPay payment API
│   │   ├── coupon/                    # Coupon API
│   │   ├── reviews/                   # Reviews API
│   │   ├── chat/                      # Chat API
│   │   ├── search/                    # Search API
│   │   ├── admin/                     # Admin API
│   │   ├── send-order-confirmation/   # Email API
│   │   ├── save-address.ts/           # Address API
│   │   └── webhook/                   # Webhook handlers
│   ├── studio/                        # Sanity Studio
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
│
├── components/                        # React components
│   ├── Header.tsx                     # Header & Navigation
│   ├── Footer.tsx                     # Footer
│   ├── SearchBar.tsx                  # Thanh tìm kiếm
│   ├── ProductCard.tsx                # Card sản phẩm
│   ├── ProductInfo.tsx                # Thông tin chi tiết SP
│   ├── Shop.tsx                       # Trang cửa hàng
│   ├── HomeBannerClient.tsx           # Banner carousel
│   ├── PromotionPopup.tsx             # Popup khuyến mãi
│   ├── OrderDetailDialog.tsx          # Chi tiết đơn hàng
│   ├── CustomChat.tsx                 # Chat widget
│   ├── AdminChatInterface.tsx         # Admin chat
│   ├── CouponInput.tsx                # Nhập mã giảm giá
│   ├── AddressForm.tsx                # Form địa chỉ
│   ├── reviews/                       # Components đánh giá
│   ├── shop/                          # Components cửa hàng
│   ├── admin/                         # Components admin
│   └── ui/                            # UI primitives (Radix)
│
├── actions/                           # Server Actions
│   ├── couponActions.ts               # Xử lý coupon
│   └── createCheckoutSession.ts       # Tạo checkout
│
├── hooks/                             # Custom React Hooks
│   ├── useCoupon.ts                   # Hook quản lý coupon
│   └── useUserEmail.ts                # Hook lấy email user
│
├── sanity/                            # Sanity CMS config
│   ├── schemaTypes/                   # Schema definitions
│   ├── queries/                       # GROQ queries
│   └── lib/                           # Sanity client config
│
├── config/                            # Cấu hình
│   └── vnpay.json                     # VNPay config
│
├── constants/                         # Hằng số
├── types/                             # TypeScript types
├── lib/                               # Utilities
├── store.ts                           # Zustand store (giỏ hàng)
├── middleware.ts                      # Clerk auth middleware
├── vnpay_nodejs/                      # VNPay Node.js integration
└── database_schema.md                 # SQL schema documentation
```

## 🔧 Scripts

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| Dev | `npm run dev` | Chạy dev server với Turbopack |
| Build | `npm run build` | Build production |
| Start | `npm start` | Chạy production server |
| Lint | `npm run lint` | Kiểm tra lỗi ESLint |
| Typegen | `npm run typegen` | Generate TypeScript types từ Sanity schema |

## 📖 Tài Liệu

| Tài liệu | Mô tả |
|----------|-------|
| [`database_schema.md`](database_schema.md) | Cấu trúc database SQL (chuyển đổi từ Sanity) |

## 🐛 Xử Lý Lỗi Thường Gặp

### ❌ Lỗi Clerk Authentication

**Triệu chứng:** Không đăng nhập được, redirect loop  
**Giải pháp:**
- Kiểm tra `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY` trong `.env`
- Đảm bảo domain đã được cấu hình trong Clerk Dashboard

### ❌ Lỗi Sanity

**Triệu chứng:** Không load được sản phẩm, Studio trắng  
**Giải pháp:**
- Kiểm tra `NEXT_PUBLIC_SANITY_PROJECT_ID` và tokens
- Truy cập `/studio` để kiểm tra kết nối
- Chạy `npm run typegen` để cập nhật types

### ❌ Lỗi VNPay/MoMo

**Triệu chứng:** Thanh toán không callback  
**Giải pháp:**
- Kiểm tra `VNP_RETURN_URL` và `MOMO_REDIRECT_URL` đúng URL
- Với MoMo sandbox, cần ngrok cho IPN URL
- Kiểm tra `VNP_HASHSECRET` chính xác

### ❌ Lỗi Email

**Triệu chứng:** Không gửi được email xác nhận  
**Giải pháp:**
- Dùng App Password (không phải mật khẩu tài khoản) cho Gmail
- Bật "Less secure app access" hoặc dùng App Password 2FA
- Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD`

### ❌ Lỗi Build

**Triệu chứng:** Build failed  
**Giải pháp:**
```bash
# Xóa cache và build lại
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Liên Hệ & Hỗ Trợ

- **Email:** khunglongchaucompany@gmail.com
- **Hotline:** 0375232103

---

<div align="center">

**Made with ❤️ using Next.js & Sanity CMS**

</div>
