import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "تسجيل الدخول" };

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
          <Skeleton className="h-96 w-full max-w-sm rounded-3xl" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}