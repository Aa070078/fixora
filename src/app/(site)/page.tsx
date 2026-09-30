import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BatteryCharging,
  Camera,
  CheckCheck,
  Clock,
  Cpu,
  Droplets,
  Headphones,
  Layers,
  MapPin,
  Mic,
  MousePointerClick,
  Phone,
  Quote,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { IMG } from "@/lib/images";
import { issueOptions, site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import { HeroShowcase } from "@/components/site/hero-showcase";
import { CountUp, Reveal, RevealGroup } from "@/components/site/motion";

type LucideIcon = typeof Smartphone;

const ISSUE_ICONS: Record<string, LucideIcon> = {
  SCREEN: Smartphone,
  BATTERY: BatteryCharging,
  CHARGING: Zap,
  CAMERA: Camera,
  SPEAKER: Volume2,
  MICROPHONE: Mic,
  BACK_GLASS: Layers,
  SOFTWARE: Cpu,
  WATER_DAMAGE: Droplets,
  BUTTONS: MousePointerClick,
  OTHER: Wrench,
};

const STEPS = [
  {
    title: "احجز خلال دقيقتين",
    body: "حَدِّد جهازك ووصف المشكلة. مفيش مشكلة لو مش فاكر الموديل بالظبط.",
  },
  {
    title: "نحددلك فني معتمد",
    body: "فني معتمد وموثوق بييجي في الموعد اللي يناسبك.",
  },
  {
    title: "الإصلاح في مكانك",
    body: "قطع أصلية وتركيب في البيت أو الشغل — غالبًا خلال ساعة.",
  },
  {
    title: "افحص واتأكد بنفسك",
    body: "كل إصلاح عليه ضمان 90 يوم. تدفع بس لما تبقي راضي.",
  },
];

const BENTO: { value: string; span?: string; featured?: boolean }[] = [
  { value: "SCREEN", span: "lg:col-span-2", featured: true },
  { value: "BATTERY", span: "lg:col-span-2", featured: true },
  { value: "CAMERA" },
  { value: "CHARGING" },
  { value: "WATER_DAMAGE" },
  { value: "SPEAKER" },
  { value: "SOFTWARE" },
  { value: "BACK_GLASS" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "قطع أصلية",
    body: "مكونات عالية الجودة مع ضمان خطي على كل إصلاح.",
  },
  {
    icon: Star,
    title: "سعر واضح قبل الشغل",
    body: "عرض سعر محدد قبل ما الفني يبدأ. مفيش مفاجآت.",
  },
  {
    icon: MapPin,
    title: "احنا اللي جاينلك",
    body: "فني موثوق يوصلك في البيت أو الشغل في الوقت اللي يناسبك.",
  },
];

const TESTIMONIALS = [
  {
    name: "سارة م.",
    place: "شاشة مكسورة · آيفون 14",
    quote: "حجزت الساعة 10 والإصلاح خلص الساعة 12. الفني كان في الميعاد بالظبط والشاشة بقت جديدة.",
  },
  {
    name: "عمر ك.",
    place: "بطارية · جالاكسي S23",
    quote: "مكنتش عارف موديل الموبايل بالظبط، وده مفرقش حاجة. وصفت الموبايل وهما سهلوا كل حاجة.",
  },
  {
    name: "منى ل.",
    place: "تلف ماء · بيكسل 8",
    quote: "كنت متأكدة إن الموبايل خلاص. أنقذوا كل البيانات وشرحولي كل خطوة عملوها.",
  },
];

const FAQS = [
  {
    q: "الفني بيوصلك بسرعة إزاي؟",
    a: "معظم الإصلاحات بتتخلص نفس اليوم. لما تحجز بتختار الفترة المناسبة ليك ونأكدلك الفني فورًا.",
  },
  {
    q: "هل لازم أعرف موديل الموبايل بالظبط؟",
    a: "لا خالص. لو مش عارف الموديل، مجرد وصف الجهاز كفاية — زي إنه سامسونج أو آيفون بحجم معين. إحنا بنجهز الباقي.",
  },
  {
    q: "الإصلاح بيتكلف كام؟",
    a: "هتوصل بعرض سعر واضح قبل ما أي شغل يبدأ. الأسعار بتعتمد على الجهاز والعطل، وكثير من الإصلاحات بتبدأ من 299 ج.م.",
  },
  {
    q: "الإصلاح بيحصل في بيتي فعلاً؟",
    a: "أيوه، دي الفكرة. فني معتمد بيوصلك بالقطع اللازمة وبيصلح في المكان. أغلب الزيارات بتاخد أقل من ساعة.",
  },
  {
    q: "إيه هو الضمان؟",
    a: "كل إصلاح عليه ضمان 90 يوم على القطع والشغل. لو المشكلة رجعت، نرجع نصلحها مجانًا.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    take: 4,
    orderBy: { featured: "desc" },
    include: { category: true },
  });

  const featured: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.imageUrls[0] ?? null,
    price: Number(p.price),
    compareAt: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }));

  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="orb orb-a -top-24 start-[-10%] size-[30rem] bg-[rgba(14,140,137,0.5)]" aria-hidden="true" />
        <div className="orb orb-b top-16 end-[-12%] size-[34rem] bg-[rgba(125,211,197,0.8)]" aria-hidden="true" />
        <div className="orb orb-c bottom-[-8%] start-[30%] size-[26rem] bg-[rgba(251,191,36,0.4)]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(1000px 600px at 82% -8%, oklch(0.85 0.09 190 / 0.55), transparent 60%), radial-gradient(820px 460px at 6% 42%, oklch(0.9 0.1 75 / 0.5), transparent 62%)",
          }}
          aria-hidden="true"
        />

        <div className="container-site relative z-10 grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              إصلاح بنفس اليوم .. عند باب بيتك
              <span className="hidden items-center gap-1 text-muted-foreground sm:inline-flex">
                · <Star className="size-3.5 fill-amber-400 text-amber-400" /> 4.9 تقييم
              </span>
            </div>

            <h1 className="mt-5 max-w-xl text-balance text-[2.6rem] font-bold leading-[1.16] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              موبايلك بيتصلح
              <span className="block text-gradient">… وأنت في مكانك</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              شاشة مكسورة؟ بطارية ضعيفة؟ مية دخلت الموبايل؟ سيبك من المحل — فني معتمد يوصلك بقطع
              أصلية في الوقت اللي انتا تحبّه.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/book">
                  احجز إصلاحًا
                  <ArrowRight className="flip-rtl" data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link href="/shop">تسوق اكسسوارات</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCheck className="size-4 text-primary" /> مفيش إصلاح، مفيش فلوس
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> ضمان 90 يوم
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-primary" /> متوسط الزيارة ساعة
              </span>
            </div>
          </div>

          <HeroShowcase />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/70 bg-card/60 backdrop-blur">
        <Reveal className="container-site grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {[
            { to: 12500, suffix: "+", label: "إصلاح تم بنجاح" },
            { to: 4.9, suffix: " / 5", label: "متوسط التقييم", decimal: true },
            { to: 90, suffix: " يوم", label: "ضمان على كل إصلاح" },
            { to: 1, suffix: " ساعة", label: "متوسط مدة الزيارة" },
          ].map((s) => (
            <div key={s.label} className="text-center sm:text-start">
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <CountUp to={s.to} suffix={s.suffix} decimal={s.decimal} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* SERVICES BENTO */}
      <section className="container-site py-16 sm:py-24" id="repair">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">خدمات الإصلاح</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              إيه اللي نقدر نصلحه النهارده؟
            </h2>
            <p className="mt-3 text-muted-foreground">
              الأسعار المعلنة للبداية. اختار العطل أو وصفه بكلمتك — مفيش مشكلة لو مش عارف الموديل.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {BENTO.map((item) => {
            const issue = issueOptions.find((i) => i.value === item.value)!;
            const Icon = ISSUE_ICONS[item.value];
            const big = !!item.featured;
            return (
              <Link
                key={item.value}
                href={`/book?issue=${item.value}`}
                data-reveal
                className={cn(
                  "tilt-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[0_16px_40px_-18px_rgb(14,140,137,0.4)] sm:p-6",
                  big && "bg-gradient-to-br from-card to-accent/40",
                  item.span
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-2xl text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground",
                    big ? "size-12" : "size-10"
                  )}
                >
                  <Icon className={big ? "size-6" : "size-5"} />
                </span>
                <span className={cn("font-semibold leading-snug", big ? "mt-4 text-lg" : "mt-3")}>
                  {issue.label}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">{issue.startingFrom}</span>
                <ArrowRight className="flip-rtl absolute end-4 top-5 size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-[-3px] group-hover:text-primary group-hover:opacity-100" />
              </Link>
            );
          })}

          <Link
            href="/book"
            data-reveal
            className="tilt-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Wrench className="size-5" />
              </span>
              <span className="font-semibold">مش عارف المشكلة؟</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">اوصف العطل وإحنا نشخّصه في المكان.</p>
            <span className="mt-4 text-sm font-semibold text-primary">احجز مجانًا ←</span>
          </Link>
        </RevealGroup>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="container-site">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">ازاي بيشتغل</p>
              <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                خطوات بسيطة .. والموبايل يرجع شغال
              </h2>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {STEPS.map((s, i) => (
              <Card key={s.title} data-reveal className="tilt-card relative overflow-hidden p-6">
                <span className="pointer-events-none absolute -end-2 -top-5 text-[5.5rem] font-semibold leading-none text-primary/10">
                  {i + 1}
                </span>
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="container-site py-16 sm:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">اكسسوارات</p>
              <h2 className="mt-2 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                منتجات عملاؤنا بيحبوها
              </h2>
            </Reveal>
            <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
              <Link href="/shop">
                كل المنتجات
                <ArrowRight className="flip-rtl" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 lg:grid-cols-4" stagger={0.08}>
            {featured.map((p, i) => (
              <div key={p.id} data-reveal className="tilt-card">
                <ProductCard product={p} priority={i < 2} />
              </div>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* VALUES */}
      <section className="container-site pb-16 sm:pb-24">
        <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.1}>
          {VALUES.map((v) => (
            <Card key={v.title} data-reveal className="tilt-card p-7">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <v.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </RevealGroup>
      </section>

      {/* CTA BAND */}
      <section className="container-site pb-16 sm:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary dark:border dark:border-primary/40">
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
              <div className="relative z-10 px-6 py-14 text-primary-foreground sm:px-12">
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(600px 300px at 15% 0%, white, transparent 60%)",
                  }}
                />
                <h2 className="relative max-w-lg text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  سيبك من المحل.. وإصلح من بيتك
                </h2>
                <p className="relative mt-3 max-w-md text-primary-foreground/90">
                  احجز خلال دقيقتين واعرف السعر قبل ما نبدأ أي شغل.
                </p>
                <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 bg-primary-foreground px-6 text-base text-primary hover:bg-white"
                  >
                    <Link href="/book">
                      احجز إصلاحًا
                      <ArrowRight className="flip-rtl" data-icon="inline-end" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border-primary-foreground/30 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <a href="tel:+201000000000">اتصل بينا</a>
                  </Button>
                </div>
              </div>
              <div className="relative hidden h-72 lg:block">
                <Image
                  src={IMG.brokenPhones}
                  alt="أدوات إصلاح موبايلات"
                  fill
                  sizes="(max-width: 1024px) 0px, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-site pb-16 sm:pb-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">آراء</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              جيرانك بيثقوا في فيكسورا
            </h2>
          </div>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.1}>
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} data-reveal className="flex flex-col p-6">
              <Quote className="size-6 text-primary/40" />
              <p className="mt-4 leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent font-semibold text-primary">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.place}</p>
                </div>
                <div className="ms-auto flex text-amber-400" aria-label="5 نجوم">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </RevealGroup>
      </section>

      {/* FAQ */}
      <section className="container-site pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">أسئلة شائعة</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              عندك سؤال؟ إحنا جاوبنالك
            </h2>
            <p className="mt-3 text-muted-foreground">
              لو سؤالك مش موجود هنا، فريق الدعم متاح يوميًا من 9 ص لـ 9 م.
            </p>
            <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/30 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Headphones className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">كلم الدعم مباشرة</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {site.phoneDisplay}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                اطلب منا أي حاجة وانت قاعد في مكانك — إحنا بنهتم بالتوقيت والتفاصيل ليك.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={`tel:${site.phone}`}>
                  <Phone data-icon="inline-start" />
                  احجز مكالمة سريعة
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="group">
                  <AccordionTrigger className="flex-1 text-start">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}