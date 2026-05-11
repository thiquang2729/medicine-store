import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendOrderConfirmationEmail, OrderData } from "@/lib/email-service";
import { orderService } from "@/services/order.service";
import { prisma } from "@/db";

export async function POST(req: Request) {
  try {
    const { 
      cart, 
      totalPrice, 
      originalPrice,
      discountAmount,
      shippingDiscount,
      appliedCoupon,
      customerInfo, 
      shippingAddress, 
      orderNotes 
    } = await req.json();

    // Debug dữ liệu nhận được
    console.log("Received data in COD API:");
    console.log("CustomerInfo:", customerInfo);
    console.log("Email specifically:", customerInfo?.email);
    console.log("Coupon info:", appliedCoupon);
    console.log("Discount amount:", discountAmount);

    if (!cart || !totalPrice || !customerInfo || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const orderNumber = uuidv4();

    // Tính thời gian giao hàng dự kiến (3-5 ngày làm việc)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4); // 4 ngày sau

    const order = await orderService.createOrder({
      orderNumber,
      clerkUserId: customerInfo.clerkUserId,
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      shippingStreetAddress: shippingAddress.street,
      shippingProvinceId: shippingAddress.provinceId,
      shippingWardId: shippingAddress.wardId,
      totalPrice,
      amountDiscount: discountAmount || 0,
      shippingFee: shippingDiscount ? 0 : 30000,
      paymentMethod: "cod",
      appliedCouponId: appliedCoupon?._id || null,
      couponCode: appliedCoupon?.code || null,
      items: cart.map((item: any) => ({
        productId: item._id,
        quantity: item.quantity,
      }))
    });

    // Gửi email xác nhận đơn hàng
    try {
      // Lấy thông tin chi tiết sản phẩm từ cart bằng Prisma
      const productDetails = await Promise.all(
        cart.map(async (item: any) => {
          const product = await prisma.product.findUnique({
            where: { id: item._id },
            select: { name: true, price: true, discount: true }
          });
          return {
            name: product?.name || "Sản phẩm",
            quantity: item.quantity,
            price: product?.price || 0,
            discount: product?.discount || 0,
          };
        })
      );

      // Lấy thông tin địa chỉ chi tiết bằng Prisma
      const province = await prisma.province.findUnique({
        where: { id: shippingAddress.provinceId }
      });
      const ward = await prisma.ward.findUnique({
        where: { id: shippingAddress.wardId }
      });

      const addressDetails = {
        province: province || { name: "Không xác định" },
        ward: ward || { name: "Không xác định" }
      };

      // Chuẩn bị dữ liệu email
      const emailData: OrderData = {
        orderNumber: orderNumber,
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        products: productDetails,
        totalPrice: totalPrice,
        originalPrice: originalPrice || totalPrice,
        discountAmount: discountAmount || 0,
        shippingDiscount: shippingDiscount || 0,
        paymentMethod: "cod",
        shippingAddress: {
          street: shippingAddress.street,
          ward: addressDetails.ward?.name || "Không xác định",
          province: addressDetails.province?.name || "Không xác định",
        },
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      };

      // Gửi email xác nhận
      const emailResult = await sendOrderConfirmationEmail(emailData);
      
      if (emailResult.success) {
        console.log("Email xác nhận đã được gửi thành công");
      } else {
        console.error("Lỗi gửi email xác nhận:", emailResult.message);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

    } catch (emailError) {
      console.error("Lỗi trong quá trình gửi email:", emailError);
      // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating COD order:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
