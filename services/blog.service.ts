import { prisma } from "@/db";

export const blogService = {
  getLatestBlog: async () => {
    return await prisma.blog.findMany({
      where: { isLatest: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: true,
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getAllBlog: async (quantity: number) => {
    return await prisma.blog.findMany({
      orderBy: { publishedAt: 'desc' },
      take: quantity,
      include: {
        author: true,
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getSingleBlog: async (slug: string) => {
    return await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, imageUrl: true } },
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getOthersBlog: async (slug: string, quantity: number) => {
    return await prisma.blog.findMany({
      where: { slug: { not: slug } },
      orderBy: { publishedAt: 'desc' },
      take: quantity,
      select: {
        id: true,
        title: true,
        slug: true,
        mainImageUrl: true,
        publishedAt: true,
        author: { select: { name: true, imageUrl: true } },
        blogBlogCategories: { include: { blogCategory: true } }
      }
    });
  },

  getBlogCategories: async () => {
    return await prisma.blogCategory.findMany({
      orderBy: { title: 'asc' }
    });
  }
};
