"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { href: "/admin/repairs", label: "طلبات الإصلاح", icon: Wrench },
  { href: "/admin/orders", label: "الطلبات (المتجر)", icon: ShoppingCart },
  { href: "/admin/products", label: "المنتجات والمخزون", icon: Package },
];

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* Mobile topnav */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="text-sm font-semibold">لوحة فيكسورا</span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3" aria-label="لوحة التحكم">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground",
                isActive(item) && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-border bg-card/60 p-4 lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
          <LogoMark className="size-9" />
          <div>
            <p className="text-sm font-semibold">فيكسورا</p>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
        <nav className="mt-6 flex flex-col gap-1" aria-label="لوحة التحكم">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(item) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-primary">
              {user.name[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">المظهر</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}