import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  GetAppointmentByIdParams,
  UpdateAppointmentParams,
  DeleteAppointmentParams,
  GetAppointmentsQueryParams,
} from "@workspace/api-zod";
import {
  sendNewAppointmentNotification,
  sendAppointmentConfirmation,
} from "../lib/email.js";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const query = GetAppointmentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let appointments;
  if (query.data.email) {
    appointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.email, query.data.email))
      .orderBy(appointmentsTable.created_at);
  } else {
    appointments = await db
      .select()
      .from(appointmentsTable)
      .orderBy(appointmentsTable.created_at);
  }

  res.json(
    appointments.map((a) => ({
      ...a,
      notes: a.notes ?? null,
      created_at: a.created_at.toISOString(),
    })),
  );
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email)) {
    res.status(400).json({ error: "Email invalide" });
    return;
  }

  if (parsed.data.phone.replace(/\D/g, "").length < 8) {
    res.status(400).json({ error: "Téléphone invalide (minimum 8 chiffres)" });
    return;
  }

  const date = new Date(parsed.data.preferred_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    res.status(400).json({ error: "La date ne peut pas être dans le passé" });
    return;
  }

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  if (date > maxDate) {
    res.status(400).json({ error: "Maximum 3 mois à l'avance" });
    return;
  }

  if (date.getDay() === 0) {
    res.status(400).json({ error: "Le cabinet est fermé le dimanche" });
    return;
  }

  let preferredTime = parsed.data.preferred_time;
  if (date.getDay() === 6 && preferredTime === "apres-midi") {
    preferredTime = "matin";
  }

  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(
      eq(appointmentsTable.email, parsed.data.email) &&
        eq(appointmentsTable.preferred_date, parsed.data.preferred_date) &&
        eq(appointmentsTable.service, parsed.data.service),
    );

  if (existing.length > 0) {
    res.status(400).json({
      error: "Vous avez déjà un rendez-vous pour ce service à cette date",
    });
    return;
  }

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service: parsed.data.service,
      preferred_date: parsed.data.preferred_date,
      preferred_time: preferredTime,
      notes: parsed.data.notes ?? null,
      lang: parsed.data.lang || "fr",
    })
    .returning();

  sendNewAppointmentNotification(appointment);
  sendAppointmentConfirmation(appointment);

  res.status(201).json({
    ...appointment,
    notes: appointment.notes ?? null,
    created_at: appointment.created_at.toISOString(),
  });
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!appointment) {
    res.status(404).json({ error: "Cita no encontrada" });
    return;
  }

  res.json({
    ...appointment,
    notes: appointment.notes ?? null,
    created_at: appointment.created_at.toISOString(),
  });
});

router.put("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof appointmentsTable.$inferInsert> = {};
  if (parsed.data.preferred_date)
    updateData.preferred_date = parsed.data.preferred_date;
  if (parsed.data.preferred_time)
    updateData.preferred_time = parsed.data.preferred_time;
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined)
    updateData.notes = parsed.data.notes ?? null;

  const [appointment] = await db
    .update(appointmentsTable)
    .set(updateData)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Cita no encontrada" });
    return;
  }

  res.json({
    ...appointment,
    notes: appointment.notes ?? null,
    created_at: appointment.created_at.toISOString(),
  });
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = DeleteAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .delete(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Cita no encontrada" });
    return;
  }

  res.json({ success: true, message: "Cita cancelada correctamente" });
});

export default router;
