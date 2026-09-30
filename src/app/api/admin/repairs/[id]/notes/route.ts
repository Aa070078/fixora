import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { noteSchema } from "@/lib/validators";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN", "TECHNICIAN");
    const { id } = await params;
    const { body } = noteSchema.parse(await req.json());
    const note = await prisma.adminNote.create({
      data: { repairRequestId: id, authorId: user.sub, body },
      include: { author: { select: { name: true, role: true } } },
    });
    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error("note error", e);
    return NextResponse.json({ error: "حصلت مشكلة" }, { status: 500 });
  }
}