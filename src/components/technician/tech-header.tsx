"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPinned, Wrench } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

export function TechHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-site flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <div>
              <p className="text-sm font-semibold leading-tight">مهام الفني</p>
              <p className="text-xs leading-tight text-muted-foreground" dir="ltr">
                {name}
              </p>
            </div>
          </div>
          <nav className="ms-4 hidden gap-1 sm:flex" aria-label="الفني">
            <Link
              href="/technician"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                pathname === "/technician" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <MapPinned className="size-3.5" />
              مهامي
            </Link>
            <Link
              href="/technician/jobs"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                pathname.includes("/jobs") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Wrench className="size-3.5" />
              كل المهام
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}