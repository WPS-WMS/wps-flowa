import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default async function ClienteHomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const clientIds = (
    await prisma.clientUser.findMany({
      where: { userId: user.id },
      select: { clientId: true },
    })
  ).map((c) => c.clientId);

  const projects = await prisma.project.findMany({
    where: { clientId: { in: clientIds } },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);

  const [hojeAgg, mesAgg, semanaAgg, emExecucao, finalizados] = await Promise.all([
    prisma.timeEntry.aggregate({
      where: {
        projectId: { in: projectIds },
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: { totalHoras: true },
    }),
    prisma.timeEntry.aggregate({
      where: {
        projectId: { in: projectIds },
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalHoras: true },
    }),
    prisma.timeEntry.aggregate({
      where: {
        projectId: { in: projectIds },
        date: { gte: weekStart, lte: todayEnd },
      },
      _sum: { totalHoras: true },
    }),
    prisma.ticket.count({
      where: {
        projectId: { in: projectIds },
        status: { in: ["ABERTO", "EM_ANALISE", "APROVADO", "EXECUCAO", "TESTE"] },
      },
    }),
    prisma.ticket.count({
      where: {
        projectId: { in: projectIds },
        status: "ENCERRADO",
      },
    }),
  ]);

  const tickets = await prisma.ticket.findMany({
    where: {
      projectId: { in: projectIds },
      status: { notIn: ["ENCERRADO"] },
    },
    include: { project: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const mesNome = now.toLocaleDateString("pt-BR", { month: "long" });
  const semanaNum = Math.ceil(now.getDate() / 7);
  const dataAtual = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const hoje = fmt(hojeAgg._sum.totalHoras ?? 0);
  const mes = fmt(mesAgg._sum.totalHoras ?? 0);
  const semana = fmt(semanaAgg._sum.totalHoras ?? 0);

  return (
    <div className="flex-1">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Seu consumo de horas</h2>
      </header>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Olá, {user.name}!</h1>
          <p className="text-slate-400">
            Mês atual: {mesNome}/2026 · Semana atual: {semanaNum} · Hoje é {dataAtual}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Hoje" value={hoje} />
          <StatCard label="Mês" value={mes} />
          <StatCard label="Semana" value={semana} />
          <StatCard label="Em execução" value={String(emExecucao)} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">SLA</p>
            <p className="text-2xl font-bold text-amber-400">00:20</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Horas contratadas / Finalizados</p>
            <p className="text-2xl font-bold text-amber-400">20:00 / {finalizados}</p>
          </div>
        </div>
        <section>
          <h2 className="text-lg font-medium text-white mb-4">Lista de chamados</h2>
          <ul className="space-y-2">
            {tickets.length === 0 ? (
              <li className="text-slate-500">Nenhum chamado em aberto</li>
            ) : (
              tickets.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <span className="text-amber-400 font-mono">{t.code}</span>
                  <span className="text-slate-300">
                    {t.project.client.name} - {t.project.name} - {t.title}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-amber-400">{value}</p>
    </div>
  );
}
