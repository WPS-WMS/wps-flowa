import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const isAdmin = user.role === "ADMIN";
  const clients = await prisma.client.findMany({
    where: isAdmin
      ? undefined
      : {
          users: { some: { userId: user.id } },
        },
    include: {
      _count: { select: { projects: true } },
    },
  });
  return NextResponse.json(clients);
}
