import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MessageCircleQuestion,
  Phone,
  Smartphone,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, issueOptions, repairStatusSteps, site, statusLabels } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrackDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { token } = await params;
  const { welcome } = await searchParams;

  const request = await prisma.repairRequest.findUnique({
    where: { trackingToken: token.toUpperCase() },
    include: {
      media: true,
      statusHistory: {
        include: { createdBy: true },
      },
      assignedTechnician: true,
    },
  });

  if (!request) notFound();

  const issueLabel = issueOptions.find((i) => i.value === request.issueCategory)?.label ?? "إصلاح";
  const currentIndex = repairStatusSteps.findIndex((s) => s.key === request.status);
  const welcomeView = welcome === "1" && request.status === "SUBMITTED";

  return (
    <div className="container-site py-12 sm:py-16">
      {welcomeView && (
        <div className="mx-auto mb-10 max-w-2xl rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">تم استلام طلبك!</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            رقم المرجع <span className="font-semibold text-foreground" dir="ltr">{request.refNo}</span>.
            احفظ الصفحة دي عشان تتابع كل مرحلة.
          </p>
          <ol className="mx-auto mt-6 max-w-sm space-y-2 text-start text-sm">
            {[
              "فريقنا بيراجع طلبك خلال دقايق",
              "هنبعثلك تأكيد بالموعد على الموبايل",
              "بيتم تعيين فني معتمد مناسب لجهازك",
              "يوصلك في الوقت اللي اخترته ويصلّح في المكان",
            ].map((s, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              إصلاح · <span className="font-semibold text-foreground" dir="ltr">{request.refNo}</span>
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{issueLabel}</h1>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium",
              statusLabels[request.status]?.tone
            )}
          >
            {statusLabels[request.status]?.label}
          </span>
        </div>

        {/* Timeline */}
        <Card className="mt-8 p-6 sm:p-8">
          <div className="flex flex-col gap-0 sm:flex-row sm:justify-between sm:gap-4">
            {repairStatusSteps.map((step, i) => {
              const done = request.status === "COMPLETED" || (currentIndex >= 0 && i < currentIndex);
              const current = i === currentIndex;
              return (
                <div key={step.key} className="relative flex gap-3 sm:flex-col sm:items-center sm:text-center">
                  {i < repairStatusSteps.length - 1 && (
                    <span className="absolute left-[1.05rem] top-8 h-full w-px bg-border sm:left-auto sm:top-[1.05rem] sm:h-px sm:w-full" style={{ insetInlineStart: "1.05rem" }} />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                      done && "border-primary bg-primary text-primary-foreground",
                      current && !done && "border-primary text-primary",
                      !done && !current && "border-border text-muted-foreground"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <span className="size-2 rounded-full bg-current" />
                    )}
                  </span>
                  <div className="pb-5 sm:pb-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {current && <p className="text-xs text-muted-foreground">المرحلة الحالية</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Request details */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4 text-primary" /> تفاصيل الطلب
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="الجهاز">
                {request.deviceDescription || (
                  <span className="italic text-muted-foreground">غير موضح</span>
                )}
              </Row>
              <Row label="المشكلة">{issueLabel}</Row>
              <Row label="وصف العطل">
                <span className="line-clamp-3">{request.issueDescription}</span>
              </Row>
              {request.estimatedPrice != null && (
                <Row label="السعر التقديري">{formatCurrency(request.estimatedPrice)}</Row>
              )}
              {(request.preferredDate || request.preferredTimeSlot) && (
                <Row label="الموعد المفضل">
                  {[request.preferredDate ? formatDate(request.preferredDate) : null, request.preferredTimeSlot].filter(Boolean).join(" · ")}
                </Row>
              )}
            </dl>
          </Card>

          {/* Visit + contact */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold">الزيارة وبيانات التواصل</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="العنوان">
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {request.addressLine1}
                    {request.addressLine2 ? `، ${request.addressLine2}` : ""}، {request.city}
                    {request.region ? `، ${request.region}` : ""}
                  </span>
                </span>
              </Row>
              <Row label="الاسم">{request.customerName}</Row>
              <Row label="الموبايل">
                <a href={`tel:${request.customerPhone}`} className="text-primary hover:underline" dir="ltr">
                  {request.customerPhone}
                </a>
              </Row>
              {request.customerEmail && <Row label="الإيميل">{request.customerEmail}</Row>}
              {request.assignedTechnician && (
                <Row label="الفني">
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="size-4 text-primary" />
                    {request.assignedTechnician.name}
                  </span>
                </Row>
              )}
            </dl>
          </Card>
        </div>

        {/* Media */}
        {request.media.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="size-4 text-primary" /> صور الجهاز
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {request.media.map((m) => (
                <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="group">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={m.url}
                      alt={m.caption ?? "صورة الجهاز"}
                      fill
                      sizes="(max-width: 640px) 45vw, 160px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Help */}
        <Card className="mt-6 flex flex-col items-start justify-between gap-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleQuestion className="size-5" />
            </span>
            <div>
              <p className="font-medium">عايز تغيّر حاجة؟</p>
              <p className="text-sm text-muted-foreground">
                كلمنا واقولهم <span dir="ltr">{request.refNo}</span> وهنعدّلها ليك.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <a href={`tel:${site.phone}`}>
              <Phone data-icon="inline-start" />
              اتصل بالدعم
            </a>
          </Button>
        </Card>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <Clock className="size-4" /> بتتحدث تلقائيًا في كل مرحلة ·{" "}
          <Link href="/" className="text-primary hover:underline">
            الرجوع لفيكسورا
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{children}</dd>
    </div>
  );
}