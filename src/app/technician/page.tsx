import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Phone, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDateTime, statusLabels } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTIVE = ["ASSIGNED", "ON_THE_WAY", "STARTED"] as const;
type RepairStatus = "SUBMITTED" | "UNDER_REVIEW" | "ASSIGNED" | "ON_THE_WAY" | "STARTED" | "COMPLETED" | "CANCELLED";

export default async function TechnicianJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const user = await getSession();
  if (!user || (user.role !== "TECHNICIAN" && user.role !== "ADMIN")) redirect("/signin");
  const { all } = await searchParams;
  const showAll = all === "1";

  const where = {
    ...(user.role === "TECHNICIAN" ? { assignedTechnicianId: user.sub } : {}),
    ...(showAll ? {} : { status: { in: [...ACTIVE, "COMPLETED"] as RepairStatus[] } }),
  };

  const jobs = await prisma.repairRequest.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: showAll ? 100 : 30,
    include: { assignedTechnician: { select: { name: true } } },
  });

  const activeCount = jobs.filter((j) => (ACTIVE as readonly string[]).includes(j.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">مهامي</h1>
          <p className="mt-1 text-muted-foreground">
            {showAll ? "كل المهام المسندة." : `${activeCount} مهام نشطة في انتظارك.`}
          </p>
        </div>
        <Link
          href={showAll ? "/technician" : "/technician?all=1"}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {showAll ? "المهام النشطة" : "كل المهام"}
          <ArrowLeft className="flip-rtl size-4" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Wrench className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">مفيش مهام لسه — هتظهر هنا أول ما الأدارة تسندلك طلب.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/technician/jobs/${j.id}`}
              className="tilt-card flex flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold" dir="ltr">
                  {j.refNo}
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusLabels[j.status]?.tone)}>
                  {statusLabels[j.status]?.label}
                </span>
              </div>
              <p className="mt-3 font-medium leading-snug">{j.deviceDescription}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.issueDescription}</p>
              <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  {j.addressLine1}، {j.city}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" />
                  <span dir="ltr">{j.customerPhone}</span>
                </p>
                {j.scheduledAt && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    {formatDateTime(j.scheduledAt)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}