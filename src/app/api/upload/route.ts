import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 4;

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`upload:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "كثرة الرفع، جرب بعد قليل" }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES);

  if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  const out: string[] = [];
  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, HEIC or GIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `"${file.name}" is larger than 8 MB` }, { status: 400 });
    }
    const name = `${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "uploads", "repairs");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, name);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    out.push(`/api/files/${name}`);
  }

  return NextResponse.json({ ok: true, urls: out });
}