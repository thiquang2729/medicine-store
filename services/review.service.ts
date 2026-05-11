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
