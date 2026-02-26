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

  const records = await prisma.hourBankRecord.findMany({
    where: { userId: targetUserId, year: y },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  // Se não houver registros, calcular a partir dos apontamentos
  if (records.length === 0) {
    const carga = user.cargaHorariaSemanal ?? 40;
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
      const diasUteis = getWorkingDays(y, m);
      const previstas = (carga / 5) * diasUteis;
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

function getWorkingDays(year: number, month: number): number {
  let count = 0;
  const d = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  while (d <= last) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
