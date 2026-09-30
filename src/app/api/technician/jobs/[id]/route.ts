import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { noteSchema, statusUpdateSchema } from "@/lib/validators";
import { notify, repairStatusMessage } from "@/lib/notify";

const techAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), ...statusUpdateSchema.shape }),
  z.object({ action: z.literal("note"), body: noteSchema.shape.body }),
  z.object({ action: z.literal("media"), urls: z.array(z.string().url()).min(1).max(4) }),
]);

const TECH_STATUSES = ["ON_THE_WAY", "STARTED", "COMPLETED", "CANCELLED"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("TECHNICIAN", "ADMIN");
    const { id } = await params;

    const repair = await prisma.repairRequest.findFirst({
      where: {
        id,
        ...(user.role === "TECHNICIAN" ? { assignedTechnicianId: user.sub } : {}),
      },
    });
    if (!repair) return NextResponse.json({ error: "الطلب غير موجود أو غير مسند إليك" }, { status: 404 });

    const body = techAction.parse(await req.json());

    if (body.action === "status") {
      if (user.role === "TECHNICIAN" && !(TECH_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: "الإجراء غير مسموح للفني" }, { status: 403 });
      }
      const updated = await prisma.$transaction([
        prisma.repairRequest.update({
          where: { id },
          data: {
            status: body.status,
            ...(body.status === "COMPLETED" ? { completedAt: new Date() } : {}),
          },
          select: { status: true },
        }),
        prisma.repairStatusHistory.create({
          data: {
            repairRequestId: id,
            fromStatus: repair.status as never,
            toStatus: body.status as never,
            note: body.note,
            createdById: user.sub,
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

    if (body.action === "note") {
      const note = await prisma.adminNote.create({
        data: { repairRequestId: id, authorId: user.sub, body: body.body },
        include: { author: { select: { name: true } } },
      });
      return NextResponse.json({ ok: true, note }, { status: 201 });
    }

    if (body.action === "media") {
      const created = await prisma.repairMedia.create({
        data: {
          repairRequestId: id,
          url: body.urls[0],
          caption: undefined as never,
          uploadedById: user.sub,
        },
      });
      return NextResponse.json({ ok: true, media: created }, { status: 201 });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "بيانات غير صحيحة" }, { status: 400 });
    }
    console.error("tech job action error", e);
    return NextResponse.json({ error: "حصلت مشكلة" }, { status: 500 });
  }
}