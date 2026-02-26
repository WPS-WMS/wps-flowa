import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

const NAV_ITEMS = [
  { href: "/cliente", label: "Home" },
  { href: "/cliente/consumo", label: "Consumo de horas" },
  { href: "/cliente/abrir-chamado", label: "Abrir chamado" },
];

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENTE") redirect("/");

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        items={NAV_ITEMS}
        user={{ name: user.name, role: "Cliente" }}
      />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
