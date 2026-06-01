import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Định nghĩa các routes cần bảo vệ
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Email admin được phép truy cập
const ADMIN_EMAIL = "thiquang2729@gmail.com";

export default clerkMiddleware(async (auth, req) => {
  const startTime = performance.now();
  let response: NextResponse | undefined;

  // Kiểm tra nếu là admin route
  if (isAdminRoute(req)) {
    const { userId } = await auth();

    // Nếu chưa đăng nhập, chuyển hướng về trang chủ
    if (!userId) {
      response = NextResponse.redirect(new URL("/", req.url));
    } else {
      // Lấy thông tin user từ Clerk
      try {
        const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userEmail = userData.email_addresses?.[0]?.email_address ||
            userData.primary_email_address?.email_address;

          // Kiểm tra nếu không phải email admin được phép
          if (userEmail !== ADMIN_EMAIL) {
            response = NextResponse.redirect(new URL("/", req.url));
          }
        } else {
          // Nếu không thể lấy thông tin user, chặn truy cập
          response = NextResponse.redirect(new URL("/", req.url));
        }
      } catch (error) {
        console.error("Lỗi kiểm tra quyền admin:", error);
        response = NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  const finalResponse = response || NextResponse.next();
  const duration = performance.now() - startTime;
  const url = req.nextUrl.pathname;

  // Tránh log chính api perf-log và các file tĩnh (_next, hình ảnh...) để tiết kiệm bộ nhớ
  if (!url.startsWith("/api/perf-log") && !url.includes("_next") && !url.includes(".")) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // Gửi bất đồng bộ ngầm (fire-and-forget, không await để không chặn request chính)
    fetch(new URL("/api/perf-log", req.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        method: req.method,
        duration,
        ip,
        status: finalResponse.status,
      }),
    }).catch(() => {});
  }

  return finalResponse;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
