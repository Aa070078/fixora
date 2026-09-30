import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  gif: "image/gif",
};

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|heic|gif)$/.test(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ext = name.split(".").pop()!;
  const base = path.join(process.cwd(), "uploads", "repairs");
  const filePath = path.normalize(path.join(base, name));
  if (!filePath.startsWith(path.normalize(base))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}