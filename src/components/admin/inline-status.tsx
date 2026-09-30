"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { statusLabels } from "@/lib/site";
import { cn } from "@/lib/utils";

export function InlineStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function change(next: string) {
    if (next === status) return;
    start(async () => {
      try {
        const res = await fetch(`/api/admin/repairs/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", status: next }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "حصلت مشكلة");
        toast.success("تم تحديث الحالة");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
      }
    });
  }

  return (
    <div className="relative">
      {/* Visual badge */}
      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusLabels[status]?.tone)}>
        {statusLabels[status]?.label}
      </span>
      {/* Overlay select for quick change */}
      <select
        value={status}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="تغيير الحالة"
      >
        {Object.entries(statusLabels).map(([key, v]) => (
          <option key={key} value={key} className="text-foreground">
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}