import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TechHeader } from "@/components/technician/tech-header";

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/signin?next=/technician");
  if (user.role !== "TECHNICIAN" && user.role !== "ADMIN") redirect("/signin");

  return (
    <div className="min-h-dvh">
      <TechHeader name={user.name} />
      <main className="container-site py-8">{children}</main>
    </div>
  );
}