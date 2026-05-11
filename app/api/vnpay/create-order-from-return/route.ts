// Khối 1: Import các thư viện cần thiết
import { NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { prisma } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { sendOrderConfirmationEmail, OrderData } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    // Sửa lại để nhận đúng structure từ frontend
    const { vnpayParams, pendingOrderData } = await req.json();

    if (!vnpayParams) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing VNPay parameters" 
      }, { status: 400 });
    }

    if (!pendingOrderData) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing pending order data" 
      }, { status: 400 });
    }

    // Debug dữ liệu nhận được từ localStorage
    console.log("VNPay - Pending order data from localStorage:");
    console.log("CustomerInfo:", pendingOrderData.customerInfo);
    console.log("Email specifically:", pendingOrderData.customerInfo?.email);
    console.log("Coupon info:", pendingOrderData.appliedCoupon);
    console.log("Discount amount:", pendingOrderData.discountAmount);

    // Tạo orderNumber mới
    const orderNumber = uuidv4();

    // Tính thời gian giao hàng dự kiến (2-3 ngày làm việc cho thanh toán online)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3); // 3 ngày sau

    // Debug dữ liệu sẽ lưu vào Sanity
    console.log("VNPay - Order data to be saved:");
    console.log("Email to save:", pendingOrderData.customerInfo?.email);

    const order = await orderService.createOrder({
      orderNumber,
      clerkUserId: pendingOrderData.customerInfo?.clerkUserId,
      customerName: pendingOrderData.customerInfo?.name,
      email: pendingOrderData.customerInfo?.email,
      phone: pendingOrderData.customerInfo?.phone,
      shippingStreetAddress: pendingOrderData.shippingAddress?.street,
      shippingProvinceId: pendingOrderData.shippingAddress?.provinceId,
      shippingWardId: pendingOrderData.shippingAddress?.wardId,
      totalPrice: pendingOrderData.totalPrice,
      amountDiscount: pendingOrderData.discountAmount || 0,
      shippingFee: pendingOrderData.shippingDiscount ? 0 : 30000,
      paymentMethod: "vnpay",
      appliedCouponId: pendingOrderData.appliedCoupon?._id || null,
      couponCode: pendingOrderData.appliedCoupon?.code || null,
      items: pendingOrderData.cart?.map((item: any) => ({
        productId: item._id,
        quantity: item.quantity,
      }))
    });

    // Update VNPAY info to the created order (need to add update logic or just update directly if needed)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        isPaid: true,
        status: 'processing'
      }
    });

    // Cập nhật VNPAY response
    await prisma.vnpayResponse.create({
      data: {
        orderId: order.id,
        vnpTransactionNo: vnpayParams.vnp_TransactionNo,
        vnpAmount: String(pendingOrderData.totalPrice),
        vnpBankCode: vnpayParams.vnp_BankCode || "",
        vnpPayDate: vnpayParams.vnp_PayDate,
        vnpResponseCode: vnpayParams.vnp_ResponseCode,
        vnpTxnRef: vnpayParams.vnp_TxnRef
      }
    });

    // Gửi email xác nhận đơn hàng
    try {
      // Lấy thông tin chi tiết sản phẩm từ cart
      const productDetails = await Promise.all(
        pendingOrderData.cart.map(async (item: any) => {
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
        where: { id: pendingOrderData.shippingAddress.provinceId }
      });
      const ward = await prisma.ward.findUnique({
        where: { id: pendingOrderData.shippingAddress.wardId }
      });

      const addressDetails = {
        province: province || { name: "Không xác định" },
        ward: ward || { name: "Không xác định" }
      };

      // Chuẩn bị dữ liệu email
      const emailData: OrderData = {
        orderNumber: orderNumber,
        customerInfo: {
          name: pendingOrderData.customerInfo.name,
          email: pendingOrderData.customerInfo.email,
          phone: pendingOrderData.customerInfo.phone,
        },
        products: productDetails,
        totalPrice: pendingOrderData.totalPrice,
        originalPrice: pendingOrderData.originalPrice || pendingOrderData.totalPrice,
        discountAmount: pendingOrderData.discountAmount || 0,
        shippingDiscount: pendingOrderData.shippingDiscount || 0,
        paymentMethod: "vnpay",
        shippingAddress: {
          street: pendingOrderData.shippingAddress.street,
          ward: addressDetails.ward?.name || "Không xác định",
          province: addressDetails.province?.name || "Không xác định",
        },
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      };

      // Gửi email xác nhận
      const emailResult = await sendOrderConfirmationEmail(emailData);
      
      if (emailResult.success) {
        console.log("Email xác nhận VNPay đã được gửi thành công");
      } else {
        console.error("Lỗi gửi email xác nhận VNPay:", emailResult.message);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

    } catch (emailError) {
      console.error("Lỗi trong quá trình gửi email VNPay:", emailError);
      // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
    }

    // Trả về JSON response đúng format
    return NextResponse.json({ 
      success: true, 
      message: "Order created successfully",
      order: order 
    });
  } catch (error) {
    console.error("Error creating VNPay order:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
} 