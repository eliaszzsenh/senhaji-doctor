import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import { SendChatMessageBody } from "@workspace/api-zod";
import { processChatMessage } from "../lib/chatbot.js";

const router: IRouter = Router();

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;

  const reply = await processChatMessage(
    message,
    sessionId,
    async (data) => {
      const [appt] = await db
        .insert(appointmentsTable)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          preferred_date: data.preferred_date,
          preferred_time: data.preferred_time,
          notes: data.notes ?? null,
        })
        .returning();
      return { id: appt.id };
    },
    async (email) => {
      return db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.email, email))
        .orderBy(appointmentsTable.created_at);
    },
    async (id) => {
      const [deleted] = await db
        .delete(appointmentsTable)
        .where(eq(appointmentsTable.id, id))
        .returning();
      return !!deleted;
    },
    async (id, data) => {
      const updateData: Partial<typeof appointmentsTable.$inferInsert> = {};
      if (data.preferred_date) updateData.preferred_date = data.preferred_date;
      if (data.preferred_time) updateData.preferred_time = data.preferred_time;
      if (data.status) updateData.status = data.status;

      const [updated] = await db
        .update(appointmentsTable)
        .set(updateData)
        .where(eq(appointmentsTable.id, id))
        .returning();
      return !!updated;
    }
  );

  res.json(reply);
});

export default router;
