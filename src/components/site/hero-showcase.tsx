"use client";

import Image from "next/image";
import { CheckCheck, MapPin, ShieldCheck, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { IMG } from "@/lib/images";
import { reducedMotion } from "@/components/site/motion";

export function HeroShowcase() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const badgeA = useRef<HTMLDivElement>(null);
  const badgeB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;

    if (reducedMotion()) {
      card.style.opacity = "1";
      if (badgeA.current) badgeA.current.style.opacity = "1";
      if (badgeB.current) badgeB.current.style.opacity = "1";
      return;
    }

    gsap.fromTo(card, { y: 44, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.95, ease: "power3.out", delay: 0.25 });
    gsap.fromTo(
      [badgeA.current, badgeB.current],
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.15, delay: 0.7 }
    );

    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rotX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const rotY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const tx = gsap.quickTo(card, "x", { duration: 0.6, ease: "power3.out" });
    const ty = gsap.quickTo(card, "y", { duration: 0.6, ease: "power3.out" });
    const ax = gsap.quickTo(badgeA.current!, "x", { duration: 1, ease: "power3.out" });
    const ay = gsap.quickTo(badgeA.current!, "y", { duration: 1, ease: "power3.out" });
    const bx = gsap.quickTo(badgeB.current!, "x", { duration: 1.2, ease: "power3.out" });
    const by = gsap.quickTo(badgeB.current!, "y", { duration: 1.2, ease: "power3.out" });
    const glare = glareRef.current!;

    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      glare.style.opacity = "1";
      glare.style.setProperty("--mx", `${mx}px`);
      glare.style.setProperty("--my", `${my}px`);

      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      rotY(nx * 12);
      rotX(-ny * 9);
      tx(nx * 8);
      ty(ny * 6);
      ax(nx * -22);
      ay(ny * -16);
      bx(nx * 18);
      by(ny * 14);
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
      tx(0);
      ty(0);
      ax(0);
      ay(0);
      bx(0);
      by(0);
      glare.style.opacity = "0";
    };
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerleave", onLeave);
    return () => {
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={sceneRef} className="relative mx-auto w-full max-w-md lg:max-w-none" style={{ perspective: "900px" }}>
      {/* Ambient lights */}
      <div className="orb orb-a -start-12 -top-12 -z-10 size-80 bg-primary/25" aria-hidden="true" />
      <div className="orb orb-b top-1/3 -end-10 -z-10 size-80 bg-accent/70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[90px]"
        aria-hidden="true"
      />

      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-28px_rgb(0,0,0,0.35)] will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div ref={imageRef} style={{ transform: "translateZ(-14px)" }} className="will-change-transform">
          <Image
            src={IMG.repairTech}
            alt="فني معتمد يصلّح موبايل"
            width={800}
            height={980}
            priority
            className="pointer-events-none aspect-[4/4.9] w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Cursor glare */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background: "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.22), transparent 55%)",
            transform: "translateZ(20px)",
          }}
          aria-hidden="true"
        />

        <span
          ref={chipRef}
          className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold text-card-foreground backdrop-blur will-change-transform"
          style={{ transform: "translateZ(36px)" }}
        >
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          4.9 · فنيين معتمدين
        </span>

        <div
          ref={infoRef}
          className="absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-4 backdrop-blur will-change-transform text-card-foreground"
          style={{ transform: "translateZ(48px)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">الفني في الطريق إليك</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 text-primary" />
                  بيتك · القاهرة
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-sm font-bold text-primary" dir="ltr">
                14 دقيقة
              </p>
              <p className="text-[11px] text-muted-foreground">وقت الوصول</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div
        ref={badgeA}
        className="absolute -start-4 top-1/3 hidden items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-[0_14px_30px_-14px_rgb(0,0,0,0.25)] will-change-transform sm:flex"
        style={{ transformStyle: "preserve-3d" }}
      >
        <ShieldCheck className="size-5 text-primary" />
        <span className="text-xs font-semibold">ضمان 90 يوم</span>
      </div>
      <div
        ref={badgeB}
        className="absolute -end-3 bottom-24 hidden items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-[0_14px_30px_-14px_rgb(0,0,0,0.25)] will-change-transform sm:flex"
        style={{ transformStyle: "preserve-3d" }}
      >
        <CheckCheck className="size-5 text-success" />
        <span className="text-xs font-semibold">مفيش إصلاح مفيش فلوس</span>
      </div>
    </div>
  );
}