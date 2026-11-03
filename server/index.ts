import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGenerateNotice } from "./routes/legal-notice";
import { handleElevenLabsTTS, handleOpenAITTS } from "./routes/tts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/generate-notice", handleGenerateNotice);
  app.post("/api/tts/elevenlabs", handleElevenLabsTTS);
  app.post("/api/tts/openai", handleOpenAITTS);

  return app;
}
