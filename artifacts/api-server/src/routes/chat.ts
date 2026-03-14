import { Router, type IRouter } from "express";
import { SendChatMessageBody } from "@workspace/api-zod";
import { processChatMessage, executeAction } from "../lib/chatbot.js";

const router: IRouter = Router();

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId, lang } = parsed.data;

  const { reply, action } = await processChatMessage(
    message,
    sessionId,
    lang || "fr",
  );

  let actionResult = undefined;
  if (action) {
    actionResult = await executeAction(action as Record<string, unknown>);
  }

  res.json({
    reply,
    action: actionResult,
  });
});

export default router;
