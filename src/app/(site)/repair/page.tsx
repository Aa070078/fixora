import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Timer,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IMG } from "@/lib/images";
import { issueOptions, site } from "@/lib/site";
import { Reveal, RevealGroup } from "@/components/site/motion";

const ISSUE_EMOJI: Record<string, string> = {
  SCREEN: "🖥️",
  BATTERY: "🔋",
  CHARGING: "⚡",
  CAMERA: "📷",
  SPEAKER: "🔊",
  MICROPHONE: "🎙️",
  BACK_GLASS: "🔲",
  SOFTWARE: "🧠",
  WATER_DAMAGE: "💧",
  BUTTONS: "⌨️",
  OTHER: "🛠️",
};

const AFTER_BOOKING = [
  {
    icon: CalendarCheck2,
    title: "بنأكد موعدك",
    body: "الفريق بيراجع طلبك وبيبعتهولك تأكيد بالموعد في خلال دقايق.",
  },
  {
    icon: UserRoundCheck,
    title: "فني معتمد بيتحدد",
    body: "فني موثوق وعنده القطع المناسبة لجهازك بيتحجز ليك.",
  },
  {
    icon: Timer,
    title: "بتتبع الإصلاح مباشرة",
    body: "تابع كل مرحلة — استلام، في الطريق، جاري الإصلاح، تم.",
  },
  {
    icon: ShieldCheck,
    title: "تتدفع لما يخلص",
    body: "متوقع تضربش الدرج إلا وانت راضي. كل إصلاح عليه ضمان 90 يوم.",
  },
];

const GUARANTEES = [
  ["قطع أصلية", "مكونات ممتازة مع ضمان خطي"],
  ["مفيش إصلاح مفيش فلوس", "لو منقدرش نصلحه، ما تدفعش"],
  ["عرض سعر شفاف", "سعر واضح قبل أي شغل"],
  ["فنيين موثوقين", "فحص خلفيات، معتمدين ومؤمنين"],
];

export default function RepairLandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="orb orb-a -top-20 end-[-8%] size-[28rem] bg-[rgba(14,140,137,0.5)]" aria-hidden="true" />
        <div className="orb orb-c bottom-[-6%] start-[-8%] size-[30rem] bg-[rgba(125,211,197,0.8)]" aria-hidden="true" />
        <div className="orb orb-b top-1/2 start-[20%] size-[20rem] bg-[rgba(251,191,36,0.35)]" aria-hidden="true" />
        <div className="container-site grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
              <Clock className="size-4" />
              خدمة بنفس اليوم · مفتوح يوميًا 9 ص – 9 م
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.12] tracking-tight sm:max-w-xl sm:text-5xl">
              إصلاحات بتوصلك <span className="text-gradient">لسكة بيتك</span>
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              شاشة مكسورة؟ بطارية بتروح بسرعة؟ مية دخلت الجهاز؟ بنجيب المحل ليك — بقطع أصلية وسعر
              محدد قبل ما نبدأ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/book">
                  احجز إصلاحًا
                  <ArrowRight className="flip-rtl" data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <a href={`tel:${site.phone}`}>
                  <Phone data-icon="inline-start" />
                  اسألنا الأول
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" /> 4.9 · أكثر من 2,300 تقييم
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Timer className="size-4 text-primary" /> أغلب الزيارات أقل من ساعة
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> ضمان 90 يوم
              </span>
            </div>
          </div>

          <Reveal y={40}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl border border-border shadow-[0_30px_80px_-24px_rgb(0,0,0,0.3)]">
                <Image
                  src={IMG.repairTech}
                  alt="فني يقوم بإصلاح موبايل"
                  width={800}
                  height={800}
                  className="aspect-[4/4.4] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between rounded-2xl bg-white/90 p-3.5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">الفني في الطريق</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">Eta · 14 min</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    سعر مؤكد
                  </span>
                </div>
              </div>
              <div className="absolute -start-3 top-8 hidden items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-lg sm:flex">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-xs font-semibold">ضمان 90 يوم</span>
              </div>
              <div className="absolute -end-4 bottom-24 hidden items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-lg sm:flex">
                <MapPin className="size-4 text-primary" />
                <span className="text-xs font-semibold">في بيتك</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ISSUES */}
      <section className="container-site py-16 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">إيه اللي بنصلحه؟</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              كل اللي ممكن يبوظ في الموبايل .. إحنا بنصلحه
            </h2>
            <p className="mt-3 text-muted-foreground">
              مش لاقي عطلتك أو مش عارف الموديل؟ الوصف كفاية — احنا هنتكفل بالباقي.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {issueOptions.map((issue) => (
            <Link
              key={issue.value}
              href={`/book?issue=${issue.value}`}
              data-reveal
              className="tilt-card group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[0_12px_30px_-16px_rgb(14,140,137,0.4)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">
                {ISSUE_EMOJI[issue.value]}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{issue.label}</span>
                <span className="block text-sm text-muted-foreground">{issue.startingFrom}</span>
              </span>
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="flip-rtl size-4" />
              </span>
            </Link>
          ))}

          <div
            data-reveal
            className="flex items-center gap-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">مش متأكد إيه المشكلة؟</span>
              <span className="block text-sm text-muted-foreground">اوصف العطل وإحنا نشخّصه على الطبيعة.</span>
            </span>
          </div>
        </RevealGroup>
      </section>

      {/* AFTER BOOKING */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="container-site">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">واضح وبسيط</p>
              <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                إيه اللي بيحصل بعد ما تحجز
              </h2>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {AFTER_BOOKING.map((s, i) => (
              <Card key={s.title} data-reveal className="tilt-card relative overflow-hidden p-6">
                <span className="pointer-events-none absolute -end-2 -top-5 text-[5rem] font-semibold leading-none text-primary/10">
                  {i + 1}
                </span>
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* GUARANTEES */}
      <section className="container-site py-16 sm:py-24">
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {GUARANTEES.map(([title, body]) => (
            <div key={title} data-reveal className="tilt-card rounded-2xl border border-border bg-card p-6">
              <BadgeCheck className="size-6 text-primary" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </RevealGroup>

        <Reveal className="mt-14">
          <div className="grid items-center gap-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/40 p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                سيبك من المحل وانتظار الدور
              </h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                احجز في الدقيقتين الجايين. قولنا عن جهازك قد ما تعرف — وإحنا هنكمل الباقي.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/book">
                    احجز إصلاحًا
                    <ArrowRight className="flip-rtl" data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                  <a href={`tel:${site.phone}`}>
                    <Phone data-icon="inline-start" />
                    {site.phoneDisplay}
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative hidden aspect-[4/3] lg:block">
              <Image
                src={IMG.fixingPhone}
                alt="إصلاح موبايل"
                fill
                sizes="(max-width: 1024px) 0px, 480px"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}