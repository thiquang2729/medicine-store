"use client";

import React, { useEffect, useState } from "react";
import ProductCardWrapper from "./ProductCardWrapper";
import { motion, AnimatePresence } from "motion/react";
import { getProductsByVariant } from "@/actions/product.action";
import NoProductAvailable from "./NoProductAvailable";
import { Loader2 } from "lucide-react";
import Container from "./Container";
import HomeTabbar from "./HomeTabbar";
import { productType } from "@/constants/data";
import { useRouter } from "next/navigation";

// Map tab title sang Prisma enum ProductVariant
const tabToVariantMap: Record<string, string> = {
  "Thuốc": "thuoc",
  "Thực phẩm chức năng": "thuc_pham_chuc_nang",
  "Dược mỹ phẩm": "duoc_my_pham",
  "Chăm sóc cá nhân": "cham_soc_ca_nhan",
  "Trang thiết bị y tế": "trang_thiet_bi_y_te",
  "Dinh dưỡng": "dinh_duong_thuc_pham_chuc_nang",
  "Sinh lý": "sinh_ly",
  "Tất cả": "all",
};

const ProductGrid = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Thuốc");

  const variant = tabToVariantMap[selectedTab] || selectedTab.toLowerCase();


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          const response: any = await getProductsByVariant(variant);
          const mappedProducts = response.map((p: any) => ({
            _id: p.id,
            name: p.name,
            slug: { current: p.slug },
            price: p.price,
            discount: p.discount,
            images: p.images.map((img: any) => img.imageUrl),
            categories: p.productCategories.map((pc: any) => pc.category.title),
            status: p.status,
            variant: p.variant,
            isFeatured: p.isFeatured,
            stock: p.stock
          }));
          setProducts(mappedProducts);
      } catch (error) {
        console.log("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);

  useEffect(() => {
    if(selectedTab === "Tất cả"){
      router.push("/shop");
    }
  }, [selectedTab, router]);

  return (
    <>
    <Container className="lg:px-0 my-10 px-0">
      <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full mt-10">
          <motion.div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Product is loading...</span>
          </motion.div>
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
          <>
            {products?.map((product) => (
              <AnimatePresence key={product?._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductCardWrapper key={product?._id} product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </>
        </div>
      ) : (
        <NoProductAvailable selectedTab={selectedTab} />
      )}
    </Container>
    </>
  );
};

export default ProductGrid;
