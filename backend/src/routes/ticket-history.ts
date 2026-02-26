import { Request, Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

export const ticketHistoryRouter = Router();
ticketHistoryRouter.use(authMiddleware);

ticketHistoryRouter.get("/", async (req, res) => {
  const user = (req as Request & { user: { id: string; role: string; tenantId: string } }).user;
  const { ticketId } = req.query;

  if (!ticketId) {
    res.status(400).json({ error: "ticketId é obrigatório" });
    return;
  }

  // Verificar se o ticket pertence ao tenant
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: String(ticketId),
      project: { client: { tenantId: user.tenantId } },
    },
    select: { id: true },
  });

  if (!ticket) {
    res.status(404).json({ error: "Tarefa não encontrada" });
    return;
  }

  const history = await prisma.ticketHistory.findMany({
    where: { ticketId: String(ticketId) },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(history);
});
