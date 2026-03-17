import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { userId, year } = Object.fromEntries(request.nextUrl.searchParams);
  const targetUserId = user.role === "ADMIN" && userId ? userId : user.id;
  const y = year ? parseInt(year, 10) : new Date().getFullYear();

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { limiteHorasDiarias: true, limiteHorasPorDia: true, dataInicioAtividades: true, inativadoEm: true },
  });

  const records = await prisma.hourBankRecord.findMany({
    where: { userId: targetUserId, year: y },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  // Se não houver registros, calcular a partir dos apontamentos
  if (records.length === 0) {
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31, 23, 59, 59);
    const entries = await prisma.timeEntry.findMany({
      where: { userId: targetUserId, date: { gte: start, lte: end } },
    });
    const byMonth: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = 0;
    for (const e of entries) {
      const m = new Date(e.date).getMonth() + 1;
      byMonth[m] = (byMonth[m] || 0) + e.totalHoras;
    }
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const previstas = computeHorasPrevistasParaMes(targetUser, y, m);
      result.push({
        month: m,
        year: y,
        horasPrevistas: Math.round(previstas * 100) / 100,
        horasTrabalhadas: Math.round(byMonth[m] * 100) / 100,
        horasComplementares: Math.round((byMonth[m] - previstas) * 100) / 100,
        observacao: null,
      });
    }
    return NextResponse.json(result);
  }
  return NextResponse.json(records);
}

type UserForHourBank = {
  limiteHorasDiarias?: number | null;
  limiteHorasPorDia?: string | null;
  dataInicioAtividades?: Date | null;
  inativadoEm?: Date | null;
};

function getDailyLimitFromUser(user: UserForHourBank, dateValue: Date): number {
  const dow = dateValue.getDay();
  const fallback =
    typeof user.limiteHorasDiarias === "number" && !Number.isNaN(user.limiteHorasDiarias)
      ? user.limiteHorasDiarias
      : 8;
  const raw = user.limiteHorasPorDia;
  if (!raw) return dow === 0 || dow === 6 ? 0 : fallback;
  try {
    const map = JSON.parse(raw) as Record<string, number>;
    const keys = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
    const key = keys[dow] as string;
    const v = map[key];
    if (typeof v === "number" && v >= 0) return v;
    return dow === 0 || dow === 6 ? 0 : fallback;
  } catch {
    return dow === 0 || dow === 6 ? 0 : fallback;
  }
}

function computeHorasPrevistasParaMes(user: UserForHourBank | null, year: number, month: number): number {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  let d = new Date(startOfMonth);
  if (user?.dataInicioAtividades && user.dataInicioAtividades > d) {
    d = new Date(user.dataInicioAtividades);
    d.setHours(0, 0, 0, 0);
  }

  let effectiveEnd = new Date(endOfMonth);
  if (user?.inativadoEm) {
    const inat = new Date(user.inativadoEm);
    inat.setHours(23, 59, 59, 999);
    if (inat < effectiveEnd) effectiveEnd = inat;
  }

  if (d > effectiveEnd) return 0;
  let previstas = 0;
  while (d <= effectiveEnd) {
    previstas += getDailyLimitFromUser(user ?? {}, d);
    d.setDate(d.getDate() + 1);
  }
  return Math.round(previstas * 100) / 100;
}
