"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { count, items, subtotal, deliveryFee, updateQty, remove, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className={cn("relative", className)} aria-label="سلة المشتريات">
          <ShoppingBag className="size-[1.15rem]" />
          {ready && count > 0 && (
            <span className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full max-w-sm flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-start">
            <ShoppingBag className="size-4 text-primary" />
            سلة المشتريات ({count})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ShoppingBag className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">السلة فاضية — ضيف منتجات تحبها.</p>
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link href="/shop">تصفح المتجر</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pe-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl border border-border p-3">
                  <Link href={`/shop/${item.slug}`} onClick={() => setOpen(false)} className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/shop/${item.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-medium hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex size-6 items-center justify-center rounded-lg border border-border" aria-label="نقص">
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex size-6 items-center justify-center rounded-lg border border-border" aria-label="زيادة">
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => remove(item.id)} className="self-start text-muted-foreground hover:text-destructive" aria-label="حذف">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>التوصيل</span>
                {deliveryFee === 0 ? (
                  <span className="font-medium text-success">مجاني</span>
                ) : (
                  <span className="font-medium text-foreground">{formatCurrency(deliveryFee)}</span>
                )}
              </div>
              <Link href="/shop" className="block text-xs text-muted-foreground hover:text-primary">
                توصيل مجاني للطلبات فوق {formatCurrency(500)}
              </Link>
              <Button asChild size="lg" className="mt-1 h-11 w-full" onClick={() => setOpen(false)}>
                <Link href="/checkout">إتمام الطلب · {formatCurrency(subtotal + deliveryFee)}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}