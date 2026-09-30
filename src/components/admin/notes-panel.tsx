"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/site";

export type Note = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string } | null;
};

export function NotesPanel({ repairId, notes, defaultOpen }: { repairId: string; notes: Note[]; defaultOpen?: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(defaultOpen ?? false);

  async function add() {
    if (!body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/repairs/${repairId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "حصلت مشكلة");
      setBody("");
      toast.success("تمت إضافة الملاحظة");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Cardish>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <p className="text-sm font-semibold">ملاحظات داخلية ({notes.length})</p>
        <span className="text-xs text-muted-foreground">{open ? "إغلاق" : "فتح"}</span>
      </button>

      {open && (
        <>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pe-1">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">مفيش ملاحظات لسه.</p>}
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-secondary/70 p-3">
                <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {n.author?.name ?? "النظام"} · {formatDateTime(n.createdAt)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-end gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب ملاحظة داخلية (مش بتظهر للعميل)…"
              className="min-h-20 flex-1 resize-none text-sm"
            />
            <Button onClick={add} disabled={busy || !body.trim()} size="icon" aria-label="إضافة ملاحظة">
              {busy ? <span className="size-4 animate-pulse" /> : <Send className="size-4" />}
            </Button>
          </div>
        </>
      )}
    </Cardish>
  );
}

function Cardish({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5">{children}</div>;
}