type SessionState = {
  step: string;
  data: Record<string, string>;
};

const sessions = new Map<string, SessionState>();

const SERVICES = [
  "Odontología General & Conservadora",
  "Endodoncia Rotatoria",
  "Estética Dental & DSD",
  "Prótesis Dental",
  "Cirugía Oral",
  "Láser Dental de Diodo",
];

const OPENING_HOURS = "Lunes a Viernes: 9:00 - 19:00\nSábado: 9:00 - 14:00\nDomingo: Cerrado";

const CONTACT_INFO = "📞 Teléfono: +212 707 15 15 14\n📧 Email: cdsstomato@gmail.com\n📍 Casablanca, Marruecos (con atención a pacientes de Valencia, España)";

function getOrCreateSession(sessionId: string): SessionState {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { step: "idle", data: {} });
  }
  return sessions.get(sessionId)!;
}

function resetSession(sessionId: string): void {
  sessions.set(sessionId, { step: "idle", data: {} });
}

function detectIntent(message: string): string {
  const msg = message.toLowerCase().trim();

  if (/\b(reservar|reserva|cita|book|appointment|agendar|quiero cita|necesito cita)\b/.test(msg)) return "book";
  if (/\b(ver cita|mis citas|consultar cita|check appointment|estado cita)\b/.test(msg)) return "view";
  if (/\b(cancelar|cancel|anular|borrar cita)\b/.test(msg)) return "cancel";
  if (/\b(cambiar|reschedule|reprogramar|reagendar|nueva fecha|otro día)\b/.test(msg)) return "reschedule";
  if (/\b(servicio|tratamiento|servicos|tratamientos|que ofrecen|que hacen|especialidad)\b/.test(msg)) return "services";
  if (/\b(contacto|teléfono|email|dirección|donde|ubicación|contact)\b/.test(msg)) return "contact";
  if (/\b(horario|hora|horarios|schedule|abierto|abre|cierra)\b/.test(msg)) return "hours";
  if (/\b(hola|hi|hello|buenos días|buenas|saludos|hey)\b/.test(msg)) return "greeting";
  if (/\b(gracias|thank|perfecto|genial|ok|okay|bien|vale|listo)\b/.test(msg)) return "thanks";
  if (/\b(menu|ayuda|help|opciones|que puedes|que haces)\b/.test(msg)) return "menu";

  return "fallback";
}

const QUICK_REPLIES_MAIN = ["Reservar cita", "Ver mis citas", "Servicios", "Contacto"];

export async function processChatMessage(
  message: string,
  sessionId: string,
  createAppointment: (data: Record<string, string>) => Promise<{ id: number }>,
  getAppointmentsByEmail: (email: string) => Promise<unknown[]>,
  cancelAppointment: (id: number) => Promise<boolean>,
  updateAppointment: (id: number, data: Record<string, string>) => Promise<boolean>
): Promise<{ reply: string; action?: string; quickReplies?: string[] }> {
  const session = getOrCreateSession(sessionId);

  // Handle multi-turn flows
  if (session.step !== "idle") {
    return handleFlow(message, sessionId, session, createAppointment, getAppointmentsByEmail, cancelAppointment, updateAppointment);
  }

  const intent = detectIntent(message);

  switch (intent) {
    case "greeting":
      return {
        reply: "¡Hola! Soy el asistente virtual del Dr. Senhaji Jalil 👋\n\n¿En qué puedo ayudarte hoy? Puedo ayudarte a reservar una cita, consultar tus citas, informarte sobre nuestros tratamientos o darte información de contacto.",
        quickReplies: QUICK_REPLIES_MAIN,
      };

    case "book":
      session.step = "book_name";
      session.data = {};
      return {
        reply: "¡Perfecto! Voy a ayudarte a reservar tu cita con el Dr. Senhaji Jalil. 😊\n\n¿Cuál es tu nombre completo?",
      };

    case "view":
      session.step = "view_email";
      session.data = {};
      return {
        reply: "Para consultar tus citas, necesito tu dirección de email. ¿Cuál es?",
      };

    case "cancel":
      session.step = "cancel_email";
      session.data = {};
      return {
        reply: "Para cancelar tu cita, necesito tu email y el número de cita. Primero, ¿cuál es tu email?",
      };

    case "reschedule":
      session.step = "reschedule_email";
      session.data = {};
      return {
        reply: "Para reprogramar tu cita, necesito tu email. ¿Cuál es?",
      };

    case "services":
      return {
        reply: `🦷 Nuestros tratamientos disponibles:\n\n${SERVICES.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n¿Te gustaría reservar una cita para alguno de estos servicios?`,
        quickReplies: ["Reservar cita", "Más información", "Contacto"],
      };

    case "contact":
      return {
        reply: `📋 Información de contacto del Dr. Senhaji Jalil:\n\n${CONTACT_INFO}\n\nActualmente atendemos pacientes de Valencia, España con citas presenciales en Casablanca.`,
        quickReplies: QUICK_REPLIES_MAIN,
      };

    case "hours":
      return {
        reply: `🕐 Horario de atención:\n\n${OPENING_HOURS}\n\n¿Deseas reservar una cita?`,
        quickReplies: ["Reservar cita", "Contacto"],
      };

    case "thanks":
      resetSession(sessionId);
      return {
        reply: "¡De nada! Estamos aquí para ayudarte. 😊 Si necesitas algo más, no dudes en preguntar.",
        quickReplies: QUICK_REPLIES_MAIN,
      };

    case "menu":
      return {
        reply: "Puedo ayudarte con:\n\n• 📅 Reservar una cita\n• 🔍 Ver tus citas\n• ❌ Cancelar una cita\n• 🔄 Reprogramar una cita\n• 🦷 Información sobre servicios\n• 📞 Información de contacto\n• 🕐 Horarios\n\n¿Qué necesitas?",
        quickReplies: QUICK_REPLIES_MAIN,
      };

    default:
      return {
        reply: "No entendí tu mensaje. Puedo ayudarte con reservas, consultar citas, información sobre servicios y horarios. ¿En qué puedo ayudarte?",
        quickReplies: QUICK_REPLIES_MAIN,
      };
  }
}

async function handleFlow(
  message: string,
  sessionId: string,
  session: SessionState,
  createAppointment: (data: Record<string, string>) => Promise<{ id: number }>,
  getAppointmentsByEmail: (email: string) => Promise<unknown[]>,
  cancelAppointment: (id: number) => Promise<boolean>,
  updateAppointment: (id: number, data: Record<string, string>) => Promise<boolean>
): Promise<{ reply: string; action?: string; quickReplies?: string[] }> {
  const msg = message.trim();

  // BOOK FLOW
  if (session.step === "book_name") {
    session.data.name = msg;
    session.step = "book_service";
    return {
      reply: `Encantado, ${msg}! 😊\n\n¿Qué servicio necesitas?\n\n${SERVICES.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nResponde con el número o nombre del servicio.`,
    };
  }

  if (session.step === "book_service") {
    const num = parseInt(msg);
    if (num >= 1 && num <= SERVICES.length) {
      session.data.service = SERVICES[num - 1];
    } else {
      const match = SERVICES.find((s) => s.toLowerCase().includes(msg.toLowerCase()));
      if (match) {
        session.data.service = match;
      } else {
        return {
          reply: `Por favor elige un servicio válido (1-${SERVICES.length}):\n\n${SERVICES.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
        };
      }
    }
    session.step = "book_date";
    return {
      reply: `Perfecto, ${session.data.service}. ¿Cuál es tu fecha preferida? (por ejemplo: 2025-03-20)`,
    };
  }

  if (session.step === "book_date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(msg) && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(msg)) {
      return { reply: "Por favor indica la fecha en formato AAAA-MM-DD (por ejemplo: 2025-03-20)" };
    }
    session.data.preferred_date = msg;
    session.step = "book_time";
    return {
      reply: "¿Prefieres atención por la Mañana (9:00-13:00) o por la Tarde (14:00-19:00)?",
      quickReplies: ["Mañana", "Tarde"],
    };
  }

  if (session.step === "book_time") {
    const lower = msg.toLowerCase();
    if (lower.includes("mañana") || lower.includes("manana") || lower === "morning") {
      session.data.preferred_time = "Mañana";
    } else if (lower.includes("tarde") || lower === "afternoon") {
      session.data.preferred_time = "Tarde";
    } else {
      return {
        reply: "¿Prefieres atención por la Mañana o por la Tarde?",
        quickReplies: ["Mañana", "Tarde"],
      };
    }
    session.step = "book_email";
    return { reply: "¿Cuál es tu dirección de email?" };
  }

  if (session.step === "book_email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
      return { reply: "Por favor introduce un email válido." };
    }
    session.data.email = msg;
    session.step = "book_phone";
    return { reply: "¿Y tu número de teléfono?" };
  }

  if (session.step === "book_phone") {
    session.data.phone = msg;
    session.step = "book_confirm";
    return {
      reply: `Perfecto! Voy a confirmar tu cita:\n\n👤 Nombre: ${session.data.name}\n🦷 Servicio: ${session.data.service}\n📅 Fecha: ${session.data.preferred_date}\n🕐 Horario: ${session.data.preferred_time}\n📧 Email: ${session.data.email}\n📞 Teléfono: ${session.data.phone}\n\n¿Confirmas la cita?`,
      quickReplies: ["Sí, confirmar", "Cancelar"],
    };
  }

  if (session.step === "book_confirm") {
    const lower = msg.toLowerCase();
    if (lower.includes("sí") || lower.includes("si") || lower.includes("confirm") || lower.includes("yes")) {
      try {
        const appt = await createAppointment(session.data);
        resetSession(sessionId);
        return {
          reply: `✅ ¡Cita reservada con éxito! Tu número de cita es #${appt.id}.\n\nRecibirás confirmación en ${session.data.email}. El Dr. Senhaji Jalil te atenderá el ${session.data.preferred_date} por la ${session.data.preferred_time}.\n\n¿Necesitas algo más?`,
          action: "appointment_created",
          quickReplies: QUICK_REPLIES_MAIN,
        };
      } catch {
        resetSession(sessionId);
        return {
          reply: "Hubo un error al reservar tu cita. Por favor inténtalo de nuevo o contacta directamente: +212 707 15 15 14",
          quickReplies: QUICK_REPLIES_MAIN,
        };
      }
    } else {
      resetSession(sessionId);
      return {
        reply: "Reserva cancelada. ¿Puedo ayudarte con algo más?",
        quickReplies: QUICK_REPLIES_MAIN,
      };
    }
  }

  // VIEW FLOW
  if (session.step === "view_email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
      return { reply: "Por favor introduce un email válido." };
    }
    try {
      const appointments = await getAppointmentsByEmail(msg) as Array<Record<string, unknown>>;
      resetSession(sessionId);
      if (appointments.length === 0) {
        return {
          reply: `No encontré citas para el email ${msg}. ¿Deseas reservar una nueva cita?`,
          quickReplies: ["Reservar cita", "Contacto"],
        };
      }
      const list = appointments
        .map((a) => `📋 Cita #${a.id}\n   Servicio: ${a.service}\n   Fecha: ${a.preferred_date} - ${a.preferred_time}\n   Estado: ${a.status}`)
        .join("\n\n");
      return {
        reply: `Tus citas:\n\n${list}\n\n¿Necesitas algo más?`,
        quickReplies: QUICK_REPLIES_MAIN,
      };
    } catch {
      resetSession(sessionId);
      return { reply: "Error al buscar tus citas. Por favor intenta de nuevo.", quickReplies: QUICK_REPLIES_MAIN };
    }
  }

  // CANCEL FLOW
  if (session.step === "cancel_email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
      return { reply: "Por favor introduce un email válido." };
    }
    session.data.email = msg;
    session.step = "cancel_id";
    return { reply: "¿Cuál es el número de tu cita? (por ejemplo: 5)" };
  }

  if (session.step === "cancel_id") {
    const id = parseInt(msg);
    if (isNaN(id)) {
      return { reply: "Por favor introduce un número de cita válido." };
    }
    session.data.appointmentId = msg;
    session.step = "cancel_confirm";
    return {
      reply: `¿Confirmas la cancelación de la cita #${id}?`,
      quickReplies: ["Sí, cancelar", "No, mantener"],
    };
  }

  if (session.step === "cancel_confirm") {
    const lower = msg.toLowerCase();
    if (lower.includes("sí") || lower.includes("si") || lower.includes("cancel") || lower.includes("yes")) {
      try {
        const ok = await cancelAppointment(parseInt(session.data.appointmentId));
        resetSession(sessionId);
        if (ok) {
          return { reply: `✅ Tu cita #${session.data.appointmentId} ha sido cancelada. ¿Puedo ayudarte con algo más?`, quickReplies: QUICK_REPLIES_MAIN };
        } else {
          return { reply: "No encontré esa cita. Verifica el número e inténtalo de nuevo.", quickReplies: QUICK_REPLIES_MAIN };
        }
      } catch {
        resetSession(sessionId);
        return { reply: "Error al cancelar la cita. Por favor contacta directamente: +212 707 15 15 14", quickReplies: QUICK_REPLIES_MAIN };
      }
    } else {
      resetSession(sessionId);
      return { reply: "Cancelación abortada. Tu cita sigue activa. ¿Puedo ayudarte con algo más?", quickReplies: QUICK_REPLIES_MAIN };
    }
  }

  // RESCHEDULE FLOW
  if (session.step === "reschedule_email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
      return { reply: "Por favor introduce un email válido." };
    }
    session.data.email = msg;
    session.step = "reschedule_id";
    return { reply: "¿Cuál es el número de la cita que quieres reprogramar?" };
  }

  if (session.step === "reschedule_id") {
    const id = parseInt(msg);
    if (isNaN(id)) {
      return { reply: "Por favor introduce un número de cita válido." };
    }
    session.data.appointmentId = msg;
    session.step = "reschedule_date";
    return { reply: "¿Cuál es la nueva fecha que prefieres? (AAAA-MM-DD)" };
  }

  if (session.step === "reschedule_date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(msg)) {
      return { reply: "Por favor indica la fecha en formato AAAA-MM-DD (por ejemplo: 2025-03-25)" };
    }
    session.data.preferred_date = msg;
    session.step = "reschedule_time";
    return { reply: "¿Mañana o Tarde?", quickReplies: ["Mañana", "Tarde"] };
  }

  if (session.step === "reschedule_time") {
    const lower = msg.toLowerCase();
    if (lower.includes("mañana") || lower.includes("manana")) {
      session.data.preferred_time = "Mañana";
    } else if (lower.includes("tarde")) {
      session.data.preferred_time = "Tarde";
    } else {
      return { reply: "¿Mañana o Tarde?", quickReplies: ["Mañana", "Tarde"] };
    }
    try {
      const ok = await updateAppointment(parseInt(session.data.appointmentId), {
        preferred_date: session.data.preferred_date,
        preferred_time: session.data.preferred_time,
      });
      resetSession(sessionId);
      if (ok) {
        return {
          reply: `✅ Tu cita #${session.data.appointmentId} ha sido reprogramada para el ${session.data.preferred_date} por la ${session.data.preferred_time}. ¿Necesitas algo más?`,
          action: "appointment_updated",
          quickReplies: QUICK_REPLIES_MAIN,
        };
      } else {
        return { reply: "No encontré esa cita. Verifica el número e inténtalo de nuevo.", quickReplies: QUICK_REPLIES_MAIN };
      }
    } catch {
      resetSession(sessionId);
      return { reply: "Error al reprogramar. Por favor contacta: +212 707 15 15 14", quickReplies: QUICK_REPLIES_MAIN };
    }
  }

  // Fallback
  resetSession(sessionId);
  return {
    reply: "Lo siento, no pude procesar tu solicitud. ¿En qué puedo ayudarte?",
    quickReplies: QUICK_REPLIES_MAIN,
  };
}
