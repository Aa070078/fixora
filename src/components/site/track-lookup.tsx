"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = value.trim();
    if (code.length < 4) {
      setError("اكتب كود التتبع (مثال: FX-4912)");
      return;
    }
    setError(null);
    router.push(`/track/${encodeURIComponent(code)}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="FX-4912"
            aria-label="كود التتبع"
            className="h-12 px-4 text-base tracking-wide"
            autoFocus
            dir="ltr"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6 text-base">
          تتبع
          <ArrowLeft className="flip-rtl" data-icon="inline-end" />
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className="mt-3 text-center text-sm text-muted-foreground">
        الكود ده موجود في تأكيد الحجز (رسالة SMS وإيميل).
      </p>
    </form>
  );
}