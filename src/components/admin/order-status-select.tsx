"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { machineStatusLabels } from "@/lib/site";
import { cn } from "@/lib/utils";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    if (next === status) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "حصلت مشكلة");
      toast.success("تم تحديث الطلب");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => change(e.target.value)}
      disabled={busy}
      className={cn(
        "h-8 rounded-lg border border-input bg-card px-2 text-xs font-medium outline-none focus-visible:border-ring",
        machineStatusLabels[status]?.tone?.split(" ")[0]
      )}
      aria-label="حالة الطلب"
    >
      {Object.entries(machineStatusLabels).map(([key, v]) => (
        <option key={key} value={key}>
          {v.label}
        </option>
      ))}
    </select>
  );
}