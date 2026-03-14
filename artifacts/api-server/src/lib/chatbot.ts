import OpenAI from "openai";
import { db, appointmentsTable, chatSessionsTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Intent = "BOOK" | "CANCEL" | "RESCHEDULE" | "INFO" | "UNKNOWN";

async function classifyIntent(message: string, lang: string): Promise<Intent> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 50,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Classify the user intent. Return ONLY valid JSON: {"intent": "BOOK"|"CANCEL"|"RESCHEDULE"|"INFO"|"UNKNOWN"}
      
      BOOK = wants to make a new appointment
      CANCEL = wants to cancel an existing appointment  
      RESCHEDULE = wants to change date/time of existing appointment
      INFO = asks about services, hours, location, doctor, prices
      UNKNOWN = unclear or unrelated
      
      User language: ${lang}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return (result.intent as Intent) || "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

async function extractDate(message: string): Promise<string | null> {
  const today = new Date().toISOString().split("T")[0];
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 20,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Today is ${today}. Extract date from message as YYYY-MM-DD. 
                   If no date or past date, return null.
                   Return ONLY: {"date": "YYYY-MM-DD"} or {"date": null}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });
  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.date || null;
  } catch {
    return null;
  }
}

async function getAvailableSlots(date: string): Promise<string[]> {
  const d = new Date(date + "T12:00:00Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (d < today) return [];
  if (d.getDay() === 0) return [];

  const possibleSlots = d.getDay() === 6 ? ["matin"] : ["matin", "apres-midi"];
  const available: string[] = [];

  for (const slot of possibleSlots) {
    const existing = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.preferred_date, date),
          eq(appointmentsTable.preferred_time, slot),
          ne(appointmentsTable.status, "cancelled"),
        ),
      );
    if (existing.length < 8) available.push(slot);
  }

  return available;
}

async function getActiveAppointments(email: string) {
  return await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.email, email),
        ne(appointmentsTable.status, "cancelled"),
      ),
    );
}

const CLINIC_INFO = `
Centre Dentaire Senhaji — Dr. Senhaji Jalil
Spécialiste enodontologie, 25 ans dexperience
Tel: +212 707 15 15 14 | Email: cdsstomato@gmail.com
Horaires: Lun-Ven 9h-19h, Sam 9h-14h, Dim: Ferme
Services: Odontologie generale, Endodontie rotatoire, 
Esthetique dentaire (DSD), Prothese dentaire, 
Chirurgie orale, Laser dentaire diode
`;

async function bookingAgent(
  message: string,
  history: any[],
  lang: string,
  sessionData: any,
): Promise<{
  reply: string;
  updatedSessionData: any;
  appointmentCreated?: any;
}> {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const langName =
    lang === "fr"
      ? "francais"
      : lang === "en"
        ? "anglais"
        : lang === "ar"
          ? "arabe classique"
          : "darija marocain";

  const systemPrompt = `Tu es Sara, receptionniste virtuelle du ${CLINIC_INFO}

MISSION: Aider le patient a prendre un rendez-vous en collectant ces infos UNE PAR UNE:
1. Prenom et nom complet
2. Service souhaite (propose la liste des 6 services)
3. Date souhaitee — Demande au patient quelle date lui convient.
   N proposes JAMAIS une liste de dates disponibles.
   Apres que le patient donne une date, verifie avec getAvailableSlots() si disponible.
   Si non disponible → dis que cette date est complete et demande une autre date.
4. Creneau (matin 9h-13h ou apres-midi 14h-19h)
5. Telephone

IMPORTANT: Convertis toute date mentionnee (ex: "6 mars", "demain", "lundi") en format YYYY-MM-DD.
Aujourd'hui = ${today}. "demain" = ${tomorrow}.
Si la date est dans le passe → propose une date future.

IMPORTANT: Email NEST PAS necessaire pour prendre un RDV. Le Dr contacte par telephone.
Ne demande JAMAIS lemail au patient.

RÈGLES:
- UNE question a la fois, jamais plusieurs
- Quand le patient donne une date, verifie les creneaux disponibles dans sessionData.availableSlots
- Si sessionData.availableSlots est vide pour cette date → dis que la date nest pas disponible et demande une autre
- Si sessionData.availableSlots contient seulement 'matin' → propose uniquement le matin
- Ne JAMAIS proposer un creneau non disponible
- Avant de finaliser, recapitule TOUT et demande confirmation
- Sois chaleureux et rassurant (beaucoup de gens ont peur du dentiste)
- Si le patient mentionne une urgence → priorise et collecte juste nom + telephone dabord
- Reponds en ${langName}

DONNEES SESSION ACTUELLES: ${JSON.stringify(sessionData)}

QUAND TU AS TOUTES LES INFOS ET LA CONFIRMATION DU PATIENT:
Reponds avec exactement ce format sur la DERNIERE ligne:
READY_TO_BOOK:{"name":"...","phone":"...","service":"general|endodontia|estetica|protesis|cirugia|laser","preferred_date":"YYYY-MM-DD","preferred_time":"matin|apres-midi","notes":"","lang":"${lang}"}`;

  let updatedSessionData = { ...sessionData };

  const extractedDate = await extractDate(message);
  if (extractedDate) {
    const slots = await getAvailableSlots(extractedDate);
    updatedSessionData.availableSlots = slots;
    updatedSessionData.requestedDate = extractedDate;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 400,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  });

  const rawReply = response.choices[0].message.content || "";

  const readyMatch = rawReply.match(/READY_TO_BOOK:(\{.*\})/s);
  if (readyMatch) {
    try {
      const appointmentData = JSON.parse(readyMatch[1]);

      const slots = await getAvailableSlots(appointmentData.preferred_date);
      if (!slots.includes(appointmentData.preferred_time)) {
        return {
          reply:
            lang === "fr"
              ? `❌ Ce creneau nest plus disponible. Creneaux disponibles: ${slots.join(", ") || "aucun pour cette date"}. Souhaitez-vous choisir une autre date ?`
              : `❌ This slot is no longer available. Available: ${slots.join(", ") || "none for this date"}`,
          updatedSessionData,
        };
      }

      const [created] = await db
        .insert(appointmentsTable)
        .values({ ...appointmentData, status: "pending" })
        .returning();

      const cleanReply = rawReply.replace(/READY_TO_BOOK:\{.*\}/s, "").trim();
      const confirmMsg =
        lang === "fr"
          ? `✅ Votre demande de RDV est enregistree ! Reference: #${created.id}\nLe cabinet vous contactera sous 24h pour confirmer.`
          : `✅ Your appointment request is registered! Reference: #${created.id}\nWe'll contact you within 24h to confirm.`;

      return {
        reply: cleanReply + "\n\n" + confirmMsg,
        updatedSessionData: { intent: "BOOK", completed: true },
        appointmentCreated: created,
      };
    } catch (e) {
      console.error("READY_TO_BOOK parse error:", e);
    }
  }

  return { reply: rawReply, updatedSessionData };
}

async function cancelAgent(
  message: string,
  history: any[],
  lang: string,
  sessionData: any,
): Promise<{ reply: string; updatedSessionData: any }> {
  const langName =
    lang === "fr"
      ? "francais"
      : lang === "en"
        ? "anglais"
        : lang === "ar"
          ? "arabe"
          : "darija";

  const systemPrompt = `Tu es Sara, receptionniste du ${CLINIC_INFO}

MISSION: Aider le patient a annuler un rendez-vous.

ETAPES:
1. Si tu nas pas encore lemail → demande lemail
2. Si sessionData.foundAppointments existe:
   - Sil y en a plusieurs → demande lequel annuler (affiche la liste numerotee)
   - Sil y en a un seul → demande confirmation dannulation
3. Si sessionData.selectedAppointmentId et patient a confirme → indique CANCEL_CONFIRMED

DONNEES SESSION: ${JSON.stringify(sessionData)}
Repons en ${langName}

Si annulation confirmee, ecris sur la derniere ligne:
CANCEL_CONFIRMED:{"appointmentId": NUMBER}`;

  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  let updatedSessionData = { ...sessionData };

  if (emailMatch && !sessionData.foundAppointments) {
    const found = await getActiveAppointments(emailMatch[1]);
    updatedSessionData.email = emailMatch[1];
    updatedSessionData.foundAppointments = found;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  });

  const rawReply = response.choices[0].message.content || "";
  const cancelMatch = rawReply.match(/CANCEL_CONFIRMED:(\{.*\})/);

  if (cancelMatch) {
    const { appointmentId } = JSON.parse(cancelMatch[1]);
    await db
      .update(appointmentsTable)
      .set({ status: "cancelled" })
      .where(eq(appointmentsTable.id, appointmentId));

    const cleanReply = rawReply.replace(/CANCEL_CONFIRMED:\{.*\}/, "").trim();
    const msg =
      lang === "fr"
        ? "✅ Votre rendez-vous a ete annule."
        : "✅ Your appointment has been cancelled.";
    return {
      reply: cleanReply + "\n" + msg,
      updatedSessionData: { intent: "CANCEL", completed: true },
    };
  }

  return { reply: rawReply, updatedSessionData };
}

async function rescheduleAgent(
  message: string,
  history: any[],
  lang: string,
  sessionData: any,
): Promise<{ reply: string; updatedSessionData: any }> {
  const today = new Date().toISOString().split("T")[0];
  const langName =
    lang === "fr"
      ? "francais"
      : lang === "en"
        ? "anglais"
        : lang === "ar"
          ? "arabe"
          : "darija";

  const systemPrompt = `Tu es Sara, receptionniste du ${CLINIC_INFO}

MISSION: Aider le patient a modifier la date de son rendez-vous.

ETAPES:
1. Si pas demail → demande lemail
2. Si sessionData.foundAppointments → affiche les RDV et demande lequel modifier
3. Demande la nouvelle date souhaitee
4. Verifie sessionData.availableSlots pour la nouvelle date
5. Propose les creneaux disponibles
6. Confirme le changement avec recapitulatif

IMPORTANT: Convertis toute date en YYYY-MM-DD.
Aujourdhui = ${today}

DONNEES SESSION: ${JSON.stringify(sessionData)}
Repons en ${langName}

Si modification confirmee:
RESCHEDULE_CONFIRMED:{"appointmentId": NUMBER, "new_date": "YYYY-MM-DD", "new_time": "matin|apres-midi"}`;

  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  let updatedSessionData = { ...sessionData };

  if (emailMatch && !sessionData.foundAppointments) {
    const found = await getActiveAppointments(emailMatch[1]);
    updatedSessionData.foundAppointments = found;
  }

  const extractedDate = await extractDate(message);
  if (extractedDate) {
    const slots = await getAvailableSlots(extractedDate);
    updatedSessionData.availableSlots = slots;
    updatedSessionData.newDate = extractedDate;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  });

  const rawReply = response.choices[0].message.content || "";
  const reschedMatch = rawReply.match(/RESCHEDULE_CONFIRMED:(\{.*\})/);

  if (reschedMatch) {
    const { appointmentId, new_date, new_time } = JSON.parse(reschedMatch[1]);
    await db
      .update(appointmentsTable)
      .set({ preferred_date: new_date, preferred_time: new_time })
      .where(eq(appointmentsTable.id, appointmentId));

    const cleanReply = rawReply
      .replace(/RESCHEDULE_CONFIRMED:\{.*\}/, "")
      .trim();
    const msg =
      lang === "fr"
        ? `✅ RDV modifie pour le ${new_date} (${new_time}).`
        : `✅ Appointment rescheduled to ${new_date} (${new_time}).`;
    return {
      reply: cleanReply + "\n" + msg,
      updatedSessionData: { intent: "RESCHEDULE", completed: true },
    };
  }

  return { reply: rawReply, updatedSessionData };
}

async function infoAgent(
  message: string,
  history: any[],
  lang: string,
): Promise<string> {
  const langName =
    lang === "fr"
      ? "francais"
      : lang === "en"
        ? "anglais"
        : lang === "ar"
          ? "arabe"
          : "darija";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `Tu es Sara, receptionniste du ${CLINIC_INFO}
      Reponds directement et clairement aux questions sur le cabinet.
      Ne propose des RDV que si pertinent.
      Repons en ${langName}`,
      },
      ...history,
      { role: "user", content: message },
    ],
  });
  return response.choices[0].message.content || "";
}

export async function processChat(
  message: string,
  sessionId: string,
  lang: "fr" | "en" | "ar" | "darija" = "fr",
): Promise<{ reply: string; actionResult?: string }> {
  let session = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.id, sessionId))
    .then((r) => r[0]);

  const history = (session?.messages as any[]) || [];
  let sessionData = (session as any)?.session_data || {};

  let intent: Intent;

  if (sessionData.intent && !sessionData.completed) {
    intent = sessionData.intent as Intent;
  } else {
    intent = await classifyIntent(message, lang);
    if (!sessionData.completed) {
      sessionData.intent = intent;
    } else {
      sessionData = { intent };
    }
  }

  console.log(
    `[Chat] SessionId: ${sessionId} | Intent: ${intent} | Lang: ${lang}`,
  );

  let reply = "";
  let appointmentCreated = null;

  history.push({ role: "user", content: message });

  switch (intent) {
    case "BOOK": {
      const result = await bookingAgent(
        message,
        history.slice(0, -1),
        lang,
        sessionData,
      );
      reply = result.reply;
      sessionData = result.updatedSessionData;
      appointmentCreated = result.appointmentCreated;
      break;
    }
    case "CANCEL": {
      const result = await cancelAgent(
        message,
        history.slice(0, -1),
        lang,
        sessionData,
      );
      reply = result.reply;
      sessionData = result.updatedSessionData;
      break;
    }
    case "RESCHEDULE": {
      const result = await rescheduleAgent(
        message,
        history.slice(0, -1),
        lang,
        sessionData,
      );
      reply = result.reply;
      sessionData = result.updatedSessionData;
      break;
    }
    case "INFO":
    default: {
      reply = await infoAgent(message, history.slice(0, -1), lang);
      break;
    }
  }

  history.push({ role: "assistant", content: reply });

  if (session) {
    await db
      .update(chatSessionsTable)
      .set({
        messages: history,
        session_data: sessionData,
        updated_at: new Date(),
      } as any)
      .where(eq(chatSessionsTable.id, sessionId));
  } else {
    await db.insert(chatSessionsTable).values({
      id: sessionId,
      messages: history,
      lang,
      session_data: sessionData,
    } as any);
  }

  return {
    reply,
    actionResult: appointmentCreated
      ? `RDV #${appointmentCreated.id} cree`
      : undefined,
  };
}
