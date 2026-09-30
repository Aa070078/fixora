# فيكسورا — Fixora

منصة متكاملة لإصلاح الموبايل في المنزل، وقطع الغيار والاكسسوارات — بواجهة عربية RTL وتصميم عصري.

All-in-one platform for at-home phone repair, spare parts & accessories — Arabic-first RTL, modern UI.

## المزايا / Features

- **إصلاح في المنزل:** حجز خلال دقيقتين (الجهاز اختياري + وصف حر)، صور، عنوان، موعد، تتبع حالة مباشر.
- **لوحة تحكم المشرف:** طلبات الإصلاح، تعيين فني، تحديث الحالة، الأسعار، ملاحظات، تقرير 14 يوم، إشعارات، منتجات ومخزون وطلبات المتجر.
- **تطبيق الفني (PWA):** مهامي، تفاصيل المهمة، البدء/الإنجاز، ملاحظات وصور، رابط الخريطة.
- **المتجر:** تصفح/بحث/فلترة، سلة، إتمام طلب (الدفع عند الاستلام)، تأكيد الطلب وخصم المخزون.
- **إشعارات:** نموذج SMS/Email يسجل كل رسالة في قاعدة البيانات (الربط بمزود لاحقًا).

## التقنية / Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma 7 + PostgreSQL 16 (Docker)
- JWT sessions (jose) · Zod validation · rate limiting
- GSAP (scroll/3D interactions) · Arabic RTL · light/dark themes

## التشغيل محليًا / Run locally

```bash
# 1) PostgreSQL في Docker
docker run -d --name fixora-pg -e POSTGRES_PASSWORD=fixora_dev -e POSTGRES_USER=fixora -e POSTGRES_DB=fixora -p 5433:5432 -v fixora-pgdata:/var/lib/postgresql/data postgres:16-alpine

# 2) المتغيرات
#   .env  →  DATABASE_URL="postgresql://fixora:fixora_dev@localhost:5433/fixora"
#           AUTH_SECRET="..."

# 3) الاعتماديات والقاعدة والبيانات التجريبية
npm install
npx prisma migrate deploy
npx tsx prisma/seed.ts

# 4) التشغيل
npm run dev        # http://localhost:3000
```

حسابات تجريبية / Demo logins — `admin@fixora.com` · `Fixora@123` (مشرف) · `omar@fixora.com` (فني).

اختبار شامل / E2E: `node scripts/e2e.mjs` (يتطلب Chrome).