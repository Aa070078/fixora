import "server-only";
import { prisma } from "@/lib/prisma";
import { statusLabels } from "@/lib/site";

type NotifyInput = {
  channel?: "SMS" | "EMAIL";
  recipient: string;
  subject?: string;
  body: string;
  refType?: "REPAIR" | "ORDER";
  refKey?: string;
};

/**
 * MVP notifications: records every outbound message and logs it.
 * Swap `deliver()` for a real SMS/email provider (Twilio, Resend, …) later.
 */
export async function notify(input: NotifyInput): Promise<void> {
  const record = await prisma.notification.create({
    data: {
      channel: input.channel ?? "SMS",
      recipient: input.recipient,
      subject: input.subject ?? null,
      body: input.body,
      refType: input.refType ?? null,
      refKey: input.refKey ?? null,
      status: "QUEUED",
    },
  });

  console.log(`[notify] ${record.channel} → ${record.recipient}: ${input.subject ? `${input.subject} — ` : ""}${input.body}`);

  try {
    // TODO(MVP-after): call provider (Twilio SMS / Resend email).
    await prisma.notification.update({
      where: { id: record.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (e) {
    await prisma.notification.update({
      where: { id: record.id },
      data: { status: "FAILED", providerError: e instanceof Error ? e.message : "unknown" },
    });
  }
}

export function repairStatusMessage(refNo: string, status: string, customerName: string): string {
  return `عزيزي ${customerName}، تحديث على طلب إصلاحك ${refNo}: ${statusLabels[status]?.label ?? status}. — فيكسورا`;
}

export function repairReceivedMessage(refNo: string, customerName: string): string {
  return `عزيزي ${customerName}، استلمنا طلب إصلاحك ${refNo} ونراجع خطواته، هنبعثلك التأكيد قريبًا. — فيكسورا`;
}

export function orderReceivedMessage(refNo: string, customerName: string, total: string): string {
  return `عزيزي ${customerName}، تم استلام طلبك ${refNo} بقيمة ${total} (الدفع عند الاستلام). — فيكسورا`;
}