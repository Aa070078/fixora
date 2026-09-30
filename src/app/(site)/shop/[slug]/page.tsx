import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/site";
import { AddToCart } from "@/components/site/add-to-cart";
import { ProductCard } from "@/components/site/product-card";
import { Reveal, RevealGroup } from "@/components/site/motion";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "المنتج" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { category: true },
  });

  const discount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
      : 0;
  const inStock = product.stock > 0;

  return (
    <div className="container-site py-10 sm:py-14">
      <nav className="text-sm text-muted-foreground" aria-label="مسار">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/shop" className="hover:text-foreground">المتجر</Link></li>
          {product.category && (
            <>
              <li>/</li>
              <li><Link href={`/shop?cat=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link></li>
            </>
          )}
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <Reveal className="relative">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted">
            {product.imageUrls[0] && (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            {discount > 0 && (
              <span className="absolute start-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
                خصم {discount}%
              </span>
            )}
          </div>
        </Reveal>

        {/* Info */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {product.category?.name ?? "منتج"}
          </p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {inStock ? (
              <>
                <span className="size-2 rounded-full bg-success" />
                <span className="text-success">متوفر ({product.stock} قطعة)</span>
              </>
            ) : (
              <span className="text-destructive">نفذت الكمية حاليًا</span>
            )}
          </div>

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              image: product.imageUrls[0] ?? null,
            }}
            className="mt-6 max-w-md"
          />

          <div className="mt-6 grid gap-2.5 sm:grid-cols-4" aria-label="مزايا">
            <PromiseB icon={Truck} label="توصيل سريع" />
            <PromiseB icon={ShieldCheck} label="ضمان 90 يوم" />
            <PromiseB icon={RotateCcw} label="استرجاع سهل" />
            <PromiseB icon={PackageCheck} label="تغليف آمن" />
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">عن المنتج</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">منتجات مشابهة</h2>
          <RevealGroup className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <div key={p.id} data-reveal className="tilt-card">
                <ProductCard
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    image: p.imageUrls[0] ?? null,
                    price: Number(p.price),
                    compareAt: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                  }}
                />
              </div>
            ))}
          </RevealGroup>
        </section>
      )}
    </div>
  );
}

function PromiseB({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center">
      <Icon className="size-5 text-primary" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}