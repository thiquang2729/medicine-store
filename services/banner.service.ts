import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

export const bannerService = {
  // Lấy các banner thông thường (không phải popup)
  getBanners: async () => {
    return serializePrisma(await prisma.banner.findMany({
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
    }));
  },

  // Lấy popup banner
  getPopupBanner: async () => {
    return serializePrisma(await prisma.banner.findFirst({
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
    }));
  },
};
