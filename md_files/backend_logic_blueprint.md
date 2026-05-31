# Bản Thiết Kế Chi Tiết Backend Logic & Queries (Prisma)

Tài liệu này ánh xạ toàn bộ các câu query từ Sanity (GROQ) sang logic của Prisma (PostgreSQL) dựa trên file cấu trúc cơ sở dữ liệu `database_schema.md` của dự án. 
Với kiến trúc này, bạn sẽ tạo một thư mục `services/` để chứa các hàm truy vấn.

## 1. Cấu trúc thư mục Services đề xuất
```text
services/
├── banner.service.ts
├── blog.service.ts
├── category.service.ts
├── coupon.service.ts
├── location.service.ts
├── order.service.ts
├── product.service.ts
└── review.service.ts
```

---

## 2. Chi tiết các hàm Logic & Queries

### 2.1. `services/banner.service.ts`
Thay thế các truy vấn `BANNER_QUERY` và `POPUP_BANNER_QUERY`.

```typescript
import { prisma } from "@/db";

export const bannerService = {
  // Lấy các banner thông thường (không phải popup)
  getBanners: async () => {
    return await prisma.banner.findMany({
      where: {
        isActive: true,
        isPopup: false,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        alt: true,
        description: true,
      },
    });
  },

  // Lấy popup banner
  getPopupBanner: async () => {
    return await prisma.banner.findFirst({
      where: {
        isActive: true,
        isPopup: true,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        alt: true,
        description: true,
        popupFrequency: true,
      },
    });
  },
};
```

### 2.2. `services/product.service.ts`
Thay thế `DEAL_PRODUCTS`, `PRODUCT_BY_SLUG_QUERY`, `BRAND_QUERY`, `BRANDS_QUERY`.

```typescript
import { prisma } from "@/db";

export const productService = {
  // Lấy sản phẩm hot/deal
  getDealProducts: async () => {
    return await prisma.product.findMany({
      where: { status: 'hot' },
      orderBy: { name: 'asc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: {
          include: { category: true }
        }
      }
    });
  },

  // Lấy chi tiết sản phẩm bằng slug
  getProductBySlug: async (slug: string) => {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        productCategories: { include: { category: true } },
        drugInfo: {
          include: {
            ingredients: { orderBy: { sortOrder: 'asc' } },
            sections: true
          }
        }
      }
    });
  },

  // Lấy tất cả Brands
  getBrands: async () => {
    return await prisma.brand.findMany({
      orderBy: { title: 'asc' }
    });
  },
  
  // Lấy thương hiệu của 1 sản phẩm
  getBrandByProductSlug: async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { brand: { select: { title: true } } }
    });
    return product?.brand;
  }
};
```

### 2.3. `services/category.service.ts`
Thay thế `CATEGORIES_QUERY`.

```typescript
import { prisma } from "@/db";

export const categoryService = {
  // Lấy danh mục kèm số lượng sản phẩm
  getCategoriesWithProductCount: async () => {
    const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { productCategories: true }
        }
      }
    });
    
    return categories.map(cat => ({
      ...cat,
      productCount: cat._count.productCategories
    }));
  }
};
```

### 2.4. `services/blog.service.ts`
Thay thế các truy vấn về Blog.

```typescript
import { prisma } from "@/db";

export const blogService = {
  getLatestBlog: async () => {
    return await prisma.blog.findMany({
      where: { isLatest: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: true,
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getAllBlog: async (quantity: number) => {
    return await prisma.blog.findMany({
      orderBy: { publishedAt: 'desc' },
      take: quantity,
      include: {
        author: true,
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getSingleBlog: async (slug: string) => {
    return await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, imageUrl: true } },
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getOthersBlog: async (slug: string, quantity: number) => {
    return await prisma.blog.findMany({
      where: { slug: { not: slug } },
      orderBy: { publishedAt: 'desc' },
      take: quantity,
      select: {
        id: true,
        title: true,
        slug: true,
        mainImageUrl: true,
        publishedAt: true,
        author: { select: { name: true, imageUrl: true } },
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getBlogCategories: async () => {
    return await prisma.blogCategory.findMany({
      orderBy: { title: 'asc' }
    });
  }
};
```

### 2.5. `services/review.service.ts`
Thay thế các query về Đánh giá.

```typescript
import { prisma } from "@/db";

export const reviewService = {
  getReviewsByProduct: async (productId: string) => {
    return await prisma.review.findMany({
      where: { 
        productId: productId,
        isApproved: true 
      },
      orderBy: { reviewDate: 'desc' },
      include: {
        pros: { orderBy: { sortOrder: 'asc' } },
        cons: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        adminResponse: true
      }
    });
  },

  checkExistingReview: async (productId: string, email: string) => {
    return await prisma.review.findFirst({
      where: { productId, customerEmail: email }
    });
  },

  getProductReviewStats: async (productId: string) => {
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _count: { id: true },
      _avg: { rating: true }
    });
    
    return {
      total: stats._count.id,
      average: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0
    };
  },

  getAllReviews: async (limit: number = 10) => {
    return await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { reviewDate: 'desc' },
      take: limit,
      include: {
        product: { select: { id: true, name: true, slug: true, images: { take: 1 } } }
      }
    });
  }
};
```

### 2.6. `services/location.service.ts`
Thay thế `PROVINCES_QUERY` và `WARDS_BY_PROVINCE_QUERY`.

```typescript
import { prisma } from "@/db";

export const locationService = {
  getProvinces: async () => {
    return await prisma.province.findMany({
      orderBy: { name: 'asc' }
    });
  },

  getWardsByProvince: async (provinceId: string) => {
    return await prisma.ward.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' }
    });
  }
};
```

### 2.7. `services/coupon.service.ts`
Thay thế các query mã giảm giá.

```typescript
import { prisma } from "@/db";

export const couponService = {
  getCouponByCode: async (code: string) => {
    return await prisma.coupon.findFirst({
      where: { code, isActive: true },
      include: {
        applicableCategories: { include: { category: true } },
        applicableProducts: { include: { product: { select: { id: true, name: true, slug: true } } } },
        excludedProducts: { include: { product: { select: { id: true, name: true, slug: true } } } }
      }
    });
  },

  getActiveCoupons: async () => {
    return await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  getUserCouponUsage: async (couponId: string, userId: string) => {
    return await prisma.order.count({
      where: { 
        appliedCouponId: couponId,
        clerkUserId: userId
      }
    });
  },

  getCouponUsageHistory: async (couponId: string) => {
    return await prisma.order.findMany({
      where: { appliedCouponId: couponId },
      orderBy: { orderDate: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        email: true,
        totalPrice: true,
        amountDiscount: true,
        couponCode: true,
        orderDate: true,
        status: true
      }
    });
  }
};
```

### 2.8. `services/order.service.ts`
Tạo đơn hàng và lấy danh sách đơn hàng.

```typescript
import { prisma } from "@/db";

export const orderService = {
  getMyOrders: async (userId: string) => {
    return await prisma.order.findMany({
      where: { clerkUserId: userId },
      orderBy: { orderDate: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              include: { images: { take: 1 } }
            }
          }
        },
        shippingProvince: true,
        shippingWard: true,
        vnpayResponse: true
      }
    });
  },

  // Logic giao dịch (Transaction) an toàn khi tạo đơn hàng
  createOrder: async (data: any) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Tạo đơn hàng và chi tiết sản phẩm
      const newOrder = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          clerkUserId: data.clerkUserId,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          shippingStreetAddress: data.shippingStreetAddress,
          shippingProvinceId: data.shippingProvinceId,
          shippingWardId: data.shippingWardId,
          totalPrice: data.totalPrice,
          amountDiscount: data.amountDiscount,
          shippingFee: data.shippingFee,
          paymentMethod: data.paymentMethod, 
          status: 'pending',
          orderDate: new Date(),
          appliedCouponId: data.appliedCouponId,
          couponCode: data.couponCode,
          
          orderItems: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        }
      });

      // 2. Tăng số lần sử dụng mã giảm giá (nếu có)
      if (data.appliedCouponId) {
        await tx.coupon.update({
          where: { id: data.appliedCouponId },
          data: { usageCount: { increment: 1 } }
        });
      }

      // 3. Trừ tồn kho sản phẩm (nếu quản lý tồn kho)
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return newOrder;
    });
  }
};
```
