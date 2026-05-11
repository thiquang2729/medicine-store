import { prisma } from "@/db";

export const locationService = {
  getProvinces: async () => {
    return await prisma.province.findMany({
      orderBy: { name: 'asc' }
    });
  },

  getWardsByProvince: async (provinceId: string) => {
    return await prisma.ward.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' }
    });
  }
};
