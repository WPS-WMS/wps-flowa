import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

const NAV_ITEMS = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/apontamento", label: "Apontamento de horas" },
  { href: "/admin/banco-horas", label: "Banco de horas" },
  { href: "/admin/usuarios", label: "Configurações do sistema" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        items={NAV_ITEMS}
        user={{ name: user.name, role: user.role }}
      />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
