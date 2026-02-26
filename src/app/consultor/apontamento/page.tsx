import { getCurrentUser } from "@/lib/auth";
import { ApontamentoClient } from "./ApontamentoClient";
import { HeaderBar } from "@/components/HeaderBar";
import { prisma } from "@/lib/prisma";

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default async function ApontamentoPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekAgg = await prisma.timeEntry.aggregate({
    where: {
      userId: user.id,
      date: { gte: weekStart, lte: weekEnd },
    },
    _sum: { totalHoras: true },
  });
  const horasSemana = fmt(weekAgg._sum.totalHoras ?? 0);

  return (
    <div className="flex-1">
      <HeaderBar
        title="Apontamento de horas"
        subtitle={`Olá, ${user.name}!`}
        hoursWeek={horasSemana}
      />
      <main className="p-6">
        <ApontamentoClient userId={user.id} />
      </main>
    </div>
  );
}
