import OpenAI from "openai";
import { db } from "@workspace/db";
import { appointments, chatSessions } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
console.log("OpenAI API Key length:", process.env.OPENAI_API_KEY?.length || 0);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 8;
}

function isValidDate(dateStr: string): { valid: boolean; error?: string } {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  if (date < today) {
    return { valid: false, error: "Date cannot be in the past" };
  }

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  if (date > maxDate) {
    return { valid: false, error: "Maximum 3 months ahead" };
  }

  const day = date.getDay();
  if (day === 0) {
    return { valid: false, error: "Closed on Sundays" };
  }

  return { valid: true };
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay();
}

async function checkRateLimit(
  sessionId: string,
): Promise<{ allowed: boolean; count: number; error?: string }> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentAppointments = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointmentsTable.id, 0),
        gte(appointmentsTable.created_at, yesterday),
      ),
    );

  const countBySession = recentAppointments.filter(
    (a: any) => a.session_id === sessionId,
  ).length;

  if (countBySession >= 3) {
    return {
      allowed: false,
      count: countBySession,
      error:
        "Maximum 3 appointments per day. Please contact the clinic directly.",
    };
  }

  return { allowed: true, count: countBySession };
}

async function checkDuplicate(
  email: string,
  date: string,
  service: string,
): Promise<boolean> {
  const existing = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.email, email),
        eq(appointments.preferred_date, date),
        eq(appointments.service, service),
      ),
    );

  return existing.length > 0;
}

function validateAndPrepareAppointment(
  data: any,
  sessionId: string,
): { valid: boolean; data?: any; error?: string } {
  if (!data.name || data.name.length < 2) {
    return { valid: false, error: "Nom invalide (minimum 2 caractères)" };
  }

  if (!validateEmail(data.email)) {
    return { valid: false, error: "Email invalide" };
  }

  if (!validatePhone(data.phone)) {
    return { valid: false, error: "Téléphone invalide (minimum 8 chiffres)" };
  }

  const dateValidation = isValidDate(data.preferred_date);
  if (!dateValidation.valid) {
    return { valid: false, error: dateValidation.error };
  }

  const dayOfWeek = getDayOfWeek(data.preferred_date);
  if (dayOfWeek === 6 && data.preferred_time === "apres-midi") {
    data.preferred_time = "matin";
  }

  if (!["matin", "apres-midi"].includes(data.preferred_time)) {
    return { valid: false, error: "Créneau invalide" };
  }

  return { valid: true, data: { ...data, session_id: sessionId } };
}

async function getUserAppointments(email: string) {
  return await db
    .select()
    .from(appointments)
    .where(
      and(eq(appointments.email, email), eq(appointments.status, "pending")),
    );
}

const SYSTEM_PROMPTS = {
  fr: `Tu es Sara, la réceptionniste virtuelle du Centre Dentaire Senhaji.
Tu es chaleureux, professionnel et rassurant. Beaucoup de gens ont peur du dentiste, donc tu les rassures.

INFORMATIONS DU CABINET:
- Docteur: Dr. Senhaji Jalil, Chirurgien-Dentiste Spécialiste, 25 ans d'expérience
- Téléphone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Horaires: Lundi-Vendredi 9h00-19h00, Samedi 9h00-14h00
- Fermé le dimanche

IMPORTANT SUR LES STATUTS:
- Quand tu crées un RDV → dis TOUJOURS: 'Votre DEMANDE de rendez-vous est enregistrée avec la référence #[id]. Le cabinet vous contactera sous 24h pour confirmer.'
- Ne dis JAMAIS 'votre rendez-vous est confirmé' car c'est le docteur qui confirme manuellement

RÈGLES:
1. Une question à la fois, JAMAIS plusieurs
2. Appeler le patient par son prénom dès qu'il le donne
3. Si le patient a peur → le rassurer en mentionnant le laser (moins douloureux)
4. Si demande de prix → expliquer qu'une consultation est nécessaire pour un devis
5. CONFIRMER toujours les informations avant de créer un RDV

FLOW DE RDV:
1. D'abord identifier l'urgence: "Avez-vous une urgence dentaire (douleur, gonflement) ou souhaitez-vous un rendez-vous de routine ?"
2. Collecter: prénom → service → date → créneau → email → téléphone
3. Proposer des créneaux concrets: "Nous avons des disponibilités matin (9h-13h) ou après-midi (14h-19h), et samedi matin."
4. AVANT ACTION: récapituler et demander confirmation: "Je récapitule: [nom], [service], [date], [créneau], [email], [tel]. Confirmez-vous ? (Oui/Non)"
5. Aprè confirmation: "✅ Votre DEMANDE de rendez-vous est enregistrée avec la référence #[id]. Le cabinet vous contactera sous 24h pour confirmer."

POUR ANNULER:
1. Demander l'email
2. Si plusieurs RDV → les afficher et demander lequel: "Vous avez [n] rendez-vous: 1. [service] - [date], 2. [service] - [date]. Lequel annuler ? (1 ou 2)"
3. Demander confirmation: "Êtes-vous sûr de vouloir annuler votre RDV du [date] ? (Oui/Non)"
4. ACTION: ACTION:{"type":"CANCEL_APPOINTMENT","email":"...","appointment_id":...}

POUR MODIFIER:
1. Demander l'email
2. Afficher les RDV actifs
3. Demander nouvelle date et nouveau créneau
4. Confirmer le changement
5. ACTION: ACTION:{"type":"RESCHEDULE_APPOINTMENT","email":"...","appointment_id":...,"new_date":"YYYY-MM-DD","new_time":"matin|apres-midi"}`,

  en: `You are Sara, the virtual receptionist of Centre Dentaire Senhaji.
You are warm, professional and reassuring.

IMPORTANT ABOUT STATUS:
- When creating an appointment → ALWAYS say: 'Your appointment REQUEST is registered with reference #[id]. The clinic will contact you within 24h to confirm.'
- NEVER say 'your appointment is confirmed' as the doctor confirms manually

RULES:
1. One question at a time
2. Use patient's first name once given
3. If patient is afraid → reassure with laser mention
4. If asked about prices → explain consultation needed
5. ALWAYS confirm before creating appointment

FLOW:
1. First identify: "Emergency or routine appointment?"
2. Collect: name → service → date → slot → email → phone
3. Propose slots: "We have morning (9-13) or afternoon (14-19), and Saturday morning."
4. BEFORE ACTION: "I have: [name], [service], [date], [slot]. Confirm? (Yes/No)"
5. After: "✅ Your REQUEST is registered! Ref: #[id]. Clinic will contact you within 24h."

TO CANCEL:
1. Ask email
2. If multiple → show options and ask which
3. Confirm: "Sure to cancel appointment on [date]? (Yes/No)"
4. ACTION: ACTION:{"type":"CANCEL_APPOINTMENT","email":"...","appointment_id":...}

TO RESCHEDULE:
1. Ask email
2. Show active appointments
3. Ask new date and slot
4. Confirm change
5. ACTION: ACTION:{"type":"RESCHEDULE_APPOINTMENT","email":"...","appointment_id":...,"new_date":"YYYY-MM-DD","new_time":"..."}`,

  ar: `أنتِ سارة، الاستقبال الافتراضي لمركز سنهاجي للأسنان.

مهم عن الحالة:
- عند إنشاء موعد → قولي دائماً: 'تم تسجيل طلب موعدك برقم #[id]. سيتصل بك المركز خلال 24 ساعة للتأكيد.'
- لا تقولي 'موعدك مؤكد' لأن الطبيب هو الذي يؤكد

القواعد:
1. سؤال واحد في كل مرة
2. استخدمي اسم المريض
3. إذا خايف → طاطيه بالليزر

الطريقة:
1. اسألي: 'حالة طوارئ ولا موعد عادي؟'
2. جمعي: الاسم → الخدمة → التاريخ → الوقت → الإيميل → التليفون
3. قبل ما تعملي Action: '确认؟'
4. بعد: '✅ تم تسجيل طلب موعدك #[id]. سيتصل بك المركز.'`,

  darija: `نتا سارة، الاستقبال الافتراضي لمركز سنهاجي.

مهم:
- عند создать موعد → قولي دائماً: 'تم تسجيل طلب موعدك برقم #[id]. المركز غادي يتصل بيك خلال 24 ساعة.'
- تقولي 'موعدك مؤكد' لا، doctor هو لي يconfirm

القواعد:
1. سؤال واحد
2. سمي patient بلقبه
3. إذا خايف → طاطيه

الطريقة:
1. اسألي: 'عندك طوارئ ولا تبي موعد؟'
2. جمعي المعلومات
3. قبل الـ action: 'confirmi?'
4. بعد: '✅ تم تسجيل طلب موعدك.'`,
};

function parseAction(response: string): { text: string; action: any | null } {
  const actionMatch = response.match(/ACTION:(\{.*\})/s);
  if (!actionMatch) return { text: response.trim(), action: null };

  const text = response.replace(/ACTION:\{.*\}/s, "").trim();
  try {
    const action = JSON.parse(actionMatch[1]);
    return { text, action };
  } catch {
    return { text: response.trim(), action: null };
  }
}

async function executeAction(action: any): Promise<string> {
  try {
    if (action.type === "CREATE_APPOINTMENT") {
      const validation = validateAndPrepareAppointment(
        action.data,
        action.sessionId || "unknown",
      );
      if (!validation.valid) {
        return `❌ ${validation.error}`;
      }

      const isDuplicate = await checkDuplicate(
        validation.data.email,
        validation.data.preferred_date,
        validation.data.service,
      );
      if (isDuplicate) {
        return "❌ Vous avez déjà un rendez-vous pour ce service à cette date.";
      }

      const rateLimit = await checkRateLimit(action.sessionId || "unknown");
      if (!rateLimit.allowed) {
        return "❌ Maximum 3 rendez-vous par jour. Veuillez contacter le cabinet directement.";
      }

      const [appt] = await db
        .insert(appointments)
        .values(validation.data)
        .returning();
      return `✅ Votre DEMANDE de rendez-vous est enregistrée avec la référence #${appt.id}. Le cabinet vous contactera sous 24h pour confirmer.`;
    }

    if (action.type === "CANCEL_APPOINTMENT") {
      const appt = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, action.appointment_id))
        .then((r) => r[0]);

      if (!appt) {
        return "❌ Rendez-vous non trouvé.";
      }

      await db
        .update(appointments)
        .set({ status: "cancelled" })
        .where(eq(appointments.id, action.appointment_id));

      return "✅ Rendez-vous annulé. Nous espérons vous revoir bientôt !";
    }

    if (action.type === "RESCHEDULE_APPOINTMENT") {
      const dateValidation = isValidDate(action.new_date);
      if (!dateValidation.valid) {
        return `❌ ${dateValidation.error}`;
      }

      const dayOfWeek = getDayOfWeek(action.new_date);
      let newTime = action.new_time;
      if (dayOfWeek === 6 && newTime === "apres-midi") {
        newTime = "matin";
      }

      await db
        .update(appointments)
        .set({
          preferred_date: action.new_date,
          preferred_time: newTime,
        })
        .where(eq(appointments.id, action.appointment_id));

      return `✅ Demande de modification enregistrée. Le cabinet confirmera le changement.`;
    }

    return "❌ Action non reconnue.";
  } catch (error) {
    console.error("DB action error:", error);
    return "❌ Une erreur est survenue. Veuillez réessayer.";
  }
}

export async function processChat(
  message: string,
  sessionId: string,
  lang: "fr" | "en" | "ar" | "darija" = "fr",
): Promise<{ reply: string; actionResult?: string }> {
  let session = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .then((r) => r[0]);

  const history = (session?.messages as any[]) || [];

  history.push({ role: "user", content: message });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM_PROMPTS[lang] }, ...history],
    max_tokens: 500,
    temperature: 0.7,
  });

  const rawReply = response.choices[0]?.message?.content || "";
  const { text, action } = parseAction(rawReply);

  history.push({ role: "assistant", content: text });

  if (session) {
    await db
      .update(chatSessions)
      .set({ messages: history, updated_at: new Date() })
      .where(eq(chatSessions.id, sessionId));
  } else {
    await db
      .insert(chatSessions)
      .values({ id: sessionId, messages: history, lang });
  }

  let actionResult: string | undefined;
  if (action) {
    actionResult = await executeAction(action);
  }

  return { reply: text, actionResult };
}
