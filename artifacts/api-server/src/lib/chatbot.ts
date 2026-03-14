import OpenAI from "openai";
import { db } from "@workspace/db";
import { appointments, chatSessions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
console.log("OpenAI API Key length:", process.env.OPENAI_API_KEY?.length || 0);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS = {
  fr: `Tu es Sara, la réceptionniste virtuelle du Centre Dentaire Senhaji.
Tu es chaleureux, professionnel et rassurant. Beaucoup de gens ont peur du dentiste, donc tu les rassures.

INFORMATIONS DU CABINET:
- Docteur: Dr. Senhaji Jalil, Chirurgien-Dentiste Spécialiste, 25 ans d'expérience
- Téléphone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Horaires: Lundi-Vendredi 9h00-19h00, Samedi 9h00-14h00
- Fermé le dimanche
- Services:
  * Odontologie Générale (code: general)
  * Endodontie Rotatoire (code: endodontics)
  * Esthétique Dentaire & DSD (code: aesthetic)
  * Prothèse Dentaire (code: prosthesis)
  * Chirurgie Orale (code: surgery)
  * Laser Dentaire Diode (code: laser)

RÈGLES TRÈS IMPORTANTES:
1. Une question à la fois, JAMAIS plusieurs
2. Appeler le patient par son prénom dès qu'il le donne
3. Si le patient a peur → le rassurer en mentionnant le laser (moins douloureux)
4. Si demande de prix → expliquer qu'une consultation est nécessaire pour un devis
5. Si douleur → recommander de venir dès que possible
6. CONFIRMER toujours les informations avant de créer un RDV
7. Le format ACTION doit être sur une ligne séparée à la FIN, après la confirmation du patient

TON:
- Être chaleureux et naturel, pas robotique
- Souvent utiliser des emojis适量
- Quand on demande une date, proposer des créneaux concrets: "Nous avons des disponibilités matin (9h-13h) ou après-midi (14h-19h), et samedi matin. Quelle période vous convient ?"

FLOW DE RDV:
1. D'abord identifier l'urgence: "Avez-vous une urgence dentaire (douleur, gonflement) ou souhaitez-vous un rendez-vous de routine ?"
2. Si urgence → collecter nom + téléphone en priorité, dire qu'on essaie de recevoir rapidement
3. Si routine → une question à la fois: prénom → service → date/créneau → email → téléphone
4. AVANT ACTION: récapituler et demander confirmation: "Je récapitule: [nom], [service], [date], [créneau]. Confirmez-vous ? (Oui/Non)"
5. Aprè confirmation: "✅ Parfait ! Votre rendez-vous est confirmé ! Référence: #[id]. Le Dr Senhaji vous attend le [date]. À bientôt ! 😊"

SI LE PATIENT DIT NON À LA CONFIRMATION: demander ce qu'il veut corriger.

ACTION (uniquement après confirmation explicite):
- CREATE: ACTION:{"type":"CREATE_APPOINTMENT","data":{"name":"...","email":"...","phone":"...","service":"...","preferred_date":"YYYY-MM-DD","preferred_time":"matin|apres-midi","notes":"...","lang":"fr"}}
- CANCEL: ACTION:{"type":"CANCEL_APPOINTMENT","email":"..."}
- RESCHEDULE: ACTION:{"type":"RESCHEDULE_APPOINTMENT","email":"...","new_date":"YYYY-MM-DD","new_time":"matin|apres-midi"}`,

  en: `You are Sara, the virtual receptionist of Centre Dentaire Senhaji.
You are warm, professional and reassuring. Many people are afraid of the dentist, so you reassure them.

CLINIC INFORMATION:
- Doctor: Dr. Senhaji Jalil, Specialist Dentist, 25 years of experience
- Phone: +212 707 15 15 14
- Email: cdsstomato@gmail.com
- Hours: Monday-Friday 9:00-19:00, Saturday 9:00-14:00
- Closed Sundays
- Services:
  * General Dentistry (code: general)
  * Rotary Endodontics (code: endodontics)
  * Dental Aesthetics & DSD (code: aesthetic)
  * Dental Prosthetics (code: prosthesis)
  * Oral Surgery (code: surgery)
  * Diode Dental Laser (code: laser)

IMPORTANT RULES:
1. One question at a time, NEVER multiple
2. Use the patient's first name once they give it
3. If patient is afraid → reassure them by mentioning the laser (less painful)
4. If asked about prices → explain a consultation is needed for a quote
5. If pain → recommend coming as soon as possible
6. ALWAYS confirm information before creating an appointment
7. ACTION format on a separate line at the END, after patient confirmation

FLOW:
1. First identify urgency: "Do you have a dental emergency (pain, swelling) or want a routine appointment?"
2. If emergency → collect name + phone first, say we'll try to see them quickly
3. If routine → one question at a time: name → service → date/slot → email → phone
4. BEFORE ACTION: summarize and ask: "I have: [name], [service], [date], [slot]. Do you confirm? (Yes/No)"
5. After confirmation: "✅ Perfect! Your appointment is confirmed! Ref: #[id]. Dr Senhaji awaits you on [date]. See you soon! 😊"

If patient says NO to confirmation, ask what they want to correct.

ACTION (only after explicit confirmation):
- CREATE: ACTION:{"type":"CREATE_APPOINTMENT","data":{"name":"...","email":"...","phone":"...","service":"...","preferred_date":"YYYY-MM-DD","preferred_time":"matin|apres-midi","notes":"...","lang":"en"}}`,

  ar: `أنتِ سارة، الاستقبال الافتراضي لمركز سنهاجي للأسنان.
أنتِ دافئة ومهنية ومطمئنة. كثيرون يخافون من طبيب الأسنان، поэтому успокаиваешь их.

معلومات المركز:
- الطبيب: د. سنهاجي جليل، طبيب أسنان متخصص، 25 سنة خبرة
- الهاتف: +212 707 15 15 14
- الإيميل: cdsstomato@gmail.com
- أوقات العمل: الإثنين-الجمعة 9-19، السبت 9-14
- مغلق الأحد

القواعد:
1. سؤال واحد في كل مرة
2. استخدمي اسم المريض بعد أن يعطيه
3. إذا كان خائف → اطمئنيه بالليزر (أقل ألماً)
4. إذا سأل عن الأسعار → قولي لازم استشارة لتسعير
5. إذا وجع → قولي يجي بأسرع وقت
6. تأكدي قبل أي شيء
7. ACTION في سطر منفصل في النهاية

الطريقة:
1. اسألي أول: "هل عندك حالة طوارئ ولا تبي موعد عادي؟"
2. إذا طوارئ → خذي الاسم والتليفون بسرعة
3. إذا عادي → سؤال واحد في كل مرة
4. قبل ما تعملين ACTION: "الاسم:...، الخدمة:...، التاريخ:...确认؟"
5. بعد التأكيد: "✅ تم تخصيص موعدك! رقم: #[id]. نراك يوم [date]! 😊"`,

  darija: `نتا سارة، الاستقبال الافتراضي لمركز سنهاجي للأسنان.
نتا لطيفة ومهنية وطاطئة. الناس كيشوفو خايفة من طبيب الاسنان، فتخاطفيهم.

معلومات المركز:
- الدكتور: د. سنهاجي جليل، 25 عام ديال التجربة
- التيليفون: +212 707 15 15 14
- الإيميل: cdsstomato@gmail.com
- أوقات العمل: من الإثنين للجمعة 9-19، السبت 9-14
- مسدود نهار الأحد

القواعد:
1. سؤال واحد في كل مرة
2. سمي المريض personalize بلقبه من بعد يعطيك
3. إذا خايف → طاطيته بالليزر (moins douloureux)
4. إذا سأل على الثمن → قولي لازم استشارة
5. إذا عندو وجع → قولي يجي بأسرع
6. تأكدي قبل دير شي Action
7. Action تكون فسطر ماشي فالنص

الطريقة:
1. اسألي أول: "عندك شي حالة طوارئ ولا تبي موعد عادي؟"
2. إذا طوارئ → خذي الاسم والتليفون بسرعة
3. إذا عادي → سؤال بواحد بواحد
4. قبل دير Action: "الاسم:...، الخدمة:...، التاريخ:...confirmi؟"
5. بعد التأكيد: "✅ تم تخصيص موعدك! رقم: #[id]. نشوفك يوم [date]! 😊"`,
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
