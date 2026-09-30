"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function AddToCart({
  product,
  className,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  className?: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    toast.success(`اتضاف للسلة ×${qty}`);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className={`flex items-stretch gap-2 ${className ?? ""}`}>
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-1.5">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="نقص الكمية">
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-sm font-medium">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="زيادة الكمية">
          <Plus className="size-4" />
        </button>
      </div>
      <Button size="lg" className="h-11 flex-1 text-base" onClick={handleAdd} disabled={added}>
        {added ? (
          <>
            <Check data-icon="inline-start" />
            اتضافت!
          </>
        ) : (
          <>
            <ShoppingBag data-icon="inline-start" />
            أضف للسلة
          </>
        )}
      </Button>
    </div>
  );
}