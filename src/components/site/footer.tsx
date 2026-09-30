import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-site py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.tagline} فنيون معتمدون، قطع أصلية، وضمان 90 يوم على كل إصلاح.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5" dir="ltr">
                <Phone className="size-4 text-primary" /> {site.phoneDisplay}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-4 text-primary" /> {site.email}
              </span>
            </div>
          </div>

          <FooterCol
            title="الخدمات"
            links={[
              { label: "إصلاح الشاشة", href: "/repair?issue=SCREEN" },
              { label: "تغيير البطارية", href: "/repair?issue=BATTERY" },
              { label: "إصلاح الكاميرا", href: "/repair?issue=CAMERA" },
              { label: "احجز إصلاحًا", href: "/book" },
            ]}
          />
          <FooterCol
            title="المتجر"
            links={[
              { label: "الحمايات والأغطية", href: "/shop?cat=cases" },
              { label: "شواحن وكابلات", href: "/shop?cat=chargers-cables" },
              { label: "الطاقة المحمولة", href: "/shop?cat=power-banks" },
              { label: "الصوتيات", href: "/shop?cat=audio" },
            ]}
          />
          <FooterCol
            title="الشركة"
            links={[
              { label: "تتبع إصلاحك", href: "/track" },
              { label: "ليه تختار فيكسورا", href: "/repair" },
              { label: "تواصل مع الدعم", href: "mailto:support@fixora.com" },
            ]}
          />
        </div>

        <div className="mt-10 grid gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> ضمان 90 يوم على الإصلاحات
          </span>
          <span className="inline-flex items-center gap-2">
            <Truck className="size-4 text-primary" /> في البيت أو الشغل أو أي مكان
          </span>
          <span className="inline-flex items-center gap-2">
            <RotateCcw className="size-4 text-primary" /> إعادة فحص مجانية خلال 30 يوم
          </span>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} فيكسورا. جميع الحقوق محفوظة. إصلاحات بواسطة فنيين معتمدين.</p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" /> نخدم مدينتك يوميًا من 9 ص إلى 9 م
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}