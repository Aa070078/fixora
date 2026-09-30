import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="12" fill="oklch(0.5 0.115 186)" />
      <path
        d="M23.5 28v1.7c0 .9-.8 1.6-1.7 1.5a15.9 15.9 0 0 1-6.9-2.45 15.6 15.6 0 0 1-4.8-4.8 15.9 15.9 0 0 1-2.45-6.9c-.1-.9.6-1.7 1.5-1.7h1.7a2 2 0 0 1 2 1.4c.2.73.4 1.44.7 2.12a2 2 0 0 1-.36 1.7l-.52.65a12.8 12.8 0 0 0 4.8 4.8l.65-.52a2 2 0 0 1 1.7-.36 12.8 12.8 0 0 0 2.1.7 2 2 0 0 1 1.45 2Z"
        fill="white"
      />
      <path
        d="M27.4 11.2c0-.36.29-.65.65-.65H28.7c.36 0 .65.29.65.65v1.9h1.9c.36 0 .65.29.65.65v.65c0 .36-.29.65-.65.65h-1.9v1.9c0 .36-.29.65-.65.65h-.65a.65.65 0 0 1-.65-.65v-1.9h-1.9a.65.65 0 0 1-.65-.65v-.65c0-.36.29-.65.65-.65h1.9v-1.9Z"
        fill="oklch(0.93 0.02 186)"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-9" />
      <span className="text-[1.28rem] font-semibold tracking-tight text-foreground">Fixora</span>
    </span>
  );
}