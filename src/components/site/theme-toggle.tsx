"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needs a mounted flag to avoid hydration mismatch
    setMounted(true);
  }, []);

  const dark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={dark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative overflow-hidden"
    >
      {mounted ? (
        dark ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />
      ) : (
        <span className="size-[1.15rem] rounded-full bg-muted" />
      )}
    </Button>
  );
}