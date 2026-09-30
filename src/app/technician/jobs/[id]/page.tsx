import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Smartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDateTime, issueOptions, statusLabels } from "@/lib/site";
import { JobControls } from "@/components/technician/job-controls";
import { NotesPanel } from "@/components/admin/notes-panel";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TechJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || (user.role !== "TECHNICIAN" && user.role !== "ADMIN")) redirect("/signin");
  const { id } = await params;

  const job = await prisma.repairRequest.findFirst({
    where: user.role === "TECHNICIAN" ? { id, assignedTechnicianId: user.sub } : { id },
    include: {
      media: true,
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true, role: true } } },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      },
      assignedTechnician: { select: { name: true } },
    },
  });

  if (!job) notFound();

  const issueLabel = issueOptions.find((i) => i.value === job.issueCategory)?.label ?? "إصلاح";
  const address = [job.addressLine1, job.addressLine2, job.city, job.region, job.postalCode].filter(Boolean).join("، ");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/technician" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="flip-rtl size-4" />
          مهامي
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <span dir="ltr">{job.refNo}</span>
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusLabels[job.status]?.tone)}>
                {statusLabels[job.status]?.label}
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{issueLabel}</p>
          </div>
          {job.scheduledAt && <p className="text-sm text-muted-foreground">الموعد: {formatDateTime(job.scheduledAt)}</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="size-4 text-primary" /> بيانات المهمة
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="الجهاز">{job.deviceDescription}</Row>
              <Row label="العطل">{issueLabel}</Row>
              <Row label="الوصف">
                <p className="whitespace-pre-wrap">{job.issueDescription}</p>
              </Row>
              <Row label="الموعد المفضل">
                {[job.preferredDate ? fmtDate(job.preferredDate) : null, job.preferredTimeSlot].filter(Boolean).join(" · ") || "غير محدد"}
              </Row>
              {job.finalPrice != null && (
                <Row label="السعر النهائي">{`${job.finalPrice} ج.م`}</Row>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-primary" /> العميل والعنوان
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="الاسم">{job.customerName}</Row>
              <Row label="الموبايل">
                <a href={`tel:${job.customerPhone}`} className="text-primary hover:underline" dir="ltr">
                  {job.customerPhone}
                </a>
              </Row>
              <Row label="العنوان">
                <p className="whitespace-pre-wrap">{address}</p>
              </Row>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">سجل الحالة</h2>
            <ol className="mt-4">
              {job.statusHistory.map((h, i, arr) => {
                const last = i === arr.length - 1;
                return (
                  <li key={h.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && <span className="absolute start-[0.55rem] top-5 h-full w-px bg-border" />}
                    <span className="relative mt-1 flex size-[0.9rem] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card" />
                    <div>
                      <p className="text-sm font-medium">{statusLabels[h.toStatus]?.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.createdBy?.name ?? "النظام"} · {formatDateTime(h.createdAt)}
                        {h.note ? ` · ${h.note}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <NotesPanel
            repairId={job.id}
            notes={job.notes.map((n) => ({
              id: n.id,
              body: n.body,
              createdAt: n.createdAt.toISOString(),
              author: n.author,
            }))}
            defaultOpen
          />
        </div>

        <aside>
          <JobControls
            jobId={job.id}
            status={job.status}
            uploads={job.media.map((m) => ({ id: m.id, url: m.url }))}
            address={address}
          />
        </aside>
      </div>
    </div>
  );
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