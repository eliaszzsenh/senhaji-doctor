import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentsRouter from "./appointments";
import contactRouter from "./contact";
import chatRouter from "./chat";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentsRouter);
router.use(contactRouter);
router.use("/chat", chatRouter);
router.use(adminRouter);

export default router;
