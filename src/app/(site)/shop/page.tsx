import { Search } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import { RevealGroup } from "@/components/site/motion";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "المتجر" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat = "", q = "" } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(cat
          ? { category: { slug: cat } }
          : {}),
        ...(q.trim()
          ? {
              OR: [
                { name: { contains: q.trim(), mode: "insensitive" } },
                { description: { contains: q.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  const list: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.imageUrls[0] ?? null,
    price: Number(p.price),
    compareAt: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }));

  return (
    <div className="container-site py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">المتجر</h1>
          <p className="mt-2 text-muted-foreground">
            اكسسوارات وقطع غيار أصلية — توصيل سريع لكل مكان.
          </p>
        </div>
        <form action="/shop" className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث في المتجر…"
            className="h-11 w-full rounded-xl border border-input bg-card pe-3 ps-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {cat && <input type="hidden" name="cat" value={cat} />}
        </form>
      </div>

      {/* Categories */}
      <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto pb-1">
        <Link
          href="/shop"
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
            !cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          الكل ({products.length})
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={cat === c.slug ? "/shop" : `/shop?cat=${c.slug}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
              cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {c.name} ({c._count.products})
          </Link>
        ))}
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">مفيش منتجات مطابقة — جرب كلمة تانية.</p>
        </div>
      ) : (
        <RevealGroup className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <div key={p.id} data-reveal className="tilt-card">
              <ProductCard product={p} />
            </div>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}