import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { repairRequestSchema } from "@/lib/validators";
import { refFromDate, trackingToken } from "@/lib/ref";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { notify, repairReceivedMessage } from "@/lib/notify";
import { ZodError } from "zod";

export async function POST(req: Request) {
  if (!rateLimit(`repair:${clientKey(req)}`, 12, 60_000)) {
    return NextResponse.json({ error: "كثرة الطلبات، جرب بعد قليل" }, { status: 429 });
  }
  try {
    const body = repairRequestSchema.parse(await req.json());

    let refNo = refFromDate();
    let token = trackingToken();
    for (let i = 0; i < 5; i++) {
      const [refHit, tokenHit] = await Promise.all([
        prisma.repairRequest.findUnique({ where: { refNo }, select: { id: true } }),
        prisma.repairRequest.findUnique({ where: { trackingToken: token }, select: { id: true } }),
      ]);
      if (!refHit && !tokenHit) break;
      refNo = refFromDate();
      token = trackingToken();
    }

    const data = {
      refNo,
      trackingToken: token,
      deviceBrandId: body.deviceBrandId ?? null,
      deviceModelId: body.deviceModelId ?? null,
      deviceDescription: body.deviceDescription,
      issueCategory: body.issueCategory as never,
      issueDescription: body.issueDescription,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail ?? null,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2 ?? null,
      city: body.city,
      region: body.region ?? null,
      postalCode: body.postalCode ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      locationLabel: body.locationLabel ?? null,
      preferredDate: body.preferredDate ?? null,
      preferredTimeSlot: body.preferredTimeSlot ?? null,
      media: body.media.length
        ? { create: body.media.map((url) => ({ url })) }
        : undefined,
    };

    const created = await prisma.repairRequest.create({ data });

    const sms = repairReceivedMessage(created.refNo, created.customerName);
    await notify({ recipient: created.customerPhone, body: sms, refType: "REPAIR", refKey: created.refNo });
    if (created.customerEmail) {
      await notify({
        channel: "EMAIL",
        recipient: created.customerEmail,
        subject: `طلــب الإصلاح ${created.refNo} — فيكسورا`,
        body: sms,
        refType: "REPAIR",
        refKey: created.refNo,
      });
    }

    return NextResponse.json(
      { ok: true, id: created.id, refNo: created.refNo, trackingToken: created.trackingToken },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: e.issues[0]?.message ?? "Please fix the highlighted fields." },
        { status: 400 }
      );
    }
    console.error("create repair request error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}