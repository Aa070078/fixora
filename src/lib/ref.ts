import { randomBytes, randomUUID } from "crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function randRef(prefix = "FX"): string {
  let s = "";
  const bytes = randomBytes(5);
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${s}`;
}

export function refFromDate(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}-${randRef("X").slice(3)}`;
}

export function trackingToken(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
}