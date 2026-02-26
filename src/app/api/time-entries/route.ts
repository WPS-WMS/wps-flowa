import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function parseHours(h: string): number {
  const [hh, mm] = h.split(":").map(Number);
  return (hh || 0) + (mm || 0) / 60;
}

function formatHours(n: number): string {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { userId, start, end, projectId, view } = Object.fromEntries(
    request.nextUrl.searchParams
  );

  let where: Record<string, unknown> = {};

  if (user.role === "CLIENTE" && view === "client") {
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
    where = { projectId: { in: projectIds } };
  } else {
    const targetUserId = user.role === "ADMIN" && userId ? userId : user.id;
    where = { userId: targetUserId };
  }

  if (start && end) {
    where.date = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }
  if (projectId) where.projectId = projectId;

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      project: { include: { client: true } },
      ticket: true,
      activity: true,
    },
    orderBy: [{ date: "desc" }, { horaInicio: "asc" }],
  });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = await request.json();
  const {
    date,
    horaInicio,
    horaFim,
    intervaloInicio,
    intervaloFim,
    description,
    projectId,
    ticketId,
    activityId,
  } = body;

  if (!date || !horaInicio || !horaFim || !projectId) {
    return NextResponse.json(
      { error: "Data, hora início, hora fim e projeto são obrigatórios" },
      { status: 400 }
    );
  }

  let total = parseHours(horaFim) - parseHours(horaInicio);
  if (intervaloInicio && intervaloFim) {
    total -= parseHours(intervaloFim) - parseHours(intervaloInicio);
  }
  if (total <= 0) {
    return NextResponse.json(
      { error: "Total de horas deve ser positivo" },
      { status: 400 }
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      date: new Date(date),
      horaInicio,
      horaFim,
      intervaloInicio: intervaloInicio || null,
      intervaloFim: intervaloFim || null,
      totalHoras: total,
      description: description || null,
      userId: user.id,
      projectId,
      ticketId: ticketId || null,
      activityId: activityId || null,
    },
    include: {
      project: { include: { client: true } },
      ticket: true,
      activity: true,
    },
  });
  return NextResponse.json(entry);
}
