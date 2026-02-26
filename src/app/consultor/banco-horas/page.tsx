import { getCurrentUser } from "@/lib/auth";
import { BancoHorasClient } from "./BancoHorasClient";
import { HeaderBar } from "@/components/HeaderBar";
import { prisma } from "@/lib/prisma";

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default async function BancoHorasPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - now.getDay() + 1);
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
        title="Banco de horas"
        subtitle={`Olá, ${user.name}!`}
        hoursWeek={horasSemana}
      />
      <main className="p-6">
        <p className="text-slate-400 text-sm mb-4">
          Horas previstas por mês vs horas trabalhadas vs horas complementares.
          Observação para pagamento de horas extras ou data início/rompimento de contrato.
        </p>
        <BancoHorasClient userId={user.id} isAdmin={user.role === "ADMIN"} />
      </main>
    </div>
  );
}
