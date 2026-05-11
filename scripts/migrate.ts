import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from 'next-sanity';
import createImageUrlBuilder from '@sanity/image-url';
import { toHTML } from '@portabletext/to-html';
import * as dotenv from 'dotenv';

dotenv.config();

// 1. Khởi tạo Prisma & Sanity Client
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0b4dve83';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-01-01',
  useCdn: false,
});

const builder = createImageUrlBuilder({ projectId, dataset });
const urlFor = (source: any) => source ? builder.image(source).url() : null;

const blocksToHtml = (blocks: any) => {
  if (!blocks || !Array.isArray(blocks)) return null;
  try {
    return toHTML(blocks);
  } catch (e) {
    return null;
  }
};

const idMap = {
  province: new Map<string, string>(),
  ward: new Map<string, string>(),
  category: new Map<string, string>(),
  brand: new Map<string, string>(),
  product: new Map<string, string>(),
  author: new Map<string, string>(),
  blogCategory: new Map<string, string>(),
  blog: new Map<string, string>(),
  coupon: new Map<string, string>(),
  order: new Map<string, string>(),
  review: new Map<string, string>(),
};

const getValidString = (val: any, fallback: string) => (val && val.trim() !== '') ? val : fallback;

async function main() {
  console.log('🚀 Bắt đầu tải dữ liệu từ Sanity...');
  const docs = await sanityClient.fetch('*[!(_id in path("drafts.**"))]');
  console.log(`✅ Đã tải ${docs.length} tài liệu từ Sanity.`);

  const getDocs = (type: string) => docs.filter((d: any) => d._type === type);

  // 1. PROVINCES
  console.log('--- Migrating Provinces ---');
  for (const doc of getDocs('province')) {
    const code = getValidString(doc.code, doc._id);
    const created = await prisma.province.upsert({
      where: { code },
      update: { name: doc.name || 'Unknown' },
      create: { name: doc.name || 'Unknown', code }
    });
    idMap.province.set(doc._id, created.id);
  }

  // 2. WARDS
  console.log('--- Migrating Wards ---');
  for (const doc of getDocs('ward')) {
    const provinceRef = doc.province?._ref;
    if (!provinceRef || !idMap.province.has(provinceRef)) continue;
    
    const code = getValidString(doc.code, doc._id);
    const created = await prisma.ward.upsert({
      where: { code },
      update: { name: doc.name || 'Unknown', provinceId: idMap.province.get(provinceRef)! },
      create: { name: doc.name || 'Unknown', code, provinceId: idMap.province.get(provinceRef)! }
    });
    idMap.ward.set(doc._id, created.id);
  }

  // 3. CATEGORIES
  console.log('--- Migrating Categories ---');
  for (const doc of getDocs('category')) {
    const slug = getValidString(doc.slug?.current, doc._id);
    const created = await prisma.category.upsert({
      where: { slug },
      update: {
        title: doc.title || 'Untitled',
        description: doc.description || null,
        range: doc.range,
        featured: doc.featured || false,
        imageUrl: urlFor(doc.image),
      },
      create: {
        title: doc.title || 'Untitled',
        slug,
        description: doc.description || null,
        range: doc.range,
        featured: doc.featured || false,
        imageUrl: urlFor(doc.image),
      }
    });
    idMap.category.set(doc._id, created.id);
  }

  // 4. BRANDS
  console.log('--- Migrating Brands ---');
  for (const doc of getDocs('brand')) {
    const slug = getValidString(doc.slug?.current, doc._id);
    const created = await prisma.brand.upsert({
      where: { slug },
      update: {
        title: doc.name || doc.title || 'Untitled',
        description: doc.description || null,
        imageUrl: urlFor(doc.image),
      },
      create: {
        title: doc.name || doc.title || 'Untitled',
        slug,
        description: doc.description || null,
        imageUrl: urlFor(doc.image),
      }
    });
    idMap.brand.set(doc._id, created.id);
  }

  // 5. PRODUCTS & DRUG INFOS
  console.log('--- Migrating Products ---');
  for (const doc of getDocs('product')) {
    const brandRef = doc.brand?._ref;
    const brandId = brandRef ? idMap.brand.get(brandRef) : null;
    const slug = getValidString(doc.slug?.current, doc._id);

    const statusMap: Record<string, any> = { 'new': 'new', 'hot': 'hot', 'sale': 'sale' };
    const variantMap: Record<string, any> = {
      'thuốc': 'thuoc', 'thực phẩm chức năng': 'thuc_pham_chuc_nang', 'dược mỹ phẩm': 'duoc_my_pham',
      'chăm sóc cá nhân': 'cham_soc_ca_nhan', 'trang thiết bị y tế': 'trang_thiet_bi_y_te',
      'dinh dưỡng': 'dinh_duong_thuc_pham_chuc_nang', 'sinh lý': 'sinh_ly'
    };
    
    const productData: any = {
      name: doc.name || 'Untitled',
      description: doc.description ? blocksToHtml(doc.description) : null,
      price: doc.price || 0,
      discount: doc.discount || 0,
      stock: doc.stock || 0,
      brandId: brandId || null,
      origin: doc.origin || null,
      status: doc.status ? statusMap[doc.status] : null,
      variant: doc.variant ? variantMap[doc.variant] : null,
      isFeatured: doc.isFeatured || false,
    };

    let createdProduct = await prisma.product.findUnique({ where: { slug } });
    if (!createdProduct) {
      if (doc.images && Array.isArray(doc.images)) {
        productData.images = {
          create: doc.images.map((img: any, idx: number) => ({
            imageUrl: urlFor(img) || '',
            sortOrder: idx
          })).filter((i: any) => i.imageUrl !== '')
        };
      }

      if (doc.categories && Array.isArray(doc.categories)) {
        productData.productCategories = {
          create: doc.categories
            .filter((c: any) => idMap.category.has(c._ref))
            .map((c: any) => ({ categoryId: idMap.category.get(c._ref)! }))
        };
      }
      productData.slug = slug;
      createdProduct = await prisma.product.create({ data: productData });
    } else {
      createdProduct = await prisma.product.update({ where: { slug }, data: productData });
    }
    idMap.product.set(doc._id, createdProduct.id);

    // Drug Info
    if (doc.drugInfo) {
      const existingDrugInfo = await prisma.drugInfo.findUnique({ where: { productId: createdProduct.id } });
      
      const drugInfoData: any = {
        productId: createdProduct.id,
        drugName: doc.drugInfo.drugName || doc.name || 'Unknown',
        compositionSubtitle: doc.drugInfo.compositionSection?.subtitle || null,
        usageSectionTitle: doc.drugInfo.usageSection?.title || null,
        usageInstructionsTitle: doc.drugInfo.usageInstructions?.title || null,
        sideEffectsTitle: doc.drugInfo.sideEffects?.title || null,
        warningsMainNoteTitle: doc.drugInfo.warningsAndPrecautions?.mainNoteTitle || null,
        warningsIntroText: doc.drugInfo.warningsAndPrecautions?.introText
          ? blocksToHtml(doc.drugInfo.warningsAndPrecautions.introText)
          : null,
        storageTitle: doc.drugInfo.storage?.title || null,
      };

      let drugInfoId: string;
      if (!existingDrugInfo) {
        const created = await prisma.drugInfo.create({ data: drugInfoData });
        drugInfoId = created.id;
      } else {
        const updated = await prisma.drugInfo.update({ where: { id: existingDrugInfo.id }, data: drugInfoData });
        drugInfoId = updated.id;
        // Xóa ingredients & sections cũ để upsert lại
        await prisma.drugIngredient.deleteMany({ where: { drugInfoId } });
        await prisma.drugInfoSection.deleteMany({ where: { drugInfoId } });
      }

      // Migrate ingredients
      const ingredients = doc.drugInfo.compositionSection?.ingredientsTable || doc.drugInfo.ingredients || [];
      if (ingredients.length > 0) {
        await prisma.drugIngredient.createMany({
          data: ingredients.map((ing: any, idx: number) => ({
            drugInfoId,
            ingredientName: ing.ingredientName || ing.name || 'Unknown',
            amount: ing.amount || ing.quantity || null,
            sortOrder: idx,
          }))
        });
      }

      // Migrate sections - map từng field của drugInfo Sanity sang sectionType
      const sectionMappings: { sectionType: string; data: any; subtitleField: string }[] = [
        { sectionType: 'indications', data: doc.drugInfo.usageSection?.indications, subtitleField: 'subtitle' },
        { sectionType: 'pharmacodynamics', data: doc.drugInfo.usageSection?.pharmacodynamics, subtitleField: 'subtitle' },
        { sectionType: 'pharmacokinetics', data: doc.drugInfo.usageSection?.pharmacokinetics, subtitleField: 'subtitle' },
        { sectionType: 'how_to_use', data: doc.drugInfo.usageInstructions?.howToUse, subtitleField: 'subtitle' },
        { sectionType: 'dosage', data: doc.drugInfo.usageInstructions?.dosage, subtitleField: 'subtitle' },
        { sectionType: 'overdose', data: doc.drugInfo.overdoseAndMissedDose?.overdose, subtitleField: 'subtitle' },
        { sectionType: 'missed_dose', data: doc.drugInfo.overdoseAndMissedDose?.missedDose, subtitleField: 'subtitle' },
        { sectionType: 'side_effects', data: doc.drugInfo.sideEffects, subtitleField: 'subtitle' },
        { sectionType: 'contraindications', data: doc.drugInfo.warningsAndPrecautions?.contraindications, subtitleField: 'subtitle' },
        { sectionType: 'precautions', data: doc.drugInfo.warningsAndPrecautions?.precautions, subtitleField: 'subtitle' },
        { sectionType: 'driving_and_machinery', data: doc.drugInfo.warningsAndPrecautions?.drivingAndOperatingMachinery, subtitleField: 'subtitle' },
        { sectionType: 'pregnancy', data: doc.drugInfo.warningsAndPrecautions?.pregnancy, subtitleField: 'subtitle' },
        { sectionType: 'breastfeeding', data: doc.drugInfo.warningsAndPrecautions?.breastfeeding, subtitleField: 'subtitle' },
        { sectionType: 'drug_interactions', data: doc.drugInfo.warningsAndPrecautions?.drugInteractions, subtitleField: 'subtitle' },
        { sectionType: 'storage', data: doc.drugInfo.storage, subtitleField: 'subtitle' },
      ];

      for (const mapping of sectionMappings) {
        if (!mapping.data) continue;
        const content = mapping.data.content ? blocksToHtml(mapping.data.content) : null;
        const subtitle = mapping.data[mapping.subtitleField] || null;
        if (!content && !subtitle) continue;
        await prisma.drugInfoSection.create({
          data: {
            drugInfoId,
            sectionType: mapping.sectionType as any,
            subtitle,
            content,
          }
        });
      }
    }
  }

  // Update variant cho products dựa theo category slug
  console.log('--- Updating Product Variants ---');
  const categorySlugToVariant: Record<string, string> = {
    'thuoc': 'thuoc',
    'thuc-pham-chuc-nang': 'thuc_pham_chuc_nang',
    'duoc-mi-pham': 'duoc_my_pham',
    'duoc-my-pham': 'duoc_my_pham',
    'cham-soc-ca-nhan': 'cham_soc_ca_nhan',
    'trang-thiet-bi-y-te': 'trang_thiet_bi_y_te',
    'dinh-duong': 'dinh_duong_thuc_pham_chuc_nang',
    'dinh-duong-thuc-pham-chuc-nang': 'dinh_duong_thuc_pham_chuc_nang',
    'sinh-li': 'sinh_ly',
    'sinh-ly': 'sinh_ly',
  };
  const allProducts = await prisma.product.findMany({
    where: { variant: null },
    include: { productCategories: { include: { category: true }, take: 1 } }
  });
  for (const p of allProducts) {
    const slug = p.productCategories[0]?.category?.slug;
    const variant = slug ? categorySlugToVariant[slug] : null;
    if (variant) {
      await prisma.product.update({ where: { id: p.id }, data: { variant: variant as any } });
    }
  }
  console.log(`✅ Đã update variant cho ${allProducts.length} sản phẩm.`);


  // 6. AUTHORS
  console.log('--- Migrating Authors ---');
  for (const doc of getDocs('author')) {
    const slug = getValidString(doc.slug?.current, doc._id);
    const created = await prisma.author.upsert({
      where: { slug },
      update: {
        name: doc.name || 'Anonymous',
        imageUrl: urlFor(doc.image),
        bio: doc.bio ? blocksToHtml(doc.bio) : null,
      },
      create: {
        name: doc.name || 'Anonymous',
        slug,
        imageUrl: urlFor(doc.image),
        bio: doc.bio ? blocksToHtml(doc.bio) : null,
      }
    });
    idMap.author.set(doc._id, created.id);
  }

  // 7. BLOG CATEGORIES
  console.log('--- Migrating Blog Categories ---');
  for (const doc of getDocs('blogcategory')) {
    const slug = getValidString(doc.slug?.current, doc._id);
    const created = await prisma.blogCategory.upsert({
      where: { slug },
      update: {
        title: doc.title || 'Untitled',
        description: doc.description || null,
      },
      create: {
        title: doc.title || 'Untitled',
        slug,
        description: doc.description || null,
      }
    });
    idMap.blogCategory.set(doc._id, created.id);
  }

  // 8. BLOGS
  console.log('--- Migrating Blogs ---');
  for (const doc of getDocs('blog')) {
    const authorRef = doc.author?._ref;
    const slug = getValidString(doc.slug?.current, doc._id);
    
    const blogData: any = {
      title: doc.title || 'Untitled',
      mainImageUrl: urlFor(doc.mainImage),
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : new Date(),
      isLatest: doc.isLatest || true,
      body: doc.body ? blocksToHtml(doc.body) : null,
      authorId: authorRef && idMap.author.has(authorRef) ? idMap.author.get(authorRef) : null,
    };

    let created = await prisma.blog.findUnique({ where: { slug } });
    if (!created) {
      if (doc.blogcategories && Array.isArray(doc.blogcategories)) {
        blogData.blogBlogCategories = {
          create: doc.blogcategories
            .filter((c: any) => idMap.blogCategory.has(c._ref))
            .map((c: any) => ({ blogCategoryId: idMap.blogCategory.get(c._ref)! }))
        };
      }
      blogData.slug = slug;
      created = await prisma.blog.create({ data: blogData });
    } else {
      created = await prisma.blog.update({ where: { slug }, data: blogData });
    }
    idMap.blog.set(doc._id, created.id);
  }

  // 9. BANNERS
  console.log('--- Migrating Banners ---');
  for (const doc of getDocs('banner')) {
    await prisma.banner.create({
      data: {
        title: doc.title || 'Banner',
        imageUrl: urlFor(doc.image),
        alt: doc.image?.alt || doc.title || 'Banner',
        description: doc.description ? blocksToHtml(doc.description) : null,
        isActive: doc.isActive !== false,
        isPopup: doc.isPopup || false,
        popupFrequency: doc.popupFrequency || 'daily',
      }
    });
  }

  console.log('🎉 Migration Hoàn Tất 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi migrate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
