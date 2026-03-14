import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes. Veuillez réessayer plus tard." },
});

const appointmentsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error:
      "Trop de demandes de rendez-vous. Veuillez contacter le cabinet directement.",
  },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Trop de messages. Veuillez patienter." },
});

app.use("/api", globalLimiter);
app.use("/api/appointments", appointmentsLimiter);
app.use("/api/chat", chatLimiter);

app.use("/api", router);

export default app;
