import OpenAI from "openai";
import { db } from "@workspace/db";
import { appointments, chatSessions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS = {
  fr: `Tu es l'assistant virtuel du Centre Dentaire Senhaji.
Réponds TOUJOURS en français.

INFORMATIONS DU CABINET:
- Docteur: Dr. Senhaji Jalil, Chirurgien-Dentiste Spécialiste, 25 ans d'expérience
- Téléphone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Horaires: Lundi-Vendredi 9h00-19h00, Samedi 9h00-14h00
- Fermé le dimanche
- Services proposés:
  * Odontologie Générale (code: general)
  * Endodontie Rotatoire - dévitalisation (code: endodoncia)
  * Esthétique Dentaire & DSD - facettes, blanchiment (code: estetica)
  * Prothèse Dentaire - bridge, couronne, dentier (code: protesis)
  * Chirurgie Orale - extraction dents de sagesse (code: cirugia)
  * Laser Dentaire Diode (code: laser)

TU PEUX FAIRE EXACTEMENT 4 CHOSES:

1. PRENDRE UN RENDEZ-VOUS
Collecte ces informations UNE PAR UNE dans cet ordre:
- Prénom et nom complet
- Service souhaité (propose la liste)
- Date souhaitée (format YYYY-MM-DD)
- Créneau: matin (9h-13h) ou après-midi (14h-19h)
- Email
- Numéro de téléphone
- Notes particulières (optionnel)

Quand tu as TOUT, réponds avec ce JSON sur une ligne séparée à la FIN:
ACTION:{"type":"CREATE_APPOINTMENT","data":{"name":"...","email":"...","phone":"...","service":"general|endodontics|estetica|protesis|cirugia|laser","preferred_date":"YYYY-MM-DD","preferred_time":"matin|apres-midi","notes":"...","lang":"fr"}}

2. ANNULER UN RENDEZ-VOUS
Demande l'email du patient.
Quand tu l'as:
ACTION:{"type":"CANCEL_APPOINTMENT","email":"..."}

3. MODIFIER UN RENDEZ-VOUS (changer date/heure)
Demande email, nouvelle date et nouveau créneau.
Quand tu as tout:
ACTION:{"type":"RESCHEDULE_APPOINTMENT","email":"...","new_date":"YYYY-MM-DD","new_time":"matin|apres-midi"}

4. INFORMATIONS
Réponds directement avec les infos du cabinet.

RÈGLES IMPORTANTES:
- Pose les questions UNE PAR UNE, jamais toutes en même temps
- Sois chaleureux, professionnel et rassurant
- Si la date demandée est un dimanche ou hors horaires, propose une alternative
- Confirme toujours les informations avant d'exécuter une action
- Le format ACTION doit être sur une ligne séparée tout à la FIN de ta réponse
- Ne mets jamais ACTION au milieu du texte`,

  en: `You are the virtual assistant of Centre Dentaire Senhaji.
ALWAYS respond in English.

CLINIC INFORMATION:
- Doctor: Dr. Senhaji Jalil, Specialist Dentist, 25 years of experience
- Phone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Hours: Monday-Friday 9:00-19:00, Saturday 9:00-14:00
- Closed on Sundays
- Services:
  * General Dentistry (code: general)
  * Rotary Endodontics - root canal (code: endodontics)
  * Dental Aesthetics & DSD - veneers, whitening (code: estetica)
  * Dental Prosthetics - bridge, crown, denture (code: protesis)
  * Oral Surgery - wisdom tooth extraction (code: cirugia)
  * Diode Dental Laser (code: laser)

YOU CAN DO EXACTLY 4 THINGS:

1. BOOK AN APPOINTMENT
Collect these ONE BY ONE in this order:
- Full name
- Desired service (offer the list)
- Preferred date (YYYY-MM-DD format)
- Time slot: morning (9h-13h) or afternoon (14h-19h)
- Email
- Phone number
- Special notes (optional)

When you have EVERYTHING, respond with this JSON on a separate line at the END:
ACTION:{"type":"CREATE_APPOINTMENT","data":{"name":"...","email":"...","phone":"...","service":"general|endodontics|estetica|protesis|cirugia|laser","preferred_date":"YYYY-MM-DD","preferred_time":"matin|apres-midi","notes":"...","lang":"en"}}

2. CANCEL AN APPOINTMENT
Ask for patient email.
ACTION:{"type":"CANCEL_APPOINTMENT","email":"..."}

3. RESCHEDULE AN APPOINTMENT
Ask for email, new date and new time slot.
ACTION:{"type":"RESCHEDULE_APPOINTMENT","email":"...","new_date":"YYYY-MM-DD","new_time":"matin|apres-midi"}

4. INFORMATION
Answer directly with clinic info.

RULES:
- Ask questions ONE BY ONE, never all at once
- Be warm, professional and reassuring
- Confirm all info before executing an action
- ACTION format must be on a separate line at the very END`,

  ar: `أنت المساعد الافتراضي لمركز سنهاجي للأسنان.
أجب دائماً باللغة العربية الفصحى.

معلومات المركز:
- الطبيب: د. سنهاجي جليل، طبيب أسنان متخصص، 25 سنة خبرة
- الهاتف: +212 707 15 15 14
- البريد الإلكتروني: cdsstomato@gmail.com
- ساعات العمل: الإثنين-الجمعة 9:00-19:00، السبت 9:00-14:00
- مغلق الأحد
- الخدمات:
  * طب الأسنان العام (الرمز: general)
  * علاج جذور الأسنان (الرمز: endodontics)
  * تجميل الأسنان والابتسامة الرقمية (الرمز: estetica)
  * تركيبات الأسنان (الرمز: protesis)
  * جراحة الفم وخلع ضرس العقل (الرمز: cirugia)
  * ليزر الأسنان (الرمز: laser)

يمكنك فعل 4 أشياء فقط:
1. حجز موعد - اجمع المعلومات واحدة تلو الأخرى
2. إلغاء موعد - اطلب البريد الإلكتروني
3. تغيير موعد - اطلب البريد والتاريخ الجديد
4. معلومات - أجب مباشرة

نفس تنسيق ACTION كما في الإنجليزية.
القواعد: سؤال واحد في كل مرة، كن ودوداً ومحترفاً.`,

  darija: `نتا المساعد الافتراضي ديال مركز سنهاجي للأسنان.
جاوب ديما بالدارجة المغربية.

معلومات المركز:
- الدكتور: د. سنهاجي جليل، طبيب أسنان متخصص، عندو 25 عام ديال التجربة
- التيليفون: +212 707 15 15 14
- الإيميل: cdsstomato@gmail.com
- أوقات العمل: من الإثنين للجمعة 9:00-19:00، السبت 9:00-14:00
- مسدود نهار الأحد
- الخدمات:
  * طب الأسنان العام (الكود: general)
  * علاج العصب (الكود: endodontics)
  * تجميل牙齿 والابتسامة الرقمية (الكود: estetica)
  * التركيبات (الكود: protesis)
  * جراحة الفم وخلع ضرس العقل (الكود: cirugia)
  * ليزر الأسنان (الكود: laser)

قادر دير 4 حوايج غير:
1. حجز ميعاد - اجمع المعلومات واحدة واحدة
2. إلغاء ميعاد - طلب الإيميل
3. تبديل ميعاد - طلب الإيميل والتاريخ الجديد
4. معلومات - جاوب مباشرة

نفس تنسيق ACTION كما فوق.
القواعد: سؤال واحد في كل مرة، كن لطيف ومحترف.`,
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
      const [appt] = await db
        .insert(appointments)
        .values(action.data)
        .returning();
      return `✅ Rendez-vous confirmé ! Référence: #${appt.id}. Nous vous attendons le ${appt.preferred_date} (${appt.preferred_time === "matin" ? "matin" : "après-midi"}).`;
    }

    if (action.type === "CANCEL_APPOINTMENT") {
      const userAppts = await db
        .select()
        .from(appointments)
        .where(eq(appointments.email, action.email));

      if (userAppts.length === 0) {
        return `❌ Aucun rendez-vous trouvé pour l'email ${action.email}.`;
      }

      const activeAppts = userAppts.filter(
        (a: any) => a.status !== "cancelled",
      );
      if (activeAppts.length === 0) {
        return `❌ Vous n'avez pas de rendez-vous actif à annuler.`;
      }

      const toCancel = activeAppts[activeAppts.length - 1];
      await db
        .update(appointments)
        .set({ status: "cancelled" })
        .where(eq(appointments.id, toCancel.id));

      return `✅ Votre rendez-vous du ${toCancel.preferred_date} a été annulé avec succès.`;
    }

    if (action.type === "RESCHEDULE_APPOINTMENT") {
      const userAppts = await db
        .select()
        .from(appointments)
        .where(eq(appointments.email, action.email));

      const activeAppts = userAppts.filter(
        (a: any) => a.status !== "cancelled",
      );
      if (activeAppts.length === 0) {
        return `❌ Aucun rendez-vous actif trouvé pour cet email.`;
      }

      const toReschedule = activeAppts[activeAppts.length - 1];
      await db
        .update(appointments)
        .set({
          preferred_date: action.new_date,
          preferred_time: action.new_time,
        })
        .where(eq(appointments.id, toReschedule.id));

      return `✅ Rendez-vous modifié ! Nouveau créneau: ${action.new_date} (${action.new_time === "matin" ? "matin" : "après-midi"}).`;
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
