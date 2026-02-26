import { Request, Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

export const activitiesRouter = Router();
activitiesRouter.use(authMiddleware);

activitiesRouter.get("/", async (req, res) => {
  const user = (req as Request & { user: { tenantId: string } }).user;
  const activities = await prisma.activity.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: "asc" },
  });
  res.json(activities);
});
