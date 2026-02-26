import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConsumoClient } from "./ConsumoClient";

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default async function ConsumoPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
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

  const mesAgg = await prisma.timeEntry.aggregate({
    where: {
      projectId: { in: projectIds },
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { totalHoras: true },
  });

  const horasMes = fmt(mesAgg._sum.totalHoras ?? 0);
  const mesAno = `${now.toLocaleDateString("pt-BR", { month: "long" })}/${now.getFullYear()}`;

  return (
    <div className="flex-1">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">
          Consumo de horas em {mesAno}: {horasMes}
        </h2>
      </header>
      <main className="p-6">
        <ConsumoClient />
      </main>
    </div>
  );
}
