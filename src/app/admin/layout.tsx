import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/signin?next=/admin");
  if (user.role !== "ADMIN") redirect("/technician");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar user={{ name: user.name, email: user.email }} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}