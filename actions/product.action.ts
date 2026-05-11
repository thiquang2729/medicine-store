"use server"
import { prisma } from "@/db";
import { serializePrisma } from "@/lib/utils";

const INCLUDE_OPTIONS = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  productCategories: { include: { category: true } }
};

export async function getProductsByVariant(variant: string) {
  const where: any = {};
  if (variant !== "tất cả" && variant !== "tat-ca" && variant !== "all") {
    where.variant = variant as any;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: INCLUDE_OPTIONS,
  });

  const productIds = products.map((p) => p.id);
  const reviewStats = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _count: { id: true },
    _avg: { rating: true },
  });

  const productsWithReviews = products.map((p) => {
    const stats = reviewStats.find((s) => s.productId === p.id);
    return {
      ...p,
      reviewSummary: {
        total: stats?._count.id || 0,
        average: stats?._avg.rating
          ? Math.round(stats._avg.rating * 10) / 10
          : 0,
      },
    };
  });

  return serializePrisma(productsWithReviews);
}

export async function getFilteredProducts({
  categoryId,
  brandId,
  minPrice,
  maxPrice,
}: {
  categoryId?: string | null;
  brandId?: string | null;
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: any = {};

  if (categoryId) {
    where.productCategories = {
      some: {
        category: {
          slug: categoryId,
        },
      },
    };
  }

  if (brandId) {
    where.brand = {
      slug: brandId,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      productCategories: { include: { category: true } },
    },
  });

  const productIds = products.map((p) => p.id);
  const reviewStats = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _count: { id: true },
    _avg: { rating: true },
  });

  const productsWithReviews = products.map((p) => {
    const stats = reviewStats.find((s) => s.productId === p.id);
    return {
      ...p,
      reviewSummary: {
        total: stats?._count.id || 0,
        average: stats?._avg.rating
          ? Math.round(stats._avg.rating * 10) / 10
          : 0,
      },
    };
  });

  return serializePrisma(productsWithReviews);
}

