"use client";

import {
  CheckCircle2,
  Loader2,
  MapPinned,
  Navigation,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { statusLabels } from "@/lib/site";

const NEXT_ACTION: Record<string, { status: string; label: string; icon: typeof MapPinned } | undefined> = {
  ASSIGNED: { status: "ON_THE_WAY", label: "الفني في الطريق", icon: MapPinned },
  ON_THE_WAY: { status: "STARTED", label: "بدأت الإصلاح", icon: Sparkles },
  STARTED: { status: "COMPLETED", label: "تم الإنجاز", icon: CheckCircle2 },
};

export function JobControls({
  jobId,
  status,
  uploads,
  address,
}: {
  jobId: string;
  status: string;
  uploads: { id: string; url: string }[];
  address: string;
}) {
  const router = useRouter();
  const next = NEXT_ACTION[status];
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function changeStatus() {
    if (!next) return;
    setBusy(next.status);
    try {
      const res = await fetch(`/api/technician/jobs/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status: next.status, note: note.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "حصلت مشكلة");
      toast.success("تم تحديث الحالة");
      setNote("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setBusy(null);
    }
  }

  async function addPhoto() {
    setPhotoBusy(true);
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.onchange = async () => {
        const files = input.files ? Array.from(input.files).slice(0, 4) : [];
        if (files.length === 0) return;
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await up.json();
        if (!up.ok || !j.urls) throw new Error(j.error ?? "فشل الرفع");
        for (const url of j.urls) {
          await fetch(`/api/technician/jobs/${jobId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "media", urls: [url] }),
          });
        }
        toast.success("تم إرفاق الصور");
        router.refresh();
      };
      input.click();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة");
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        {next ? (
          <>
            <p className="text-sm font-semibold">الخطوة التالية</p>
            <p className="mt-1 text-xs text-muted-foreground">
              الحالة الحالية: <span className="font-medium text-foreground">{statusLabels[status]?.label}</span>
            </p>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ملاحظة للعميل أو للفريق (اختياري)"
              className="mt-3 h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button
              size="lg"
              className="mt-3 h-11 w-full text-base"
              onClick={changeStatus}
              disabled={busy !== null || !next}
            >
              {busy === next.status ? (
                <Loader2 className="animate-spin" />
              ) : (
                <next.icon data-icon="inline-start" />
              )}
              {next.label}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="size-7 text-success" />
            <p className="text-sm font-semibold">المهمة منتهية</p>
            <p className="text-xs text-muted-foreground">شكرًا ليك — المهمة دي اتنفذت.</p>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">الصور ({uploads.length})</p>
          <Button variant="outline" size="sm" onClick={addPhoto} disabled={photoBusy || !!next?.status} title={next ? "أنهِ الخطوة الحالية أولًا" : "إضافة صور"}>
            {photoBusy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud data-icon="inline-start" className="size-4" />}
            إضافة صور
          </Button>
        </div>
        {uploads.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {uploads.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image src={m.url} alt="صورة من المهمة" fill sizes="100px" className="object-cover" />
                </div>
              </a>
            ))}
          </div>
        )}
        {uploads.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">مفيش صور بعد — تقدر تضيف صور قبل وبعد الإصلاح.</p>
        )}
      </Card>

      <Card className="flex items-center gap-3 p-5">
        <Navigation className="size-4 text-primary" />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          افتح العنوان في الخريطة
        </a>
      </Card>
    </div>
  );
}