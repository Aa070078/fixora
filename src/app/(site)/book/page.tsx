import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/repair/booking-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const brands = await prisma.deviceBrand.findMany({
    include: { models: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
    take: 40,
  });

  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<BookingSkeleton />}>
        <BookingForm brands={brands} />
      </Suspense>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-4 h-4 w-96" />
      <Skeleton className="mt-10 h-96 w-full rounded-3xl" />
    </div>
  );
}