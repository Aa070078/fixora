"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, Wrench } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CartButton } from "@/components/site/cart-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "الإصلاح", href: "/repair" },
  { label: "المتجر", href: "/shop" },
  { label: "تتبع طلبك", href: "/track" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="فيكسورا - الصفحة الرئيسية" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="القائمة الرئيسية">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-secondary text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${site.phone}`}
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground lg:flex me-2"
            dir="ltr"
          >
            <Phone className="size-4" />
            {site.phoneDisplay}
          </a>
          <ThemeToggle />
          <CartButton />
          <Button asChild size="lg" className="hidden md:inline-flex">
            <Link href="/book">
              <Wrench data-icon="inline-start" />
              احجز إصلاحًا
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden" aria-label="فتح القائمة">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-start">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="القائمة الجانبية">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                      (pathname === item.href || pathname.startsWith(item.href + "/")) && "bg-secondary text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild size="lg" className="mt-4">
                  <Link href="/book" onClick={() => setOpen(false)}>
                    <Wrench data-icon="inline-start" />
                    احجز إصلاحًا
                  </Link>
                </Button>
              </nav>
              <div className="mt-auto border-t border-border pt-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2" dir="ltr">
                  <Phone className="size-4" /> {site.phoneDisplay}
                </p>
                <p className="mt-1">{site.hours}</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}