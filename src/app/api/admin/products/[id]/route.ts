import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  stock: z.number().int().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = schema.parse(await req.json());
    const product = await prisma.product.update({ where: { id }, data: body, select: { id: true, stock: true } });
    return NextResponse.json({ ok: true, product });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    console.error("product update error", e);
    return NextResponse.json({ error: "حصلت مشكلة" }, { status: 500 });
  }
}