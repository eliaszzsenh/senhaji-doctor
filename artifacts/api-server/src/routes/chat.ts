import { Router } from "express";
import { processChat } from "../lib/chatbot.js";

const router = Router();

router.post("/", async (req, res) => {
  console.log("=== CHAT REQUEST ===", JSON.stringify(req.body));

  try {
    const { message, sessionId, lang } = req.body;

    if (!message || !sessionId) {
      console.log("=== CHAT ERROR: missing params ===");
      return res.status(400).json({ error: "message and sessionId required" });
    }

    const result = await processChat(message, sessionId, lang || "fr");
    console.log("=== CHAT RESPONSE ===", JSON.stringify(result));

    res.json({
      reply: result.reply,
      actionResult: result.actionResult || null,
    });
  } catch (error) {
    console.error("=== CHAT ERROR ===", error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
