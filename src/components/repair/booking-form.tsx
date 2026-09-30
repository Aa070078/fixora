"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, issueOptions, timeSlots } from "@/lib/site";
import { cn } from "@/lib/utils";

type Brand = { id: string; name: string; models: { id: string; name: string }[] };
type Upload = { url: string; name: string };
type UploadState =
  | { status: "uploading"; name: string }
  | { status: "done"; file: Upload }
  | { status: "error"; name: string };

const STEPS = [
  { key: "device", label: "الجهاز", icon: Smartphone },
  { key: "problem", label: "المشكلة", icon: Wrench },
  { key: "photos", label: "الصور", icon: ImagePlus },
  { key: "location", label: "العنوان", icon: MapPin },
  { key: "time", label: "الموعد", icon: CalendarDays },
  { key: "contact", label: "التواصل", icon: User },
  { key: "review", label: "المراجعة", icon: Check },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const formDefaults = {
  deviceBrandId: "",
  deviceModelId: "",
  deviceDescription: "",
  issueCategory: "",
  issueDescription: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  locationLabel: "",
  preferredDate: "",
  preferredTimeSlot: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
};

export function BookingForm({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledIssue = searchParams.get("issue") ?? "";

  const [step, setStep] = useState<StepKey>("device");
  const [form, setForm] = useState<typeof formDefaults>({
    ...formDefaults,
    issueCategory: prefilledIssue,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const selectedBrand = brands.find((b) => b.id === form.deviceBrandId);
  const isLast = step === "review";

  function set<K extends keyof typeof formDefaults>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate(stepKey: StepKey): boolean {
    const next: Record<string, string> = {};
    if (stepKey === "device") {
      if (!form.deviceDescription.trim()) next.deviceDescription = "قولنا إيه الجهاز اللي عندك";
    }
    if (stepKey === "problem") {
      if (!form.issueCategory) next.issueCategory = "اختار العطل اللي أقرب للوصف";
      if (form.issueDescription.trim().length < 10)
        next.issueDescription = "ضيف جملة أو اتنين عشان نجهز صح";
    }
    if (stepKey === "location") {
      if (form.addressLine1.trim().length < 5) next.addressLine1 = "اكتب عنوان الشارع";
      if (form.city.trim().length < 2) next.city = "اكتب اسم المدينة";
      if (!/^[\d\w\s\-,./#\u0600-\u06FF]+$/.test(form.addressLine1.trim()))
        next.addressLine1 = "العنوان مش واضح — حروف وأرقام بس";
    }
    if (stepKey === "time") {
      if (!form.preferredDate) next.preferredDate = "اختار اليوم";
      if (!form.preferredTimeSlot) next.preferredTimeSlot = "اختار الفترة الزمنية";
    }
    if (stepKey === "contact") {
      if (form.customerName.trim().length < 2) next.customerName = "اكتب اسمك";
      if (!/^[+\d][\d\s\-().]{6,19}$/.test(form.customerPhone))
        next.customerPhone = "اكتب رقم موبايل صحيح";
      if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
        next.customerEmail = "الإيميل ده مش صحيح";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goTo(stepKey: StepKey) {
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(stepKey);
  }

  function next() {
    if (!validate(step)) return;
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) goTo(STEPS[idx + 1].key);
  }

  function back() {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) goTo(STEPS[idx - 1].key);
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/")).slice(0, 4);
    if (files.length === 0) return;

    const slots = 4 - uploads.length;
    const take = files.slice(0, slots);
    if (take.length === 0) {
      toast.error("الحد الأقصى 4 صور");
      return;
    }

    const fd = new FormData();
    take.forEach((f) => fd.append("files", f));
    const placeholders = take.map((f) => ({ status: "uploading" as const, name: f.name }));
    setUploads((u) => [...u, ...placeholders]);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.urls) throw new Error(json.error ?? "فشل الرفع");
      setUploads((u) => {
        const done: UploadState[] = [...u];
        json.urls.forEach((url: string, i: number) => {
          const idx = done.indexOf(placeholders[i]);
          if (idx >= 0) done[idx] = { status: "done", file: { url, name: take[i].name } };
        });
        return done;
      });
    } catch (e) {
      console.error(e);
      setUploads((u) =>
        u.map((x) => (x.status === "uploading" ? { status: "error", name: x.name } : x))
      );
      toast.error("مقدرناش نرفع الصور. جرب صور أصغر، أو تخطى الخطوة.");
    }
  }

  async function submit() {
    if (!validate(step)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/repair-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceBrandId: form.deviceBrandId || null,
          deviceModelId: form.deviceModelId || null,
          deviceDescription: form.deviceDescription.trim(),
          issueCategory: form.issueCategory,
          issueDescription: form.issueDescription.trim(),
          media: uploads.filter((u) => u.status === "done").map((u) => (u as { status: "done"; file: Upload }).file.url),
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          customerEmail: form.customerEmail.trim() || null,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim(),
          region: form.region.trim() || null,
          postalCode: form.postalCode.trim() || null,
          locationLabel: form.locationLabel.trim() || null,
          preferredDate: form.preferredDate || null,
          preferredTimeSlot: form.preferredTimeSlot || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "حصلت مشكلة، جرب تاني");
      router.push(`/track/${json.trackingToken}?welcome=1`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصلت مشكلة، جرب تاني");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">احجز إصلاحًا</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">خلينا نصلّح موبايلك</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          دقيقتين، من غير حساب. الموديل بالظبط اختياري — اوصف جهازك بس وكفاية.
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-8 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar sm:gap-2" aria-label="خطوات الحجز">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === currentIndex;
          const done = i < currentIndex;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => done && goTo(s.key)}
              disabled={!done && !active}
              className={cn(
                "flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium transition-all sm:px-3",
                active && "bg-primary text-primary-foreground",
                done && "cursor-pointer text-primary hover:bg-primary/10",
                !active && !done && "text-muted-foreground"
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px]",
                  done || active ? "bg-primary-foreground/15" : "bg-muted"
                )}
              >
                {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-8">
          {/* STEP: DEVICE */}
          {step === "device" && (
            <StepShell title="قولنا عن جهازك" subtitle="الموديل اختياري — الوصف بكلمتك كفاية.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="brand">الشركة <span className="text-muted-foreground">(اختياري)</span></Label>
                  <Select value={form.deviceBrandId} onValueChange={(v) => set("deviceBrandId", v)}>
                    <SelectTrigger id="brand" className="mt-1.5">
                      <SelectValue placeholder="اختر الشركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__other__">شركة تانية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">الموديل <span className="text-muted-foreground">(اختياري)</span></Label>
                  <Select
                    value={form.deviceModelId}
                    onValueChange={(v) => set("deviceModelId", v)}
                    disabled={!selectedBrand || selectedBrand?.models.length === 0}
                  >
                    <SelectTrigger id="model" className="mt-1.5">
                      <SelectValue placeholder={selectedBrand ? "اختر الموديل" : "اختار الشركة الأول"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBrand?.models.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__unsure__">مش متأكد بالظبط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-5">
                <Label htmlFor="deviceDescription">اوصف جهازك</Label>
                <Textarea
                  id="deviceDescription"
                  value={form.deviceDescription}
                  onChange={(e) => set("deviceDescription", e.target.value)}
                  placeholder="مثال: Samsung A54"
                  className="mt-1.5 min-h-24 resize-y"
                  aria-invalid={!!errors.deviceDescription}
                />
                {errors.deviceDescription ? (
                  <p className="mt-1.5 text-sm text-destructive">{errors.deviceDescription}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    مثال: «آيفون 15 برو» أو «سامسونج A54» أو «آيفون مش متأكد من الموديل»
                  </p>
                )}
              </div>
            </StepShell>
          )}

          {/* STEP: PROBLEM */}
          {step === "problem" && (
            <StepShell title="إيه المشكلة؟" subtitle="اختار الأقرب للوصف وضيف كام سطر.">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {issueOptions.map((issue) => (
                  <button
                    key={issue.value}
                    type="button"
                    onClick={() => set("issueCategory", issue.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                      form.issueCategory === issue.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        form.issueCategory === issue.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {form.issueCategory === issue.value && <Check className="size-3" />}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{issue.label}</span>
                      <span className="block text-xs text-muted-foreground">{issue.startingFrom}</span>
                    </span>
                  </button>
                ))}
              </div>
              {errors.issueCategory && <p className="mt-3 text-sm text-destructive">{errors.issueCategory}</p>}

              <div className="mt-5">
                <Label htmlFor="issueDescription">اوصف المشكلة</Label>
                <Textarea
                  id="issueDescription"
                  value={form.issueDescription}
                  onChange={(e) => set("issueDescription", e.target.value)}
                  placeholder="مثال: النص اللي فوق نفس الشاشة مش بيستجيب للمس وعليه بقعة سودة."
                  className="mt-1.5 min-h-28 resize-y"
                  aria-invalid={!!errors.issueDescription}
                />
                {errors.issueDescription ? (
                  <p className="mt-1.5 text-sm text-destructive">{errors.issueDescription}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    كلامك العادي كفاية — مفيش حاجة ليه لازمك تقولها تقنيًا.
                  </p>
                )}
              </div>
            </StepShell>
          )}

          {/* STEP: PHOTOS */}
          {step === "photos" && (
            <StepShell
              title="ضيف صور (اختياري)"
              subtitle="وريها التلف — بيساعدنا نجهز القطع والسعر صح."
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/50"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UploadCloud className="size-6" />
                </span>
                <p className="mt-3 text-sm font-medium">
                  اسحب الصور هنا، أو{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-2"
                    onClick={() => document.getElementById("photo-input")?.click()}
                  >
                    اختارها من جهازك
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">JPG أو PNG أو WebP أو HEIC · حتى 4 صور · 8 ميجا لكل صورة</p>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {uploads.length > 0 && (
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {uploads.map((u, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      {u.status === "done" && (
                        <Image src={u.file.url} alt={u.file.name} fill sizes="120px" className="object-cover" />
                      )}
                      {u.status === "uploading" && (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="size-5 animate-spin text-primary" />
                        </div>
                      )}
                      {u.status === "error" && (
                        <div className="flex h-full flex-col items-center justify-center gap-1 p-1 text-center text-[10px] text-destructive">
                          <span>فشل الرفع</span>
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label="حذف الصورة"
                        onClick={() => setUploads((list) => list.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                مفيش مشكلة لو مش حابب تضيف صور — تخطى الخطوة.
              </p>
            </StepShell>
          )}

          {/* STEP: LOCATION */}
          {step === "location" && (
            <StepShell title="احنا نيجي فين؟" subtitle="ارجع البيت أو الشغل — إحنا اللي جاينلك.">
              <div className="grid gap-5">
                <div>
                  <Label htmlFor="addressLine1">عنوان الشارع</Label>
                  <Input
                    id="addressLine1"
                    value={form.addressLine1}
                    onChange={(e) => set("addressLine1", e.target.value)}
                    placeholder="العمارة والشارع والشقة"
                    className="mt-1.5"
                    aria-invalid={!!errors.addressLine1}
                  />
                  {errors.addressLine1 && <p className="mt-1.5 text-sm text-destructive">{errors.addressLine1}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="addressLine2">دور / علامة مميزة <span className="text-muted-foreground">(اختياري)</span></Label>
                    <Input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={(e) => set("addressLine2", e.target.value)}
                      placeholder="الدور الثاني · جمب المخبز"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className="mt-1.5"
                      aria-invalid={!!errors.city}
                    />
                    {errors.city && <p className="mt-1.5 text-sm text-destructive">{errors.city}</p>}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="region">الحي / المنطقة <span className="text-muted-foreground">(اختياري)</span></Label>
                    <Input
                      id="region"
                      value={form.region}
                      onChange={(e) => set("region", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">الرمز البريدي <span className="text-muted-foreground">(اختياري)</span></Label>
                    <Input
                      id="postalCode"
                      value={form.postalCode}
                      onChange={(e) => set("postalCode", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  العنوان مبيتشاركش مع حد غير الفني المسؤول عن طلبك.
                </p>
              </div>
            </StepShell>
          )}

          {/* STEP: TIME */}
          {step === "time" && (
            <StepShell title="امتى يناسبك؟" subtitle="اختار اليوم والفترة — بنفس اليوم غالبًا متاح.">
              <div>
                <Label>اليوم المناسب</Label>
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {nextDays(14).map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => set("preferredDate", d.iso)}
                      className={cn(
                        "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-all",
                        form.preferredDate === d.iso
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <span className={cn("text-[11px]", form.preferredDate === d.iso ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {d.label}
                      </span>
                      <span className="text-base font-semibold">{d.dayNum}</span>
                    </button>
                  ))}
                </div>
                {errors.preferredDate && <p className="mt-2 text-sm text-destructive">{errors.preferredDate}</p>}
              </div>

              <div className="mt-6">
                <Label>الفترة الزمنية</Label>
                <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => set("preferredTimeSlot", slot)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                        form.preferredTimeSlot === slot
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <Clock className="size-4" />
                      <span dir="ltr">{slot}</span>
                    </button>
                  ))}
                </div>
                {errors.preferredTimeSlot && (
                  <p className="mt-2 text-sm text-destructive">{errors.preferredTimeSlot}</p>
                )}
              </div>

              <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                محتاجه النهارده؟ اختار النهارده — إحنا بنأكد كل طلب في خلال دقايق.
              </p>
            </StepShell>
          )}

          {/* STEP: CONTACT */}
          {step === "contact" && (
            <StepShell title="نتواصل معاك إزاي؟" subtitle="بستخدموها عشان نأكد الموعد ونوريك حالة الفني لحظيًا.">
              <div className="grid gap-5">
                <div>
                  <Label htmlFor="customerName">اسمك</Label>
                  <Input
                    id="customerName"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="مثال: منى علي"
                    className="mt-1.5"
                    aria-invalid={!!errors.customerName}
                  />
                  {errors.customerName && <p className="mt-1.5 text-sm text-destructive">{errors.customerName}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="customerPhone">رقم الموبايل</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => set("customerPhone", e.target.value)}
                      placeholder="+20 1X XXX XXXX"
                      inputMode="tel"
                      className="mt-1.5"
                      dir="ltr"
                      aria-invalid={!!errors.customerPhone}
                    />
                    {errors.customerPhone && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.customerPhone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">الإيميل <span className="text-muted-foreground">(اختياري)</span></Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => set("customerEmail", e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                      dir="ltr"
                      aria-invalid={!!errors.customerEmail}
                    />
                    {errors.customerEmail && (
                      <p className="mt-1.5 text-sm text-destructive">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  بياناتك مبيتشاركش مع حد ومفيش أي رسائل مزعجة.
                </p>
              </div>
            </StepShell>
          )}

          {/* STEP: REVIEW */}
          {step === "review" && (
            <StepShell title="كده تمام — راجع كل حاجة" subtitle="دوس على أي سطر ترجع تغيّره.">
              <div className="overflow-hidden rounded-2xl border border-border">
                <ReviewRow label="الجهاز" value={form.deviceDescription || "—"} onClick={() => goTo("device")} />
                <ReviewRow
                  label="المشكلة"
                  value={issueOptions.find((i) => i.value === form.issueCategory)?.label ?? "—"}
                  onClick={() => goTo("problem")}
                />
                <ReviewRow
                  label="تفاصيل المشكلة"
                  value={form.issueDescription || "—"}
                  onClick={() => goTo("problem")}
                />
                <ReviewRow
                  label="الصور"
                  value={`${uploads.filter((u) => u.status === "done").length} صورة`}
                  onClick={() => goTo("photos")}
                />
                <ReviewRow
                  label="العنوان"
                  value={[form.addressLine1, form.addressLine2, form.city, form.region].filter(Boolean).join(", ")}
                  onClick={() => goTo("location")}
                />
                <ReviewRow
                  label="موعد الزيارة"
                  value={[form.preferredDate && formatDate(form.preferredDate), form.preferredTimeSlot].filter(Boolean).join(" · ") || "—"}
                  onClick={() => goTo("time")}
                />
                <ReviewRow
                  label="بيانات التواصل"
                  value={`${form.customerName} · ${form.customerPhone}`}
                  onClick={() => goTo("contact")}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  الإرسال مجاني وغير ملزم. هتوصل بتأكيد{" "}
                  <span className="font-medium text-foreground">بعرض سعر محدد</span> قبل ما أي شغل
                  يبدأ. تقدر تلغي في أي وقت.
                </p>
              </div>
            </StepShell>
          )}

          {/* NAV */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button type="button" variant="ghost" onClick={back} disabled={currentIndex === 0} className="gap-1.5">
              <ArrowRight className="flip-rtl" data-icon="inline-start" />
              السابق
            </Button>
            {isLast ? (
              <Button type="button" onClick={submit} disabled={submitting} size="lg" className="h-11 px-6">
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    جاري الإرسال…
                  </>
                ) : (
                  <>
                    إرسال الطلب
                    <Check data-icon="inline-end" />
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={next} size="lg" className="h-11 px-6">
                متابعة
                <ArrowLeft className="flip-rtl" data-icon="inline-end" />
              </Button>
            )}
          </div>
        </Card>

        {/* Summary sidebar */}
        <aside className="sticky top-24 hidden lg:block">
          <Card className="p-5">
            <p className="text-sm font-semibold">طلبك</p>
            <SummaryLine icon={Smartphone} label="الجهاز" value={form.deviceDescription ? `✓ ${truncate(form.deviceDescription, 26)}` : "اوصف الجهاز"} done={!!form.deviceDescription} />
            <SummaryLine icon={Wrench} label="المشكلة" value={form.issueCategory ? issueOptions.find((i) => i.value === form.issueCategory)?.label ?? "✓" : "اختار المشكلة"} done={!!form.issueCategory} />
            <SummaryLine icon={MapPin} label="العنوان" value={form.addressLine1 ? truncate(form.addressLine1, 26) : "احنا نيجي فين؟"} done={!!form.addressLine1} />
            <SummaryLine icon={CalendarDays} label="الموعد" value={form.preferredTimeSlot || (form.preferredDate ? "اخترت اليوم" : "اختار الفترة")} done={!!form.preferredTimeSlot} />
            <SummaryLine icon={User} label="التواصل" value={form.customerPhone ? form.customerPhone : "رقم الموبايل"} done={!!form.customerPhone} />

            <div className="mt-5 rounded-xl bg-secondary p-3.5 text-sm">
              <p className="font-medium">السعر</p>
              <p className="mt-1 text-muted-foreground">
                سعر واضح بيتأكد قبل ما الفني يبدأ.{" "}
                <span className="font-medium text-foreground">مفيش إصلاح، مفيش فلوس.</span>
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-baseline justify-between gap-4 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/50"
    >
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-sm font-medium">
        {value}
        <ArrowLeft className="flip-rtl size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </button>
  );
}

function SummaryLine({
  icon: Icon,
  label,
  value,
  done,
}: {
  icon: typeof Smartphone;
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
        {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium leading-snug", !done && "text-muted-foreground")}>{value}</p>
      </div>
    </div>
  );
}

function nextDays(count: number) {
  const days: { iso: string; label: string; dayNum: number }[] = [];
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { weekday: "short" });
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: i === 0 ? "اليوم" : i === 1 ? "غدًا" : fmt.format(d),
      dayNum: d.getDate(),
    });
  }
  return days;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}