"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/site";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (itemized.length === 0) return;
    if (form.customerName.trim().length < 2) next.customerName = "اكتب اسمك";
    if (!/^[+\d][\d\s\-().]{6,19}$/.test(form.customerPhone)) next.customerPhone = "اكتب رقم صحيح";
    if (form.addressLine1.trim().length < 5) next.addressLine1 = "اكتب عنوان الشارع";
    if (form.city.trim().length < 2) next.city = "اكتب المدينة";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemized.map((i) => ({ id: i.id, qty: i.qty })),
          deliveryFee,
          ...form,
          customerEmail: form.customerEmail.trim() || null,
          addressLine2: form.addressLine2.trim() || null,
          region: form.region.trim() || null,
          postalCode: form.postalCode.trim() || null,
          note: form.note.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "حصلت مشكلة");
      clear();
      router.push(`/order/${json.refNo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حصلت مشكلة");
      setBusy(false);
    }
  }

  const itemized = items;

  if (itemized.length === 0) {
    return (
      <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingBag className="size-6" />
        </span>
        <p className="text-muted-foreground">سلة المشتريات فاضية — ضيف منتجات الأول.</p>
        <Button asChild size="lg">
          <Link href="/shop">
            ابدأ التسوق
            <ArrowLeft className="flip-rtl" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-site py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">إتمام الطلب</h1>
      <p className="mt-2 text-muted-foreground">الدفع عند الاستلام · نأكدلك الطلب بمكالمة قبل الشحن.</p>

      <form onSubmit={submit} className="mt-8 grid animate-in fade-in slide-in-from-bottom-2 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 className="font-semibold">بيانات التواصل</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="cname" label="الاسم" error={errors.customerName}>
                <Input id="cname" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="مثال: منى علي" />
              </Field>
              <Field id="cphone" label="رقم الموبايل" error={errors.customerPhone}>
                <Input id="cphone" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+20 1X XXX XXXX" inputMode="tel" dir="ltr" />
              </Field>
              <div className="sm:col-span-2">
                <Field id="cemail" label="الإيميل (اختياري)">
                  <Input id="cemail" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="you@example.com" dir="ltr" />
                </Field>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">عنوان التوصيل</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="cstreet" label="عنوان الشارع" error={errors.addressLine1}>
                  <Input id="cstreet" value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} placeholder="العمارة والشارع والشقة" />
                </Field>
              </div>
              <Field id="cline2" label="دور / علامة مميزة (اختياري)">
                <Input id="cline2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
              </Field>
              <Field id="ccity" label="المدينة" error={errors.city}>
                <Input id="ccity" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field id="cregion" label="الحي / المنطقة (اختياري)">
                <Input id="cregion" value={form.region} onChange={(e) => set("region", e.target.value)} />
              </Field>
              <Field id="czip" label="الرمز البريدي (اختياري)">
                <Input id="czip" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="cnote" label="ملاحظات (اختياري)">
                  <Textarea id="cnote" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="أي تعليمات إضافية للتوصيل…" className="min-h-20 resize-none" />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
            بناخد الدفع عند الاستلام (كاش). الدفع بالبطاقة هيبقى متاح قريبًا.
          </div>
        </Card>

        <Card className="sticky top-24 p-6">
          <h2 className="font-semibold">ملخص الطلب</h2>
          <div className="mt-4 space-y-3">
            {itemized.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {i.name} <span className="text-muted-foreground">×{i.qty}</span>
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">المجموع الفرعي</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">التوصيل</dt>
              <dd className="font-medium">{deliveryFee === 0 ? <span className="text-success">مجاني</span> : formatCurrency(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">الإجمالي</dt>
              <dd className="font-semibold">{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-5 h-11 w-full text-base" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" />
                جاري إنشاء الطلب…
              </>
            ) : (
              `اتأكد الطلب · ${formatCurrency(total)}`
            )}
          </Button>
          <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-primary" />
            بيتم تأكيد الطلب ومراجعة المخزون قبل التوصيل.
          </p>
        </Card>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}