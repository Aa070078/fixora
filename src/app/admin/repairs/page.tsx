import Link from "next/link";
import { Search, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { statusLabels } from "@/lib/site";
import { InlineStatus } from "@/components/admin/inline-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "طلبات الإصلاح" };

const FILTERS = ["", ...Object.keys(statusLabels)] as const;

export default async function AdminRepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "", q = "" } = await searchParams;
  const trimmed = q.trim();
  const where = {
    ...(status
      ? { status: status as "SUBMITTED" | "UNDER_REVIEW" | "ASSIGNED" | "ON_THE_WAY" | "STARTED" | "COMPLETED" | "CANCELLED" }
      : {}),
    ...(trimmed
      ? {
          OR: [
            { refNo: { contains: trimmed, mode: "insensitive" as const } },
            { customerName: { contains: trimmed, mode: "insensitive" as const } },
            { customerPhone: { contains: trimmed } },
            { deviceDescription: { contains: trimmed, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [requests, byStatus] = await Promise.all([
    prisma.repairRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { assignedTechnician: { select: { name: true } } },
    }),
    prisma.repairRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(byStatus.map((g) => [g.status, g._count._all]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">طلبات الإصلاح</h1>
        <p className="mt-1 text-muted-foreground">راجع الطلبات، عدّل حالتها، وحدد فني لكل زيارة.</p>
      </div>

      {/* Filters */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const n = f ? counts[f] ?? 0 : requests.length;
          return (
            <Link
              key={f}
              href={f ? `/admin/repairs?status=${f}` : "/admin/repairs"}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                status === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {f ? statusLabels[f]?.label : "الكل"}
              <span className={cn("rounded-full px-1.5 text-[10px]", status === f ? "bg-primary-foreground/15" : "bg-muted")}>
                {n}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <form action="/admin/repairs" className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث بالرقم المرجعي أو الاسم أو الموبايل…"
          className="h-10 w-full rounded-xl border border-input bg-card pe-3 ps-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <input type="hidden" name="status" value={status} />
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Wrench className="size-5" />
            </span>
            <p className="text-sm text-muted-foreground">مفيش طلبات مطابقة للفلترة دي.</p>
            <Link href="/admin/repairs" className="text-sm font-medium text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="px-5 py-3 text-start font-medium">الطلب</th>
                  <th className="px-4 py-3 text-start font-medium">العميل</th>
                  <th className="px-4 py-3 text-start font-medium">الجهاز</th>
                  <th className="px-4 py-3 text-start font-medium">المدينة</th>
                  <th className="px-4 py-3 text-start font-medium">الفني</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/repairs/${r.id}`} className="font-semibold text-primary hover:underline" dir="ltr">
                        {r.refNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.customerName}</td>
                    <td className="max-w-[180px] truncate px-4 py-3">{r.deviceDescription}</td>
                    <td className="px-4 py-3">{r.city}</td>
                    <td className="px-4 py-3">{r.assignedTechnician?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <InlineStatus id={r.id} status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}