"use client";

import { CalendarCheck2, ExternalLink, Loader2, UserRoundCog, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusLabels } from "@/lib/site";

type Technician = { id: string; name: string };

export function RepairActions({
  id,
  currentStatus,
  technicians,
  currentTech,
  scheduledAt,
}: {
  id: string;
  currentStatus: string;
  technicians: Technician[];
  currentTech?: string | null;
  scheduledAt?: Date | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [statusNote, setStatusNote] = useState("");
  const [tech, setTech] = useState(currentTech ?? "");
  const [appt, setAppt] = useState(
    scheduledAt ? new Date(scheduledAt.getTime() - scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""
  );
  const [busy, setBusy] = useState<"status" | "assign" | "price" | null>(null);
  const [est, setEst] = useState("");
  const [final, setFinal] = useState("");

  async function run(action: "status" | "assign" | "price", body: Record<string, unknown>) {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/repairs/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "حصلت مشكلة");
      toast.success("تم الحفظ");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setBusy(null);
    }
  }

  const statusOptions = Object.keys(statusLabels);

  return (
    <div className="space-y-5">
      {/* Status */}
      <div>
        <p className="text-sm font-semibold">تحديث الحالة</p>
        <p className="text-xs text-muted-foreground">كل تغيير بيتسجل في سجل الطلب.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="ملاحظة على التغيير (اختياري)"
            className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            variant="outline"
            onClick={() => run("status", { status, note: statusNote || undefined })}
            disabled={busy !== null || status === currentStatus}
          >
            {busy === "status" ? <Loader2 className="animate-spin" /> : <CalendarCheck2 data-icon="inline-start" />}
            تطبيق
          </Button>
        </div>
      </div>

      {/* Assign */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold">تعيين فني وموعد الزيارة</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select value={tech} onValueChange={setTech}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="اختر فني" />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="datetime-local"
            value={appt}
            onChange={(e) => setAppt(e.target.value)}
            className="w-full sm:w-56"
            aria-label="موعد الزيارة"
          />
          <Button
            variant="outline"
            onClick={() => run("assign", { technicianId: tech, scheduledAt: appt || null })}
            disabled={busy !== null || !tech}
          >
            {busy === "assign" ? <Loader2 className="animate-spin" /> : <UserRoundCog data-icon="inline-start" />}
            تعيين
          </Button>
        </div>
      </div>

      {/* Prices */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold">السعر</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="est" className="text-xs text-muted-foreground">
              السعر التقديري (ج.م)
            </Label>
            <Input id="est" type="number" inputMode="numeric" value={est} onChange={(e) => setEst(e.target.value)} placeholder="مثال: 1499" className="mt-1 h-9" dir="ltr" />
          </div>
          <div className="flex-1">
            <Label htmlFor="final" className="text-xs text-muted-foreground">
              السعر النهائي (ج.م)
            </Label>
            <Input id="final" type="number" inputMode="numeric" value={final} onChange={(e) => setFinal(e.target.value)} placeholder="يتأكد بعد الإصلاح" className="mt-1 h-9" dir="ltr" />
          </div>
          <Button variant="outline" className="self-end" onClick={() => run("price", { estimatedPrice: est ? Number(est) : null, finalPrice: final ? Number(final) : null })} disabled={busy !== null || (!est && !final)}>
            {busy === "price" ? <Loader2 className="animate-spin" /> : <Wallet data-icon="inline-start" />}
            حفظ السعر
          </Button>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ExternalLink className="size-3.5" />
        التغييرات بتتسجل في سجل الحالة وتظهر للعميل فورًا في صفحة التتبع.
      </p>
    </div>
  );
}