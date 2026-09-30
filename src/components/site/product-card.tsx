import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  compareAt: number | null;
};

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgb(0,0,0,0.18)]"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">No image</span>
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground shadow-sm">
            -{discount}%
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className={cn("text-base font-semibold", product.compareAt && "text-foreground")}>
            {formatCurrency(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}