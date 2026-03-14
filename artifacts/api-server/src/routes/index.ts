import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentsRouter from "./appointments";
import contactRouter from "./contact";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentsRouter);
router.use(contactRouter);
router.use(chatRouter);

export default router;
