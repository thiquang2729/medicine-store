import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

export const productService = {
  // Lấy sản phẩm hot/deal
  getDealProducts: async () => {
    const products = await prisma.product.findMany({
      where: { status: 'hot' },
      orderBy: { name: 'asc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: {
          include: { category: true }
        }
      }
    });

    const productIds = products.map(p => p.id);
    const reviewStats = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, isApproved: true },
      _count: { id: true },
      _avg: { rating: true }
    });

    const productsWithReviews = products.map(p => {
      const stats = reviewStats.find(s => s.productId === p.id);
      return {
        ...p,
        reviewSummary: {
          total: stats?._count.id || 0,
          average: stats?._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0
        }
      };
    });

    return serializePrisma(productsWithReviews);
  },

  // Lấy chi tiết sản phẩm bằng slug
  getProductBySlug: async (slug: string) => {
    return serializePrisma(await prisma.product.findUnique({
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
    }));
  },

  // Lấy tất cả Brands
  getBrands: async () => {
    return serializePrisma(await prisma.brand.findMany({
      orderBy: { title: 'asc' }
    }));
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
