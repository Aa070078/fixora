import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Navigation,
  Smartphone,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime, issueOptions, statusLabels } from "@/lib/site";
import { RepairActions } from "@/components/admin/repair-actions";
import { NotesPanel } from "@/components/admin/notes-panel";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "تفاصيل طلب الإصلاح" };

export default async function AdminRepairDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [repair, technicians] = await Promise.all([
    prisma.repairRequest.findUnique({
      where: { id },
      include: {
        media: true,
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true } } },
        },
        assignedTechnician: { select: { id: true, name: true } },
        deviceBrand: { select: { name: true } },
        deviceModel: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!repair) notFound();

  const issueLabel = issueOptions.find((i) => i.value === repair.issueCategory)?.label ?? "إصلاح";
  const fullAddress = [
    repair.addressLine1,
    repair.addressLine2,
    repair.city,
    repair.region,
    repair.postalCode,
  ]
    .filter(Boolean)
    .join("، ");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/repairs" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="flip-rtl size-4" />
            كل الطلبات
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span dir="ltr">{repair.refNo}</span>
            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusLabels[repair.status]?.tone)}>
              {statusLabels[repair.status]?.label}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {issueLabel} · {repair.customerName} · {repair.city}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Request info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Cardish title="الجهاز والمشكلة" icon={Smartphone}>
              <Dl>
                <Row label="الجهاز">{repair.deviceDescription}</Row>
                {repair.deviceBrand && (
                  <Row label="الشركة">
                    {repair.deviceBrand.name} {repair.deviceModel ? `· ${repair.deviceModel.name}` : ""}
                  </Row>
                )}
                <Row label="العطل">{issueLabel}</Row>
                <Row label="التفاصيل">
                  <p className="whitespace-pre-wrap">{repair.issueDescription}</p>
                </Row>
                <Row label="الموعد المفضل">
                  {[repair.preferredDate ? fmtDate(repair.preferredDate) : null, repair.preferredTimeSlot]
                    .filter(Boolean)
                    .join(" · ") || "غير محدد"}
                </Row>
                <Row label="السعر التقديري">
                  {repair.estimatedPrice != null ? formatCurrency(repair.estimatedPrice) : "لم يُحدد بعد"}
                </Row>
                <Row label="السعر النهائي">
                  {repair.finalPrice != null ? formatCurrency(repair.finalPrice) : "لم يُحدد بعد"}
                </Row>
              </Dl>
            </Cardish>

            <Cardish title="العميل والعنوان" icon={MapPin}>
              <Dl>
                <Row label="الاسم">{repair.customerName}</Row>
                <Row label="الموبايل">
                  <a href={`tel:${repair.customerPhone}`} className="text-primary hover:underline" dir="ltr">
                    {repair.customerPhone}
                  </a>
                </Row>
                <Row label="الإيميل">{repair.customerEmail || "—"}</Row>
                <Row label="العنوان">
                  <p className="whitespace-pre-wrap">{fullAddress}</p>
                </Row>
                {repair.locationLabel && <Row label="ملاحظات الموقع">{repair.locationLabel}</Row>}
              </Dl>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Navigation className="size-3.5" />
                افتح الخريطة
              </a>
            </Cardish>
          </div>

          {/* Photos */}
          {repair.media.length > 0 && (
            <div className="cardish p-5">
              <h2 className="text-sm font-semibold">صور الجهاز ({repair.media.length})</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {repair.media.map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="group">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={m.url}
                        alt="صورة الجهاز"
                        fill
                        sizes="140px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="cardish p-5">
            <h2 className="text-sm font-semibold">سجل الحالة</h2>
            <ol className="mt-4 space-y-0">
              {repair.statusHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">مفيش تغييرات لسه.</p>
              )}
              {repair.statusHistory.map((h, i, arr) => {
                const last = i === arr.length - 1;
                return (
                  <li key={h.id} className="relative flex gap-3 pb-5">
                    {!last && <span className="absolute start-[0.55rem] top-5 h-full w-px bg-border" />}
                    <span className="relative mt-1 flex size-[0.9rem] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {statusLabels[h.toStatus]?.label}
                        {h.note ? <span className="font-normal text-muted-foreground"> · {h.note}</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {h.createdBy?.name ?? "النظام"} · {formatDateTime(h.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <NotesPanel
            repairId={repair.id}
            notes={repair.notes.map((n) => ({
              id: n.id,
              body: n.body,
              createdAt: n.createdAt.toISOString(),
              author: n.author,
            }))}
          />
        </div>

        {/* Actions sidebar */}
        <aside className="space-y-4">
          <div className="cardish p-5">
            <RepairActions
              id={repair.id}
              currentStatus={repair.status}
              technicians={technicians}
              currentTech={repair.assignedTechnician?.id ?? null}
              scheduledAt={repair.scheduledAt}
            />
          </div>
          <div className="cardish flex items-center gap-3 p-5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-primary">
              <Wrench className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{repair.assignedTechnician?.name ?? "لم يُسند إلى فني"}</p>
              <p className="text-xs text-muted-foreground">
                {repair.scheduledAt ? `موعد الزيارة · ${formatDateTime(repair.scheduledAt)}` : "الموعد غير محدد بعد"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Cardish({ title, icon: Icon, children }: { title: string; icon?: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="cardish p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {Icon && <Icon className="size-4 text-primary" />}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Dl({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-3 text-sm">{children}</dl>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{children}</dd>
    </div>
  );
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(new Date(y, m - 1, d));
}