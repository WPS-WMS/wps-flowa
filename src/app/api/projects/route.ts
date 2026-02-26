import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const isAdmin = user.role === "ADMIN";
  const projects = await prisma.project.findMany({
    where: isAdmin
      ? undefined
      : {
          OR: [
            { createdById: user.id },
            {
              client: {
                users: { some: { userId: user.id } },
              },
            },
          ],
        },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { tickets: true, timeEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}
