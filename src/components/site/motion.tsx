"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function reducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fade-up reveal for standalone sections. */
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [y, delay]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}

/** Reveals & staggers all `[data-reveal]` children when the group scrolls into view. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (items.length === 0) return;
    if (reducedMotion()) {
      items.forEach((i) => {
        i.style.opacity = "1";
        i.style.transform = "none";
      });
      return;
    }
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [stagger, y]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}

/** Animated number count-up when scrolled into view. */
export function CountUp({
  to,
  suffix = "",
  duration = 1.6,
  className,
  decimal = false,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
  decimal?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) =>
      decimal ? v.toFixed(1) : Math.round(v).toLocaleString("en-US");
    if (reducedMotion()) {
      el.textContent = `${fmt(to)}${suffix}`;
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: to,
      duration,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = `${fmt(obj.v)}${suffix}`;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [to, suffix, duration, decimal]);

  return <span ref={ref} className={className} aria-label={`${to}${suffix}`} />;
}