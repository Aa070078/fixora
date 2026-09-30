import { TrackLookup } from "@/components/site/track-lookup";

export default function TrackPage() {
  return (
    <div className="container-site flex flex-col items-center py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">تتبع إصلاحك</p>
      <h1 className="mt-2 max-w-xl text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        إصلاحي وصل لفين؟
      </h1>
      <p className="mt-3 max-w-md text-center text-muted-foreground">
        اكتب كود التتبع اللي وصلك في التأكيد وشوف حالة الإصلاح لحظيًا — من غير حساب.
      </p>
      <div className="mt-8 w-full">
        <TrackLookup />
      </div>
    </div>
  );
}