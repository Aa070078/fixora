export const site = {
  name: "فيكسورا",
  nameLatin: "Fixora",
  tagline: "إصلاح موبايلك واكسسواراته، أون لاين وبينك وبين بيتك.",
  phone: "+20 100 000 0000",
  phoneDisplay: "+20 100 000 0000",
  email: "support@fixora.com",
  hours: "يوميًا · 9 ص - 9 م",
  currency: "EGP",
  warrantyDays: 90,
} as const;

export const timeSlots = ["9:00 – 12:00", "12:00 – 3:00", "3:00 – 6:00", "6:00 – 9:00"] as const;

export const issueOptions: { value: string; label: string; startingFrom: string }[] = [
  { value: "SCREEN", label: "إصلاح الشاشة", startingFrom: "ابتداءً من 1,499 ج.م" },
  { value: "BATTERY", label: "تغيير البطارية", startingFrom: "ابتداءً من 999 ج.م" },
  { value: "CHARGING", label: "الشحن / المنفذ", startingFrom: "ابتداءً من 799 ج.م" },
  { value: "CAMERA", label: "الكاميرا", startingFrom: "ابتداءً من 1,099 ج.م" },
  { value: "SPEAKER", label: "السماعة الخارجية", startingFrom: "ابتداءً من 699 ج.م" },
  { value: "MICROPHONE", label: "الميكروفون", startingFrom: "ابتداءً من 699 ج.م" },
  { value: "BACK_GLASS", label: "الزجاج الخلفي", startingFrom: "ابتداءً من 1,299 ج.م" },
  { value: "SOFTWARE", label: "برامج / تعليق", startingFrom: "ابتداءً من 499 ج.م" },
  { value: "WATER_DAMAGE", label: "تلف بسبب الماء", startingFrom: "ابتداءً من 1,799 ج.م" },
  { value: "BUTTONS", label: "الأزرار", startingFrom: "ابتداءً من 649 ج.م" },
  { value: "OTHER", label: "مشكلة أخرى", startingFrom: "السعر بعد التشخيص" },
] as const;

export const statusLabels: Record<string, { label: string; tone: string }> = {
  SUBMITTED: { label: "تم الاستلام", tone: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  UNDER_REVIEW: { label: "قيد المراجعة", tone: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  ASSIGNED: { label: "تم تحديد فني", tone: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300" },
  ON_THE_WAY: { label: "الفني في الطريق", tone: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300" },
  STARTED: { label: "الإصلاح جارٍ", tone: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  COMPLETED: { label: "تم الإصلاح", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  CANCELLED: { label: "ملغي", tone: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
};

export const repairStatusSteps = [
  { key: "SUBMITTED", label: "تم استلام الطلب" },
  { key: "UNDER_REVIEW", label: "المراجعة" },
  { key: "ASSIGNED", label: "تحديد الفني" },
  { key: "ON_THE_WAY", label: "في الطريق" },
  { key: "STARTED", label: "الإصلاح جارٍ" },
  { key: "COMPLETED", label: "تم الإنجاز" },
] as const;

export const machineStatusLabels: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "قيد الانتظار", tone: "bg-sky-100 text-sky-800" },
  CONFIRMED: { label: "مؤكد", tone: "bg-emerald-100 text-emerald-800" },
  PROCESSING: { label: "قيد التجهيز", tone: "bg-amber-100 text-amber-900" },
  SHIPPED: { label: "تم الشحن", tone: "bg-blue-100 text-blue-800" },
  DELIVERED: { label: "تم التوصيل", tone: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "ملغي", tone: "bg-red-100 text-red-800" },
};

export const formatCurrency = (n: number | string | { toString(): string }) => {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  return new Intl.NumberFormat("ar-EG-u-nu-latn", { style: "currency", currency: "EGP" }).format(v || 0);
};

export const formatDate = (iso: string) => {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  } catch {
    return iso;
  }
};

export const formatDateTime = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};