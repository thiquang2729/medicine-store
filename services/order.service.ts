import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

export const orderService = {
  getMyOrders: async (userId: string) => {
    return serializePrisma(await prisma.order.findMany({
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
    }));
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

      return serializePrisma(newOrder);
    });
  }
};
