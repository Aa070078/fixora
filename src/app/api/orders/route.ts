import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validators";
import { refFromDate } from "@/lib/ref";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { notify, orderReceivedMessage } from "@/lib/notify";
import { formatCurrency } from "@/lib/site";

export async function POST(req: Request) {
  try {
    const body = orderSchema.parse(await req.json());

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.id) }, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    for (const item of body.items) {
      const p = byId.get(item.id);
      if (!p) return NextResponse.json({ error: "منتج غير متوفر" }, { status: 400 });
      if (p.stock < item.qty) {
        return NextResponse.json({ error: `الكمية المتاحة من «${p.name}» أقل من المطلوب` }, { status: 400 });
      }
    }

    const subtotal = body.items.reduce((s, i) => s + Number(byId.get(i.id)!.price) * i.qty, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    let refNo = refFromDate();
    for (let i = 0; i < 5; i++) {
      const hit = await prisma.order.findUnique({ where: { refNo }, select: { id: true } });
      if (!hit) break;
      refNo = refFromDate();
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          refNo,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail ?? null,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2 ?? null,
          city: body.city,
          region: body.region ?? null,
          postalCode: body.postalCode ?? null,
          note: body.note ?? null,
          subtotal,
          deliveryFee,
          total,
          items: {
            create: body.items.map((i) => ({
              productId: i.id,
              productName: byId.get(i.id)!.name,
              quantity: i.qty,
              unitPrice: byId.get(i.id)!.price,
            })),
          },
        },
      });
      for (const i of body.items) {
        await tx.product.update({
          where: { id: i.id },
          data: { stock: { decrement: i.qty } },
        });
      }
      return created;
    });

    const sms = orderReceivedMessage(order.refNo, order.customerName, formatCurrency(order.total));
    await notify({ recipient: order.customerPhone, body: sms, refType: "ORDER", refKey: order.refNo });
    if (order.customerEmail) {
      await notify({
        channel: "EMAIL",
        recipient: order.customerEmail,
        subject: `تأكيد طلبك ${order.refNo} — فيكسورا`,
        body: sms,
        refType: "ORDER",
        refKey: order.refNo,
      });
    }

    return NextResponse.json({ ok: true, refNo: order.refNo }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "بيانات غير صحيحة" }, { status: 400 });
    }
    console.error("create order error", e);
    return NextResponse.json({ error: "حصلت مشكلة أثناء إنشاء الطلب" }, { status: 500 });
  }
}