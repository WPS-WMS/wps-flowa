import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

const NAV_ITEMS = [
  { href: "/consultor", label: "Home" },
  { href: "/consultor/projetos", label: "Projetos" },
  { href: "/consultor/apontamento", label: "Apontamento de horas" },
  { href: "/consultor/banco-horas", label: "Banco de horas" },
];

export default async function ConsultorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CONSULTOR" && user.role !== "GERENTE" && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        items={NAV_ITEMS}
        user={{ name: user.name, role: user.role }}
      />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
