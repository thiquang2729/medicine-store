import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

export const categoryService = {
  // Lấy danh mục kèm số lượng sản phẩm
  getCategoriesWithProductCount: async () => {
    const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { productCategories: true }
        }
      }
    });
    
    return serializePrisma(categories.map(cat => ({
      ...cat,
      productCount: cat._count.productCategories
    })));
  }
};

