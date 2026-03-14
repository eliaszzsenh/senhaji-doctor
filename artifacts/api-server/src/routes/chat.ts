import { Router } from "express";
import { processChat } from "../lib/chatbot.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, sessionId, lang } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: "message and sessionId required" });
    }

    const result = await processChat(message, sessionId, lang || "fr");

    res.json({
      reply: result.reply,
      actionResult: result.actionResult || null,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
