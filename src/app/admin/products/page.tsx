import { prisma } from "@/lib/prisma";
import { ProductRowEditor } from "@/components/admin/product-row-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "المنتجات والمخزون" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">المنتجات والمخزون</h1>
        <p className="mt-1 text-muted-foreground">عدّل السعر والكمية وحالة النشاط مباشرة.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">المنتج</th>
                <th className="px-4 py-3 text-start font-medium">السعر (ج.م)</th>
                <th className="px-4 py-3 text-start font-medium">الكمية</th>
                <th className="px-4 py-3 text-start font-medium">نشط</th>
                <th className="px-4 py-3 text-end font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <ProductRowEditor
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    image: p.imageUrls[0] ?? null,
                    price: Number(p.price),
                    stock: p.stock,
                    active: p.active,
                    category: p.category?.name ?? null,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}