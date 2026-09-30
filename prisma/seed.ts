import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { IMG } from "../src/lib/images";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const hash = bcrypt.hashSync("Fixora@123", 10);

const brands: Record<string, string[]> = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14",
    "iPhone 13",
    "iPhone SE",
  ],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy A54", "Galaxy A34"],
  Google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 7a"],
  Xiaomi: ["Xiaomi 14", "Redmi Note 13 Pro", "Redmi 13"],
  Huawei: ["P60 Pro", "Mate 60"],
  OnePlus: ["OnePlus 12", "OnePlus 11"],
  Realme: ["Realme 12 Pro+"],
  Tecno: ["Camon 30", "Spark 20"],
  Infinix: ["Note 40", "Hot 40"],
};

const categories: { name: string; slug: string; description: string; position: number }[] = [
  { name: "الحمايات والأغطية", slug: "cases", description: "أغطية وحمايات تحافظ على موبايلك.", position: 1 },
  { name: "حمايات الشاشة", slug: "screen-protectors", description: "زجاج مقوّى وأفلام تحمي شاشتك.", position: 2 },
  { name: "شواحن وكابلات", slug: "chargers-cables", description: "شواحن سريعة وكابلات مضفرة.", position: 3 },
  { name: "الطاقة المحمولة", slug: "power-banks", description: "طاقة في جيبك أينما كنت.", position: 4 },
  { name: "الصوتيات", slug: "audio", description: "سماعات وإكسسوارات صوتية.", position: 5 },
  { name: "إكسسوارات", slug: "accessories", description: "حوامل وكل ما تحتاجه يوميًا.", position: 6 },
];

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAt?: number;
  stock: number;
  featured?: boolean;
  image: string;
  description?: string;
};

const products: SeedProduct[] = [
  {
    name: "حافظة ShockGuard المضادة للصدمات — آيفون 15 برو",
    slug: "shockguard-tpu-case-iphone-15-pro",
    category: "الحمايات والأغطية",
    price: 449,
    compareAt: 599,
    stock: 24,
    featured: true,
    image: IMG.tpuCase,
    description: "حماية بمستوى عسكري مع لمسة نهائية مطاطية. حواف بارزة تحمي الشاشة والكاميرا.",
  },
  {
    name: "زجاج حماية ClearSight المقوّى — جالاكسي S24",
    slug: "clearsight-tempered-glass-galaxy-s24",
    category: "حمايات الشاشة",
    price: 299,
    stock: 40,
    featured: true,
    image: IMG.screenProtector,
    description: "صلابة 9H وسمك 0.33 مم مع طلاء مقاوم للبصمات.",
  },
  {
    name: "شاحن 20 وات USB-C سريع",
    slug: "20w-usb-c-fast-charger",
    category: "شواحن وكابلات",
    price: 549,
    stock: 60,
    featured: true,
    image: IMG.wallCharger,
    description: "شاحن PD مضغوط بقوة 20 وات — يشحن آيفون إلى 50% خلال 30 دقيقة تقريبًا.",
  },
  {
    name: "كابل USB-C مضفر 2 متر",
    slug: "2m-braided-usb-c-cable",
    category: "شواحن وكابلات",
    price: 349,
    stock: 80,
    image: IMG.typeCCable,
    description: "كابل مضفر يتحمل 30,000 انحناءة. يدعم 60 وات ونقل البيانات.",
  },
  {
    name: "شاحن سيارة مزدوج 45 وات",
    slug: "dual-45w-car-charger",
    category: "شواحن وكابلات",
    price: 599,
    stock: 30,
    image: IMG.carCharger,
    description: "منفذان USB-C بقدرة 45 وات — اشحن موبايلك وتابلت وأنت في الطريق.",
  },
  {
    name: "باور بانك PowerCore 10000mAh",
    slug: "powercore-10000mah-power-bank",
    category: "الطاقة المحمولة",
    price: 899,
    compareAt: 1199,
    stock: 18,
    featured: true,
    image: IMG.powerBank,
    description: "باور بانك نحيف سعة 10000mAh بشحن سريع 18 وات ومنفذين.",
  },
  {
    name: "شاحن MagSafe اللاسلكي 15 وات",
    slug: "magsafe-15w-wireless-charger",
    category: "الطاقة المحمولة",
    price: 749,
    stock: 22,
    image: IMG.wirelessCharger,
    description: "شاحن مغناطيسي بقوة 15 وات لأجهزة آيفون وأجهزة Qi.",
  },
  {
    name: "سماعات Drift اللاسلكية برو",
    slug: "drift-wireless-earbuds-pro",
    category: "الصوتيات",
    price: 1299,
    compareAt: 1599,
    stock: 15,
    featured: true,
    image: IMG.earbuds,
    description: "عزل ضوضاء نشط، بطارية 32 ساعة، وعلبة شحن لاسلكية.",
  },
  {
    name: "غطاء سيليكون لسماعات الأذن",
    slug: "earbuds-silicone-case",
    category: "الصوتيات",
    price: 199,
    stock: 45,
    image: IMG.earbudsCase,
    description: "غطاء مرن مضاد للصدمات مع كارابين للأمان.",
  },
  {
    name: "حامل موبايل ألومنيوم بتصميم مرن",
    slug: "flexible-aluminum-phone-stand",
    category: "إكسسوارات",
    price: 399,
    stock: 35,
    image: IMG.phoneStand,
    description: "حامل ألومنيوم قابل للتعديل — يناسب الموبايل والتابلت.",
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  await prisma.user.upsert({
    where: { email: "admin@fixora.com" },
    update: {},
    create: { email: "admin@fixora.com", passwordHash: hash, name: "Fixora Admin", role: "ADMIN" },
  });
  for (const [name, phone] of [
    ["Omar Techni", "01000000001"],
    ["Lina Techni", "01000000002"],
  ] as const) {
    await prisma.user.upsert({
      where: { email: `${name.split(" ")[0].toLowerCase()}@fixora.com` },
      update: {},
      create: { email: `${name.split(" ")[0].toLowerCase()}@fixora.com`, passwordHash: hash, name, phone, role: "TECHNICIAN" },
    });
  }

  for (const [brand, models] of Object.entries(brands)) {
    const b = await prisma.deviceBrand.upsert({
      where: { slug: brand.toLowerCase() },
      update: {},
      create: { name: brand, slug: brand.toLowerCase() },
    });
    for (const model of models) {
      const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.deviceModel.upsert({
        where: { brandId_slug: { brandId: b.id, slug } },
        update: {},
        create: { brandId: b.id, name: model, slug },
      });
    }
  }

  const catIds = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: { position: c.position },
      create: c,
    });
    catIds.set(c.slug, row.id);
  }

  const catByName = new Map(categories.map((c) => [c.name, catIds.get(c.slug)!]));

  for (const p of products) {
    const catId = catByName.get(p.category)!;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        categoryId: catId,
        description: p.description ?? "",
        price: p.price,
        compareAtPrice: p.compareAt,
        stock: p.stock,
        featured: p.featured ?? false,
        active: true,
        imageUrls: [p.image],
      },
    });
  }

  console.log("Seed complete ✦ users, brands, models, categories, products ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());