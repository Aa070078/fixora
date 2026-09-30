"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export default function CartPage() {
  const { items, subtotal, deliveryFee, total, updateQty, remove } = useCart();

  return (
    <div className="container-site py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">سلة المشتريات</h1>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" />
            <ShoppingBag className="relative size-7" />
          </span>
          <div>
            <p className="font-medium">السلة فاضية</p>
            <p className="mt-1 text-sm text-muted-foreground">ضيف شاحن جديد أو كابل متين وفكرتاك جاهزة.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/shop">
              ابدأ التسوق
              <ArrowLeft className="flip-rtl" data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-bottom-3 flex gap-4 rounded-2xl border border-border bg-card p-4"
                style={{ animationDelay: `${i * 45}ms`, animationFillMode: "backwards" }}
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <ImageOrFallback src={item.image} alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${item.slug}`} className="line-clamp-2 font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex size-7 items-center justify-center rounded-lg border border-border" aria-label="نقص">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex size-7 items-center justify-center rounded-lg border border-border" aria-label="زيادة">
                      <Plus className="size-3.5" />
                    </button>
                    <button onClick={() => remove(item.id)} className="ms-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                      إزالة
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">ملخص الطلب</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">المجموع الفرعي</dt>
                <dd className="font-medium">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">التوصيل</dt>
                <dd className="font-medium">{deliveryFee === 0 ? <span className="text-success">مجاني</span> : formatCurrency(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-semibold">الإجمالي</dt>
                <dd className="font-semibold">{formatCurrency(total)}</dd>
              </div>
            </dl>
            {deliveryFee > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="size-3.5 text-primary" />
                توصيل مجاني للطلبات فوق {formatCurrency(FREE_DELIVERY_THRESHOLD)} — لسه ناقصك {formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal)}
              </p>
            )}
            <Button asChild size="lg" className="mt-5 h-11 w-full text-base">
              <Link href="/checkout">متابعة الشراء</Link>
            </Button>
            <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              نتواصل معاك لتأكيد الطلب قبل الشحن. الدفع عند الاستلام.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageOrFallback({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <span className="flex h-full items-center justify-center text-muted-foreground">—</span>;
  return <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />;
}