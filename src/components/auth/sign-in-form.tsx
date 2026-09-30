"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/site/logo";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("اكتب الإيميل وكلمة السر");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.user) throw new Error(json.error ?? "بيانات الدخول غير صحيحة");
      const dest = searchParams.get("next") || (json.user.role === "ADMIN" ? "/admin" : "/technician");
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصلت مشكلة، جرب تاني");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden py-10">
      <div className="orb orb-a -top-24 start-[-8%] size-96 bg-primary/15" aria-hidden="true" />
      <div className="orb orb-b bottom-0 end-[-6%] size-96 bg-accent/50" aria-hidden="true" />

      <Card className="relative z-10 w-full max-w-sm p-7 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-12" />
          <h1 className="mt-3 text-xl font-semibold">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-muted-foreground">بوابة فيكسورا الداخلية للفريق</p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <Label htmlFor="email">الإيميل</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fixora.com"
              className="mt-1.5"
              dir="ltr"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password">كلمة السر</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5"
              dir="ltr"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-base">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                جاري الدخول…
              </>
            ) : (
              "دخول"
            )}
          </Button>
        </form>

        <p className="mt-6 rounded-xl bg-secondary p-3 text-center text-xs text-muted-foreground">
          حساب التجربة: <span dir="ltr">admin@fixora.com</span> / <span dir="ltr">Fixora@123</span>
        </p>
      </Card>
    </div>
  );
}