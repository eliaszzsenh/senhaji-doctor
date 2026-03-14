import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { db, appointmentsTable, chatSessionsTable } from "@workspace/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const CLINIC_INFO: Record<string, string> = {
  fr: `
INFORMATIONS DU CABINET:
- Docteur: Dr. Senhaji Jalil, 25 ans d'expérience
- Tél: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Horaires: Lundi-Vendredi 9h-19h, Samedi 9h-14h
- Services: Odontologie générale, Endodontie rotatoire, Esthétique dentaire (DSD), Prothèse dentaire, Chirurgie orale, Laser dentaire diode
`,
  en: `
CLINIC INFORMATION:
- Doctor: Dr. Senhaji Jalil, 25 years of experience
- Phone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Hours: Monday-Friday 9am-7pm, Saturday 9am-2pm
- Services: General dentistry, Rotatory endodontics, Dental aesthetics (DSD), Dental prosthesis, Oral surgery, Diode dental laser
`,
  ar: `
معلومات العيادة:
- الطبيب: الدكتور سنهاجي جليل، 25 عامًا من الخبرة
- الهاتف: +212 707 15 15 14
- البريد الإلكتروني: cdsstomato@gmail.com
- ساعات العمل: الاثنين إلى الجمعة 9ص-7م، السبت 9ص-2م
- الخدمات: طب الأسنان العام، علاج الجذور الدوراني، تجميل الأسنان، التعويضات السنية، جراحة الفم، ليزر الثنائي للأسنان
`,
  darija: `
معلومات العيادة:
- Doctor: Dr. Senhaji Jalil, 25 عام ديال التجربة
- الهاتف: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Hours: Monday to Friday 9-7, Saturday 9-2
- Services: طب أسنان عام, علاج الجذور, تجميل أسنان, تعويضات, جراحة فم, ليزر
`,
};

const SYSTEM_PROMPT_TEMPLATE = (lang: string) => {
  const langPrompts: Record<string, string> = {
    fr: `Tu es l'assistant virtuel du Centre Dentaire Senhaji. Réponds TOUJOURS en français.`,
    en: `You are the virtual assistant of Centre Dentaire Senhaji. ALWAYS respond in English.`,
    ar: `أنت المساعد الافتراضي لمركز سنهاجي للأسنان. أجب دائماً باللغة العربية الفصحى.`,
    darija: `نتا المساعد الافتراضي ديال مركز سنهاجي للأسنان. جاوب ديما بالدارجة المغربية.`,
  };

  const basePrompt = langPrompts[lang] || langPrompts.fr;

  return `${basePrompt}
${CLINIC_INFO[lang] || CLINIC_INFO.fr}

TU PEUX FAIRE EXACTEMENT 4 CHOSES:
1. PRENDRE RDV: collecter nom, service, date (YYYY-MM-DD), créneau (matin/après-midi), email, téléphone.
   Quand tu as TOUT: ACTION:{"type":"CREATE_APPOINTMENT","data":{"name":"...","service":"...","preferred_date":"...","preferred_time":"...","email":"...","phone":"..."}}

2. ANNULER RDV: demander email, puis ID du RDV.
   ACTION:{"type":"CANCEL_APPOINTMENT","id":...}

3. MODIFIER RDV: demander email, ID du RDV, nouvelle date, nouveau créneau.
   ACTION:{"type":"UPDATE_APPOINTMENT","id":...,"preferred_date":"...","preferred_time":"..."}

4. INFORMATIONS: répondre directement aux questions sur services, horaires, contact.

RÈGLES:
- Collecte les infos UNE PAR UNE
- Ne pose jamais plusieurs questions à la fois
- Sois chaleureux et professionnel
- Le format ACTION doit être sur une ligne séparée à la FIN de ta réponse si une action est nécessaire
- Si pas d'action, ne mets pas de ligne ACTION
- Réponds toujours de manière complète et utile`;
};

export async function processChatMessage(
  message: string,
  sessionId: string,
  lang: string = "fr",
): Promise<{ reply: string; action?: unknown }> {
  try {
    let session = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.id, sessionId))
      .then((rows) => rows[0]);

    const messages: Message[] = [];

    if (!session) {
      await db.insert(chatSessionsTable).values({
        id: sessionId,
        messages: [],
        lang,
      });
      messages.push({
        role: "system",
        content: SYSTEM_PROMPT_TEMPLATE(lang),
      });
    } else {
      if (session.lang !== lang) {
        await db
          .update(chatSessionsTable)
          .set({ lang })
          .where(eq(chatSessionsTable.id, sessionId));
      }
      messages.push({
        role: "system",
        content: SYSTEM_PROMPT_TEMPLATE(lang),
      });
      const storedMessages = (session.messages || []) as Message[];
      messages.push(...storedMessages);
    }

    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const assistantReply =
      response.choices[0]?.message?.content || "Désolé, je n'ai pas compris.";

    const actionMatch = assistantReply.match(/ACTION:\s*(\{[^}]+\})/);
    let action: unknown = undefined;
    let reply = assistantReply;

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
        reply = assistantReply.replace(actionMatch[0], "").trim();
      } catch {
        action = undefined;
      }
    }

    const updatedMessages = [
      ...messages.slice(1),
      { role: "assistant" as const, content: assistantReply },
    ];

    await db
      .update(chatSessionsTable)
      .set({
        messages: updatedMessages,
        updated_at: new Date(),
      })
      .where(eq(chatSessionsTable.id, sessionId));

    return { reply, action };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      reply: "Une erreur s'est produite. Veuillez réessayer plus tard.",
    };
  }
}

export async function executeAction(
  action: Record<string, unknown>,
): Promise<{ success: boolean; message: string }> {
  try {
    switch (action.type) {
      case "CREATE_APPOINTMENT": {
        const data = action.data as Record<string, string>;
        const [appt] = await db
          .insert(appointmentsTable)
          .values({
            name: data.name,
            email: data.email,
            phone: data.phone,
            service: data.service,
            preferred_date: data.preferred_date,
            preferred_time: data.preferred_time,
            notes: data.notes || null,
            status: "pending",
          })
          .returning();
        return {
          success: true,
          message: `Rendez-vous créé avec succès! ID: ${appt.id}`,
        };
      }

      case "CANCEL_APPOINTMENT": {
        const id = action.id as number;
        await db
          .update(appointmentsTable)
          .set({ status: "cancelled" })
          .where(eq(appointmentsTable.id, id));
        return { success: true, message: "Rendez-vous annulé." };
      }

      case "UPDATE_APPOINTMENT": {
        const id = action.id as number;
        await db
          .update(appointmentsTable)
          .set({
            preferred_date: action.preferred_date as string,
            preferred_time: action.preferred_time as string,
          })
          .where(eq(appointmentsTable.id, id));
        return { success: true, message: "Rendez-vous modifié." };
      }

      default:
        return { success: false, message: "Action inconnue" };
    }
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      message: "Erreur lors de l'exécution de l'action",
    };
  }
}
