"use server"
import { prisma } from "@/db";

export async function getProductReviewSummary(productId: string) {
  try {
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _count: { id: true },
      _avg: { rating: true }
    });

    return {
      total: stats._count.id,
      average: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0
    };
  } catch (error) {
    console.error("Error fetching product review summary:", error);
    return { total: 0, average: 0 };
  }
}
