import { RequestHandler } from "express";
import fetch from "node-fetch";

export const handleElevenLabsTTS: RequestHandler = async (req, res) => {
  try {
    const { text, voiceId, apiKey: clientApiKey } = req.body;
    const apiKey = clientApiKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: "Missing ElevenLabs API Key. Please provide an API key in voice settings.",
      });
    }

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const selectedVoice = voiceId || "onwK4e9ZLuTAKqWW03F9"; // Default Daniel (Works on Free & Paid tiers)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      let cleanMessage = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.detail?.message) {
          cleanMessage = parsed.detail.message;
        }
      } catch {}
      return res.status(response.status).json({
        error: cleanMessage,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (err: any) {
    console.error("ElevenLabs TTS server error:", err);
    res.status(500).json({ error: err.message || "Failed to generate speech" });
  }
};

export const handleOpenAITTS: RequestHandler = async (req, res) => {
  try {
    const { text, voice, apiKey: clientApiKey } = req.body;
    const apiKey = clientApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: "Missing OpenAI API Key. Please provide an API key in voice settings.",
      });
    }

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice || "onyx",
        input: text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({
        error: `OpenAI TTS error: ${err}`,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (err: any) {
    console.error("OpenAI TTS server error:", err);
    res.status(500).json({ error: err.message || "Failed to generate speech" });
  }
};

