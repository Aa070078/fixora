import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/site";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

export const metadata = { title: "طلبات المتجر" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">طلبات المتجر</h1>
        <p className="mt-1 text-muted-foreground">تابع طلبات الإكسسوارات وحدّث حالتها.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-3 text-start font-medium">رقم الطلب</th>
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">المنتجات</th>
                <th className="px-4 py-3 text-start font-medium">الإجمالي</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    مفيش طلبات لسه.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3 font-semibold" dir="ltr">
                    {o.refNo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {o.customerPhone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[220px] truncate">
                      {o.items.map((i) => `${i.productName} ×${i.quantity}`).join("، ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}