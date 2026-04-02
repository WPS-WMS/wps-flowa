import { Router, type Request } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";
 
export const clientReportsRouter = Router();
clientReportsRouter.use(authMiddleware);
 
// GET /api/client-reports/gestao-horas?start=&end=&projectId=
clientReportsRouter.get("/gestao-horas", async (req, res) => {
  try {
    const user = (req as Request & { user: { id: string; role: string; tenantId: string } }).user;
    if (user.role !== "CLIENTE") {
      res.status(403).json({ error: "Não autorizado" });
      return;
    }
 
    const { start, end, projectId } = req.query;
    const startDate = start ? new Date(String(start)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = end ? new Date(String(end)) : new Date();
 
    const clientIds = (
      await prisma.clientUser.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      })
    ).map((x) => x.clientId);
 
    if (clientIds.length === 0) {
      res.json([]);
      return;
    }
 
    const allowedProjects = await prisma.project.findMany({
      where: { clientId: { in: clientIds }, arquivado: false },
      select: { id: true },
    });
    const allowedProjectIds = allowedProjects.map((p) => p.id);
    if (allowedProjectIds.length === 0) {
      res.json([]);
      return;
    }
 
    const where: Record<string, unknown> = {
      project: { client: { tenantId: user.tenantId } },
      projectId: { in: allowedProjectIds },
      date: { gte: startDate, lte: endDate },
    };
    if (projectId) {
      const pid = String(projectId);
      if (!allowedProjectIds.includes(pid)) {
        res.json([]);
        return;
      }
      where.projectId = pid;
    }
 
    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: { include: { client: true } },
        ticket: true,
        activity: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ date: "desc" }, { horaInicio: "asc" }],
    });
 
    res.json(entries);
  } catch (err) {
    console.error("GET /api/client-reports/gestao-horas error:", err);
    res.status(500).json({ error: "Erro ao gerar relatório de horas" });
  }
});

