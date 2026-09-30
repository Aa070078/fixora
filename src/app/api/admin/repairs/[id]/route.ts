import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { assignSchema, priceSchema, statusUpdateSchema } from "@/lib/validators";
import { notify, repairStatusMessage } from "@/lib/notify";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), ...statusUpdateSchema.shape }),
  z.object({ action: z.literal("assign"), ...assignSchema.shape }),
  z.object({ action: z.literal("price"), ...priceSchema.shape }),
]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = actionSchema.parse(await req.json());

    const repair = await prisma.repairRequest.findUnique({ where: { id } });
    if (!repair) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    if (body.action === "status") {
      const data = {
        status: body.status,
        ...(body.status === "COMPLETED" ? { completedAt: new Date() } : {}),
        ...(body.status === "CANCELLED" ? { cancellationReason: body.note ?? repair.cancellationReason } : {}),
      };
      const updated = await prisma.$transaction([
        prisma.repairRequest.update({
          where: { id },
          data,
          select: { status: true },
        }),
        prisma.repairStatusHistory.create({
          data: {
            repairRequestId: id,
            fromStatus: repair.status as never,
            toStatus: body.status as never,
            note: body.note,
          },
        }),
      ]);
      await notify({
        recipient: repair.customerPhone,
        body: repairStatusMessage(repair.refNo, body.status, repair.customerName),
        refType: "REPAIR",
        refKey: repair.refNo,
      });
      return NextResponse.json({ ok: true, status: updated[0].status });
    }

    if (body.action === "assign") {
      const technician = await prisma.user.findFirst({
        where: { id: body.technicianId, role: "TECHNICIAN", active: true },
      });
      if (!technician) return NextResponse.json({ error: "الفني غير موجود" }, { status: 400 });

      const nextStatus = ["SUBMITTED", "UNDER_REVIEW"].includes(repair.status)
        ? ("ASSIGNED" as const)
        : repair.status;

      const data = {
        assignedTechnicianId: technician.id,
        technicianName: technician.name,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : repair.scheduledAt,
        ...(nextStatus !== repair.status ? { status: nextStatus } : {}),
      };

      const ops = [
        prisma.repairRequest.update({ where: { id }, data, select: { status: true } }),
        prisma.repairStatusHistory.create({
          data: {
            repairRequestId: id,
            fromStatus: repair.status as never,
            toStatus: nextStatus as never,
            note: `تم تعيين الفني ${technician.name}`,
          },
        }),
      ];
      const [updated] = (await prisma.$transaction(ops)) as [{ status: string }, unknown];
      await notify({
        recipient: repair.customerPhone,
        body: repairStatusMessage(repair.refNo, nextStatus as string, repair.customerName),
        refType: "REPAIR",
        refKey: repair.refNo,
      });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    if (body.action === "price") {
      const updated = await prisma.repairRequest.update({
        where: { id },
        data: {
          estimatedPrice: body.estimatedPrice,
          finalPrice: body.finalPrice,
        },
        select: { estimatedPrice: true, finalPrice: true },
      });
      return NextResponse.json({ ok: true, estimatedPrice: updated.estimatedPrice, finalPrice: updated.finalPrice });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "بيانات غير صحيحة" }, { status: 400 });
    }
    console.error("admin repair action error", e);
    return NextResponse.json({ error: "حصلت مشكلة" }, { status: 500 });
  }
}