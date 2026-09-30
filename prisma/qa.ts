import "dotenv/config";
import { writeFile } from "fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === "techs") {
    const techs = await prisma.user.findMany({ where: { role: "TECHNICIAN" }, select: { id: true, name: true, email: true } });
    console.log(JSON.stringify(techs, null, 2));
  } else if (cmd === "request") {
    const req = await prisma.repairRequest.findFirst({ include: { statusHistory: true, notes: true, media: true } });
    console.log(
      JSON.stringify(
        {
          id: req?.id,
          refNo: req?.refNo,
          status: req?.status,
          assignedTech: req?.assignedTechnicianId,
          est: req?.estimatedPrice?.toString(),
          final: req?.finalPrice?.toString(),
          history: req?.statusHistory.map((h) => ({ to: h.toStatus, note: h.note })),
          notes: req?.notes.map((n) => n.body),
          media: req?.media.map((m) => m.url),
        },
        null,
        2
      )
    );
  } else if (cmd === "notifs") {
    const rows = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
    console.log(JSON.stringify(rows.map((n) => ({ ch: n.channel, to: n.recipient, status: n.status, ref: n.refKey, body: n.body?.slice(0, 60) })), null, 2));
  } else if (cmd === "orders") {
    const o = await prisma.order.findMany({ include: { items: true } });
    console.log(JSON.stringify(o, null, 2));
  } else if (cmd === "products") {
    const p = await prisma.product.findMany({ select: { id: true, slug: true, name: true, price: true, stock: true } });
    await writeFile("qa-products.json", JSON.stringify(p, null, 2));
    console.log("written qa-products.json");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());