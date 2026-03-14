import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db, appointmentsTable } from "@workspace/db";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "senhaji-jwt-secret-2025";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SenhajI2025!";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Mot de passe incorrect" });
    return;
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

router.get(
  "/admin/appointments",
  authMiddleware,
  async (req, res): Promise<void> => {
    const { email, status, date } = req.query;

    let conditions = undefined;
    if (email) {
      conditions = and(
        conditions,
        eq(appointmentsTable.email, email as string),
      );
    }
    if (status) {
      conditions = and(
        conditions,
        eq(appointmentsTable.status, status as string),
      );
    }
    if (date) {
      conditions = and(
        conditions,
        eq(appointmentsTable.preferred_date, date as string),
      );
    }

    const appointments = await db
      .select()
      .from(appointmentsTable)
      .where(conditions)
      .orderBy(appointmentsTable.preferred_date);

    res.json(
      appointments.map((a) => ({
        ...a,
        notes: a.notes ?? null,
        created_at: a.created_at.toISOString(),
      })),
    );
  },
);

router.put(
  "/admin/appointments/:id",
  authMiddleware,
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const [appointment] = await db
      .update(appointmentsTable)
      .set({ status })
      .where(eq(appointmentsTable.id, parseInt(String(id))))
      .returning();

    if (!appointment) {
      res.status(404).json({ error: "Rendez-vous non trouvé" });
      return;
    }

    res.json({
      ...appointment,
      notes: appointment.notes ?? null,
      created_at: appointment.created_at.toISOString(),
    });
  },
);

router.get("/admin/stats", authMiddleware, async (req, res): Promise<void> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointmentsTable);

  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "pending"));

  const [confirmedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "confirmed"));

  const [cancelledResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "cancelled"));

  const [thisWeekResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointmentsTable)
    .where(gte(appointmentsTable.created_at, startOfWeek));

  res.json({
    total: totalResult?.count || 0,
    pending: pendingResult?.count || 0,
    confirmed: confirmedResult?.count || 0,
    cancelled: cancelledResult?.count || 0,
    thisWeek: thisWeekResult?.count || 0,
  });
});

export default router;
