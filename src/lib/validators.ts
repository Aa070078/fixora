import { z } from "zod";

const phoneRegex = /^[+\d][\d\s\-().]{6,19}$/;

const optionalId = z.union([z.string().trim().min(1), z.literal("").nullish()]).transform((v) => v || null);

export const signInSchema = z.object({
  email: z.email("اكتب إيميل صحيح"),
  password: z.string().min(1, "اكتب كلمة السر"),
});

export const repairRequestSchema = z.object({
  deviceBrandId: optionalId,
  deviceModelId: optionalId,
  deviceDescription: z.string().trim().min(1, "قولنا إيه الجهاز اللي عندك").max(300),
  issueCategory: z.string().min(1, "اختار العطل المناسب"),
  issueDescription: z.string().trim().min(10, "اوصف المشكلة في جملة أو اتنين").max(2000),
  media: z.array(z.string().url()).max(4, "الحد الأقصى 4 صور"),
  customerName: z.string().trim().min(2, "اكتب اسمك").max(100),
  customerPhone: z.string().regex(phoneRegex, "اكتب رقم موبايل صحيح"),
  customerEmail: z
    .union([z.email("اكتب إيميل صحيح"), z.literal("")])
    .nullish()
    .transform((v) => v || null),
  addressLine1: z.string().trim().min(5, "اكتب عنوان الشارع").max(200),
  addressLine2: z.string().trim().max(200).nullish().transform((v) => v || null),
  city: z.string().trim().min(2, "اكتب اسم المدينة").max(100),
  region: z.string().trim().max(100).nullish().transform((v) => v || null),
  postalCode: z.string().trim().max(20).nullish().transform((v) => v || null),
  lat: z.number().min(-90).max(90).nullish(),
  lng: z.number().min(-180).max(180).nullish(),
  locationLabel: z.string().trim().max(200).nullish().transform((v) => v || null),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "اختار اليوم")
    .nullish(),
  preferredTimeSlot: z
    .string()
    .trim()
    .max(50)
    .nullish()
    .transform((v) => v || null),
});

export const contactSchema = z.object({
  customerName: z.string().trim().min(2, "اكتب اسمك").max(100),
  customerPhone: z.string().regex(phoneRegex, "اكتب رقم موبايل صحيح"),
  customerEmail: z.union([z.email("اكتب إيميل صحيح"), z.literal("")]).optional(),
});

export const addressSchema = z.object({
  addressLine1: z.string().trim().min(5, "اكتب عنوان الشارع").max(200),
  addressLine2: z.string().trim().max(200).nullish().transform((v) => v || null),
  city: z.string().trim().min(2, "اكتب اسم المدينة").max(100),
  region: z.string().trim().max(100).nullish().transform((v) => v || null),
  postalCode: z.string().trim().max(20).nullish().transform((v) => v || null),
  locationLabel: z.string().trim().max(200).nullish().transform((v) => v || null),
});

export const noteSchema = z.object({
  body: z.string().trim().min(1, "ملاحظة مش ممكن تكون فاضية").max(2000),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "ON_THE_WAY", "STARTED", "COMPLETED", "CANCELLED"]),
  note: z.string().trim().max(1000).optional(),
});

export const assignSchema = z.object({
  technicianId: z.string().trim().min(1),
  scheduledAt: z.string().datetime().nullish().transform((v) => v || null),
});

export const priceSchema = z.object({
  estimatedPrice: z.union([z.coerce.number().min(0), z.null()]),
  finalPrice: z.union([z.coerce.number().min(0), z.null()]),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().min(1).max(99),
      })
    )
    .min(1, "السلة فاضية"),
  deliveryFee: z.number().min(0).default(0),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().regex(phoneRegex, "اكتب رقم موبايل صحيح"),
  customerEmail: z
    .union([z.email(), z.literal("")])
    .nullish()
    .transform((v) => v || null),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).nullish().transform((v) => v || null),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().max(100).nullish().transform((v) => v || null),
  postalCode: z.string().trim().max(20).nullish().transform((v) => v || null),
  note: z.string().trim().max(500).nullish().transform((v) => v || null),
});