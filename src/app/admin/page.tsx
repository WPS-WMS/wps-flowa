import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex-1">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Visão Admin</h2>
      </header>
      <main className="p-6">
        <h1 className="text-xl font-semibold text-white mb-6">
          Olá, {user.name}!
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/projetos"
            className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition"
          >
            <span className="text-amber-400 font-medium">Projetos</span>
            <p className="text-slate-400 text-sm mt-1">Gerenciar projetos</p>
          </Link>
          <Link
            href="/admin/apontamento"
            className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition"
          >
            <span className="text-amber-400 font-medium">Apontamento</span>
            <p className="text-slate-400 text-sm mt-1">Apontar horas</p>
          </Link>
          <Link
            href="/admin/banco-horas"
            className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition"
          >
            <span className="text-amber-400 font-medium">Banco de horas</span>
            <p className="text-slate-400 text-sm mt-1">Relatórios</p>
          </Link>
          <Link
            href="/admin/usuarios"
            className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition"
          >
            <span className="text-amber-400 font-medium">Usuários</span>
            <p className="text-slate-400 text-sm mt-1">Configurações</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
