import { getCurrentUser } from "@/lib/auth";
import { UsuariosClient } from "./UsuariosClient";
import { HeaderBar } from "@/components/HeaderBar";
import { prisma } from "@/lib/prisma";

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const weekAgg = await prisma.timeEntry.aggregate({
    where: { userId: user.id, date: { gte: weekStart, lte: todayEnd } },
    _sum: { totalHoras: true },
  });
  const semana = fmt(weekAgg._sum.totalHoras ?? 0);

  return (
    <div className="flex-1">
      <HeaderBar
        title="Configurações do sistema"
        subtitle="Usuários e Horas"
        hoursWeek={semana}
      />
      <main className="p-6">
        <UsuariosClient />
      </main>
    </div>
  );
}
