import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HeaderBar } from "@/components/HeaderBar";

export default async function ConsultorProjetosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const projects = await prisma.project.findMany({
    where: isAdmin
      ? undefined
      : {
          OR: [
            { createdById: user.id },
            {
              client: {
                users: { some: { userId: user.id } },
              },
            },
          ],
        },
    include: {
      client: true,
      createdBy: { select: { name: true, email: true } },
      _count: { select: { tickets: true, timeEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const weekAgg = await prisma.timeEntry.aggregate({
    where: {
      userId: user.id,
      date: { gte: weekStart, lte: todayEnd },
    },
    _sum: { totalHoras: true },
  });
  const semana =
    fmt(weekAgg._sum.totalHoras ?? 0);

  return (
    <div className="flex-1">
      <HeaderBar
        title="Projetos"
        subtitle="Lista de projetos com acesso"
        hoursWeek={semana}
      />
      <main className="p-6">
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-slate-400 text-sm">
                <th className="px-4 py-3">Projeto</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Criado por</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Chamados</th>
                <th className="px-4 py-3">Apontamentos</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-700 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-slate-300">{p.client.name}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.createdBy.name} ({p.createdBy.email})
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {p._count.tickets}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {p._count.timeEntries}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && (
          <p className="text-slate-500 text-center py-8">
            Nenhum projeto encontrado
          </p>
        )}
      </main>
    </div>
  );
}

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
