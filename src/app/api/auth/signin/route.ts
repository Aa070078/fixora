import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validators";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function POST(req: Request) {
  if (!rateLimit(`signin:${clientKey(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "كثرة المحاولات، جرب بعد دقيقة" }, { status: 429 });
  }
  try {
    const body = signInSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (!user || !user.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await createSessionToken(user);
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("signin error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}