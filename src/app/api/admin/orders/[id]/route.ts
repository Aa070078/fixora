import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const { status } = schema.parse(await req.json());
    const order = await prisma.order.update({ where: { id }, data: { status }, select: { id: true, status: true } });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    console.error("order update error", e);
    return NextResponse.json({ error: "حصلت مشكلة" }, { status: 500 });
  }
}