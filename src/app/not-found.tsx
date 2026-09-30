import Link from "next/link";
import { ArrowLeft, Home, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="orb orb-a -top-24 start-[-8%] size-96 bg-primary/15" aria-hidden="true" />
      <div className="orb orb-b bottom-0 end-[-6%] size-96 bg-accent/50" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center">
        <LogoMark className="size-12" />
        <p className="mt-6 text-6xl font-bold tracking-tight text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold">الصفحة دي مش موجودة</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          يمكن العنوان اتغير أو اتبدل — بس كود التتبع بتاعك لسه شغال.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home data-icon="inline-start" />
              الرئيسية
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/repair">
              <Wrench data-icon="inline-start" />
              احجز إصلاحًا
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/track">
              تتبع طلبك
              <ArrowLeft className="flip-rtl" data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}