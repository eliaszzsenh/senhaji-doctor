import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { CreateContactMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = CreateContactMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(contactMessagesTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  res.status(201).json({ success: true, message: "Mensaje recibido. Te contactaremos pronto." });
});

export default router;
