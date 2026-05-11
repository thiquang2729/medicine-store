import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotionPopup from "@/components/PromotionPopup";
import { ClerkProvider } from "@clerk/nextjs";
import { bannerService } from "@/services/banner.service";

export const metadata: Metadata = {
  title: {
    template: "%s - Nhà thuốc Khủng Long Châu",
    default: "Nhà thuốc Khủng Long Châu",
  },
  description: "Nhà thuốc Khủng Long Châu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch popup banner data từ server
  const popupBannerData = await bannerService.getPopupBanner();
  
  // Ánh xạ dữ liệu Prisma sang format tương thích với PromotionPopup component
  const popupBanner = popupBannerData ? {
    ...popupBannerData,
    _id: popupBannerData.id,
  } : null;

  return (
    <ClerkProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-shop_light_pink">{children}</main>
        <Footer />
        {/* Popup khuyến mãi */}
        <PromotionPopup banner={popupBanner as any} />
      </div>
    </ClerkProvider>
  );
}
