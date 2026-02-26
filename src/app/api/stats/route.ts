import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { scope } = Object.fromEntries(request.nextUrl.searchParams);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [today, week, month, tickets] = await Promise.all([
    prisma.timeEntry.aggregate({
      where: { userId: user.id, date: { gte: todayStart, lte: todayEnd } },
      _sum: { totalHoras: true },
    }),
    prisma.timeEntry.aggregate({
      where: {
        userId: user.id,
        date: { gte: weekStart, lte: todayEnd },
      },
      _sum: { totalHoras: true },
    }),
    prisma.timeEntry.aggregate({
      where: {
        userId: user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalHoras: true },
    }),
    prisma.ticket.count({
      where: {
        assignedToId: user.id,
        status: { notIn: ["ENCERRADO"] },
      },
    }),
  ]);

  const fmt = (n: number) => {
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const stats = {
    hoje: fmt(today._sum.totalHoras ?? 0),
    semana: fmt(week._sum.totalHoras ?? 0),
    mes: fmt(month._sum.totalHoras ?? 0),
    tarefas: tickets,
  };

  if (scope === "week") {
    return NextResponse.json({
      semana: fmt(week._sum.totalHoras ?? 0),
      weekStart,
      weekEnd: todayEnd,
    });
  }

  return NextResponse.json(stats);
}
