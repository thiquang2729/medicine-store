import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

export const couponService = {
  getCouponByCode: async (code: string) => {
    return serializePrisma(await prisma.coupon.findFirst({
      where: { code, isActive: true },
      include: {
        applicableCategories: { include: { category: true } },
        applicableProducts: { include: { product: { select: { id: true, name: true, slug: true } } } },
        excludedProducts: { include: { product: { select: { id: true, name: true, slug: true } } } }
      }
    }));
  },

  getActiveCoupons: async () => {
    return serializePrisma(await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }));
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
    return serializePrisma(await prisma.order.findMany({
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
    }));
  }
};
