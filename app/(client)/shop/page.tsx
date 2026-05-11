import Shop from "@/components/Shop";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { serializePrisma } from "@/lib/utils";
import React from "react";

const ShopPage = async () => {
  const categoriesData = await categoryService.getCategoriesWithProductCount();
  const brandsData = await productService.getBrands();

  // Serialize dữ liệu để tránh lỗi truyền đối tượng không hợp lệ (Date, Decimal) sang Client Component
  const categories = serializePrisma(categoriesData);
  const brands = serializePrisma(brandsData);

  // Ánh xạ dữ liệu về format tương thích nếu cần
  const mappedCategories = categories.map((cat: any) => ({
    ...cat,
    _id: cat.id,
    slug: { current: cat.slug }
  }));

  const mappedBrands = brands.map((brand: any) => ({
    ...brand,
    _id: brand.id,
    slug: { current: brand.slug }
  }));

  return (
    <div className="bg-[#edf0f3]">
      <Shop categories={mappedCategories as any} brands={mappedBrands as any} />
    </div>
  );
};


export default ShopPage;
