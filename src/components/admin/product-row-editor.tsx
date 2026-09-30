"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type P = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  stock: number;
  active: boolean;
  category: string | null;
};

export function ProductRowEditor({ product }: { product: P }) {
  const router = useRouter();
  const [stock, setStock] = useState(product.stock);
  const [active, setActive] = useState(product.active);
  const [price, setPrice] = useState(String(product.price));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(stock) || 0, active, price: Number(price) || 0 }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "حصلت مشكلة");
      toast.success("تم الحفظ");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/shop/${product.slug}`} className="relative block size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            {product.image && <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />}
          </Link>
          <div className="min-w-0">
            <Link href={`/shop/${product.slug}`} className="block max-w-[220px] truncate text-sm font-medium hover:text-primary">
              {product.name}
            </Link>
            <span className="text-xs text-muted-foreground">{product.category}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-8 w-24 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          dir="ltr"
          aria-label="السعر"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value) || 0)}
          className="h-8 w-20 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          dir="ltr"
          aria-label="الكمية"
        />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => setActive((a) => !a)}
          className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`}
          aria-pressed={active}
          aria-label={active ? "نشط" : "غير نشط"}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "start-0.5" : "start-[22px]"}`} />
        </button>
      </td>
      <td className="px-4 py-3 text-end">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "حفظ…" : "حفظ"}
        </button>
      </td>
    </tr>
  );
}