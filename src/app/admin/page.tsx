import Link from "next/link";
import { ArrowLeft, ClipboardList, Mail, MessageSquareText, Package, UserRoundCog, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { statusLabels } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildDaily(stamps: Date[]) {
  const slots: { label: string; count: number }[] = [];
  const fmt = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric" });
  const today = startOfDay(new Date());
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    slots.push({ label: fmt.format(d), count: 0 });
  }
  for (const s of stamps) {
    const day = startOfDay(s).getTime();
    const slot = slots.find((_, j) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - j));
      return d.getTime() === day;
    });
    if (slot) slot.count += 1;
  }
  return slots;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { hour: "numeric", minute: "2-digit" }).format(d);
}

const CARD_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "ON_THE_WAY", "STARTED", "COMPLETED", "CANCELLED"] as const;

export default async function AdminDashboardPage() {
  const [groups, total, technicians, lowStock, last14, notifications] = await Promise.all([
    prisma.repairRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.repairRequest.count(),
    prisma.user.count({ where: { role: "TECHNICIAN", active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
    prisma.repairRequest.findMany({
      where: { createdAt: { gte: startOfDay(new Date(new Date().setDate(new Date().getDate() - 13))) } },
      select: { createdAt: true },
    }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const counts = Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
  const daily = buildDaily(last14.map((r) => r.createdAt));
  const recent = await prisma.repairRequest.findMany({
    take: 7,
    orderBy: { createdAt: "desc" },
    include: { assignedTechnician: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">نظرة عامة</h1>
        <p className="mt-1 text-muted-foreground">حالة أعمالك في لمحة سريعة.</p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickAction
          href="/admin/repairs?status=SUBMITTED"
          title="طلبات جديدة"
          body={`${counts.SUBMITTED ?? 0} طلب بمتظرة مراجعة`}
          tone="primary"
        />
        <QuickAction
          href="/admin/repairs?status=UNDER_REVIEW"
          title="تحت المراجعة"
          body={`${counts.UNDER_REVIEW ?? 0} طلب محتاج تعيين فني`}
          tone="soft"
        />
        <QuickAction
          href="/admin/products"
          title="مخزون قليل"
          body={`${lowStock} منتج بكمية ≥ 5`}
          tone="soft"
        />
      </div>

      {/* Status chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CARD_STATUSES.map((s) => {
          const n = counts[s] ?? 0;
          return (
            <Link
              key={s}
              href={`/admin/repairs?status=${s}`}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-2xl font-semibold">{n}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{statusLabels[s]?.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Insights: 14-day chart + notifications */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">طلبات الإصلاح — آخر 14 يوم</h2>
            <span className="text-xs text-muted-foreground">
              الإجمالي: {daily.reduce((s, d) => s + d.count, 0)}
            </span>
          </div>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {daily.map((d, i) => {
              const max = Math.max(1, ...daily.map((x) => x.count));
              const h = Math.round((d.count / max) * 100);
              const today = i === daily.length - 1;
              return (
                <div key={d.label + i} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.count} طلب`}>
                  <span className="text-[10px] font-medium text-muted-foreground">{d.count || ""}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${today ? "bg-primary" : "bg-primary/30 hover:bg-primary/50"}`}
                    style={{ height: `${Math.max(h, d.count > 0 ? 12 : 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5">
            {daily.map((d, i) => (
              <span key={i} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
                {d.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">آخر الإشعارات المرسلة</h2>
          <div className="mt-3 space-y-2.5">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground">مفيش إشعارات لسه — أول طلب هيرسل SMS تأكيد.</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {n.channel === "EMAIL" ? <Mail className="size-3.5" /> : <MessageSquareText className="size-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground" dir="ltr">
                    {n.channel} · {formatTime(n.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="إجمالي طلبات الإصلاح" value={total} />
        <StatCard icon={UserRoundCog} label="فنيين نشطين" value={technicians} />
        <StatCard icon={Package} label="منتجات بكمية قليلة (≤5)" value={lowStock} href="/admin/products" />
      </div>

      {/* Recent */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="font-semibold">أحدث طلبات الإصلاح</h2>
          <Link href="/admin/repairs" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            عرض الكل
            <ArrowLeft className="flip-rtl size-4" />
          </Link>
        </div>
        <div className="mt-3 divide-y divide-border">
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">مفيش طلبات لسه — أول طلب لوحك هيفتح التجربة.</p>
          )}
          {recent.map((r) => (
            <Link
              key={r.id}
              href={`/admin/repairs/${r.id}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Wrench className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  <span dir="ltr">{r.refNo}</span> · {r.customerName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.deviceDescription} · {r.city}
                </span>
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {r.assignedTechnician?.name ?? "غير مسند"}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusLabels[r.status]?.tone)}>
                {statusLabels[r.status]?.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href} className="transition-transform hover:-translate-y-0.5">{inner}</Link> : inner;
}

function QuickAction({ href, title, body, tone }: { href: string; title: string; body: string; tone?: "primary" | "soft" }) {
  return (
    <Link
      href={href}
      className={cn(
        "tilt-card group flex items-center gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
        tone === "primary" ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-border bg-card hover:shadow-sm"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
        )}
      >
        <ArrowLeft className="flip-rtl size-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium leading-tight">{title}</span>
        <span className="block text-xs text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}