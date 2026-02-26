import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { projectId, assignedTo, status } = Object.fromEntries(
    request.nextUrl.searchParams
  );
  const isAdmin = user.role === "ADMIN";
  const isConsultor = user.role === "CONSULTOR" || user.role === "GERENTE";
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(projectId && { projectId }),
      ...(assignedTo && { assignedToId: assignedTo }),
      ...(status && { status }),
      ...(!isAdmin &&
        isConsultor && {
          OR: [
            { assignedToId: user.id },
            { project: { createdById: user.id } },
          ],
        }),
      ...(!isAdmin &&
        user.role === "CLIENTE" && {
          project: {
            client: {
              users: { some: { userId: user.id } },
            },
          },
        }),
    },
    include: {
      project: { include: { client: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tickets);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = await request.json();
  const { projectId, title, description, type, criticidade } = body;
  if (!projectId || !title || !type) {
    return NextResponse.json(
      { error: "Projeto, título e tipo são obrigatórios" },
      { status: 400 }
    );
  }
  const last = await prisma.ticket.findFirst({
    where: { projectId },
    orderBy: { code: "desc" },
  });
  const nextCode = last ? String(parseInt(last.code, 10) + 1) : "1";
  const ticket = await prisma.ticket.create({
    data: {
      code: nextCode,
      title,
      description: description || null,
      type,
      criticidade: criticidade || null,
      status: "ABERTO",
      projectId,
      createdById: user.id,
    },
    include: {
      project: { include: { client: true } },
    },
  });
  return NextResponse.json(ticket);
}
