import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Phone, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { title: "تأكيد الطلب" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ refNo: string }> }) {
  const { refNo } = await params;
  const order = await prisma.order.findUnique({ where: { refNo }, include: { items: true } });

  if (!order) notFound();

  return (
    <div className="container-site py-12 sm:py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">تم استلام طلبك!</h1>
        <p className="mt-2 text-muted-foreground">
          رقم الطلب <span className="font-semibold text-foreground" dir="ltr">{order.refNo}</span>. هنتواصل معاك
          قريبًا لتأكيد التوصيل.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-lg space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">المنتجات</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.productName} <span className="text-muted-foreground">×{i.quantity}</span></span>
                <span className="font-medium">{formatCurrency(Number(i.unitPrice) * i.quantity)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">التوصيل</dt>
              <dd className="font-medium">{Number(order.deliveryFee) === 0 ? <span className="text-success">مجاني</span> : formatCurrency(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold">الإجمالي</dt>
              <dd className="font-semibold">{formatCurrency(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">الدفع</dt>
              <dd className="font-medium">عند الاستلام</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 text-sm">
          <p className="font-semibold">بيانات التوصيل</p>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {[order.addressLine1, order.addressLine2, order.city, order.region].filter(Boolean).join("، ")}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <span dir="ltr">{order.customerPhone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> نتواصل قبل التوصيل لتأكيد الموعد
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/shop">متابعة التسوق</ButtonLink>
          <ButtonLink href="/" variant="ghost">
            الرجوع للرئيسية
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function ButtonLink({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "ghost";
}) {
  return (
    <Button asChild size="lg" variant={variant} className="flex-1">
      <Link href={href}>{children}</Link>
    </Button>
  );
}