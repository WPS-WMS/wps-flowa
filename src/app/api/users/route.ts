import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const q = request.nextUrl.searchParams.get("q") || "";
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      cargo: true,
      cargaHorariaSemanal: true,
      permitirMaisHoras: true,
      permitirFimDeSemana: true,
      permitirOutroPeriodo: true,
      diasPermitidos: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const body = await request.json();
  const {
    email,
    name,
    password,
    role,
    cargo,
    cargaHorariaSemanal,
    permitirMaisHoras,
    permitirFimDeSemana,
    permitirOutroPeriodo,
    diasPermitidos,
  } = body;
  if (!email || !name || !password || !role) {
    return NextResponse.json(
      { error: "E-mail, nome, senha e tipo são obrigatórios" },
      { status: 400 }
    );
  }
  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "E-mail já cadastrado" },
      { status: 400 }
    );
  }
  const passwordHash = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      name,
      passwordHash,
      role,
      cargo: cargo || null,
      cargaHorariaSemanal: cargaHorariaSemanal ?? 40,
      permitirMaisHoras: permitirMaisHoras ?? false,
      permitirFimDeSemana: permitirFimDeSemana ?? false,
      permitirOutroPeriodo: permitirOutroPeriodo ?? false,
      diasPermitidos: diasPermitidos
        ? JSON.stringify(diasPermitidos)
        : '["seg","ter","qua","qui","sex"]',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      cargo: true,
      cargaHorariaSemanal: true,
      permitirMaisHoras: true,
      permitirFimDeSemana: true,
      permitirOutroPeriodo: true,
      diasPermitidos: true,
      createdAt: true,
    },
  });
  return NextResponse.json(newUser);
}
