export * from "./appointments";
export * from "./contact_messages";
export * from "./chat_sessions";

import { appointmentsTable } from "./appointments";
import { chatSessionsTable } from "./chat_sessions";

export const appointments = appointmentsTable;
export const chatSessions = chatSessionsTable;
