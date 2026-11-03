import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Scale,
  Send,
  RotateCcw,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Settings,
  Radio,
  Sliders,
  Headphones,
  Key,
  Play,
  Square,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

type VoiceProvider = "elevenlabs" | "openai" | "browser";

interface VoiceConfig {
  provider: VoiceProvider;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  openaiApiKey: string;
  openaiVoice: string;
  browserVoiceURI: string;
  speechRate: number;
}

const DEFAULT_CONFIG: VoiceConfig = {
  provider: "elevenlabs",
  elevenLabsApiKey: "sk_6e0e3a61acb11441163f9c35b5fafb7877cf0d35246cbed4",
  elevenLabsVoiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel (Authoritative Senior Advocate)
  openaiApiKey: "",
  openaiVoice: "onyx", // Deep, authoritative Senior Advocate
  browserVoiceURI: "",
  speechRate: 1.0,
};

const ELEVENLABS_VOICES = [
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Senior Advocate - Authoritative & Formal)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (Crisp & Articulate Courtroom Advocate)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Confident & Clear)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Polished & Professional Advocate)" },
  { id: "SOYHLrjzK2X1ezoPC6cr", name: "Harry (Serious & Confident)" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold (Mature & Distinguished)" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily (Warm & Articulate Counsel)" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (Clear & Conversational)" },
];

const OPENAI_VOICES = [
  { id: "onyx", name: "Onyx (Deep, Authoritative Advocate - Recommended)" },
  { id: "nova", name: "Nova (Warm, Articulate & Empathetic)" },
  { id: "alloy", name: "Alloy (Balanced & Crisp)" },
  { id: "echo", name: "Echo (Dynamic & Confident)" },
  { id: "fable", name: "Fable (Expressive & Clear)" },
  { id: "shimmer", name: "Shimmer (Bright & Professional)" },
];

const SAMPLE_VOICE_PROMPTS = [
  "My landlord refuses to return my ₹60,000 security deposit. 2 months passed.",
  "Company deducted 1 month salary when I resigned with 15 days notice.",
  "E-commerce delivered a damaged phone and rejected my replacement request.",
  "Police stopped my car at night and asked to inspect my WhatsApp messages.",
];

/**
 * Phonetically normalizes Indian legal terms, sections, and currency numbers
 * so speech engines pronounce them clearly and accurately.
 */
function cleanAndEnhanceSpeechText(text: string): string {
  let clean = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`_~>]/g, "")
    .replace(/[⚖️🎙️🚨⏰🔍✍️🟢🟡🟠🔴🛡️📋📥•✨💡]/g, "")
    .replace(/\n\s*-\s*/g, ". ")
    .replace(/\n+/g, ". ");

  // Expand Currency & Indian numbering format (e.g., ₹60,000 -> 60 thousand rupees)
  clean = clean.replace(/₹\s*(\d+(?:,\d+)*)/g, (_match, p1) => {
    const num = parseInt(p1.replace(/,/g, ""), 10);
    if (isNaN(num)) return p1 + " rupees";
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} crore rupees`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} lakh rupees`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} thousand rupees`;
    return `${num} rupees`;
  });

  // Common Indian Legal Acronyms & Pronunciations
  clean = clean
    .replace(/\bu\/s\b/gi, "under section")
    .replace(/\bSec\.?\s*(\d+)/gi, "Section $1")
    .replace(/\bNI Act\b/gi, "Negotiable Instruments Act")
    .replace(/\bBNS\b/gi, "Bharatiya Nyaya Sanhita")
    .replace(/\bBNSS\b/gi, "Bharatiya Nagarik Suraksha Sanhita")
    .replace(/\bIPC\b/gi, "Indian Penal Code")
    .replace(/\bCrPC\b/gi, "Code of Criminal Procedure")
    .replace(/\bFIR\b/g, "F. I. R.")
    .replace(/\bvs\.?\b|\bv\.\b/gi, "versus")
    .replace(/\bp\.a\.\b/gi, "per annum")
    .replace(/\bHon'ble\b/gi, "Honourable")
    .replace(/\bAdv\.?\b/gi, "Advocate")
    .replace(/\bSARFAESI\b/gi, "Sarfaesi Act")
    .replace(/\s+/g, " ")
    .trim();

  return clean;
}

export default function NyayaVoice() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am your NyayaPath AI Advocate. You can speak or type your legal problem in English, Hindi, or Hinglish. Tap the microphone or select a common situation below to begin.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en" | "hi">("en");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Voice Settings State with LocalStorage Persistence
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(() => {
    try {
      const saved = localStorage.getItem("nyaya_voice_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        const validVoice = ELEVENLABS_VOICES.some(
          (v) => v.id === parsed.elevenLabsVoiceId
        )
          ? parsed.elevenLabsVoiceId
          : DEFAULT_CONFIG.elevenLabsVoiceId;

        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          elevenLabsApiKey: parsed.elevenLabsApiKey || DEFAULT_CONFIG.elevenLabsApiKey,
          elevenLabsVoiceId: validVoice,
          provider: "elevenlabs",
        };
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Browser voices list
  const [availableBrowserVoices, setAvailableBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Save config changes
  useEffect(() => {
    try {
      localStorage.setItem("nyaya_voice_config", JSON.stringify(voiceConfig));
    } catch (e) {
      console.warn("Could not save voice settings:", e);
    }
  }, [voiceConfig]);

  // Load browser voices
  useEffect(() => {
    const updateVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        // Sort Natural / Neural / Indian English / Hindi voices to the top
        const sorted = [...voices].sort((a, b) => {
          const aPriority = /natural|neural|online|india|hi-in|en-in/i.test(a.name + a.lang);
          const bPriority = /natural|neural|online|india|hi-in|en-in/i.test(b.name + b.lang);
          return (bPriority ? 1 : 0) - (aPriority ? 1 : 0);
        });
        setAvailableBrowserVoices(sorted);
      }
    };

    updateVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... speak your legal query clearly.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone in browser.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopSpeaking();
    };
  }, [selectedLang]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsGeneratingAudio(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.lang = selectedLang === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  /**
   * High quality multi-engine Speech Output (ElevenLabs -> OpenAI -> Enhanced Browser)
   */
  const speakText = async (rawText: string) => {
    if (isSpeaking || isGeneratingAudio) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const cleanText = cleanAndEnhanceSpeechText(rawText);

    // 1. ELEVENLABS AI ENGINE
    if (voiceConfig.provider === "elevenlabs") {
      setIsGeneratingAudio(true);
      try {
        const response = await fetch("/api/tts/elevenlabs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            voiceId: voiceConfig.elevenLabsVoiceId,
            apiKey: voiceConfig.elevenLabsApiKey,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "ElevenLabs speech generation failed");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onplay = () => {
          setIsSpeaking(true);
          setIsGeneratingAudio(false);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsGeneratingAudio(false);
          fallbackBrowserSpeech(cleanText);
        };

        await audio.play();
        return;
      } catch (err: any) {
        console.warn("ElevenLabs error, using enhanced browser voice fallback:", err.message);
        toast.warning(err.message || "ElevenLabs unavailable, switching to browser natural voice.");
        setIsGeneratingAudio(false);
        fallbackBrowserSpeech(cleanText);
        return;
      }
    }

    // 2. OPENAI NEURAL ENGINE
    if (voiceConfig.provider === "openai") {
      setIsGeneratingAudio(true);
      try {
        const response = await fetch("/api/tts/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            voice: voiceConfig.openaiVoice,
            apiKey: voiceConfig.openaiApiKey,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "OpenAI speech generation failed");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onplay = () => {
          setIsSpeaking(true);
          setIsGeneratingAudio(false);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsGeneratingAudio(false);
          fallbackBrowserSpeech(cleanText);
        };

        await audio.play();
        return;
      } catch (err: any) {
        console.warn("OpenAI TTS error, using enhanced browser voice fallback:", err.message);
        toast.warning(err.message || "OpenAI TTS unavailable, switching to browser natural voice.");
        setIsGeneratingAudio(false);
        fallbackBrowserSpeech(cleanText);
        return;
      }
    }

    // 3. ENHANCED BROWSER NEURAL SPEECH
    fallbackBrowserSpeech(cleanText);
  };

  /**
   * Browser Speech with intelligent voice filtering (picks Microsoft Natural / Google Neural)
   */
  const fallbackBrowserSpeech = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis is not supported on your browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceConfig.speechRate || 1.0;
    utterance.pitch = 1.0;

    // Pick chosen or best matching voice
    let targetVoice: SpeechSynthesisVoice | undefined;

    if (voiceConfig.browserVoiceURI) {
      targetVoice = availableBrowserVoices.find((v) => v.voiceURI === voiceConfig.browserVoiceURI);
    }

    if (!targetVoice && availableBrowserVoices.length > 0) {
      if (selectedLang === "hi") {
        targetVoice =
          availableBrowserVoices.find((v) => /hi[-_]in/i.test(v.lang) && /natural|online|google/i.test(v.name)) ||
          availableBrowserVoices.find((v) => /hi[-_]in/i.test(v.lang));
      } else {
        targetVoice =
          availableBrowserVoices.find((v) => /en[-_]in/i.test(v.lang) && /natural|online|google/i.test(v.name)) ||
          availableBrowserVoices.find((v) => /natural|online/i.test(v.name)) ||
          availableBrowserVoices.find((v) => /en[-_]in/i.test(v.lang)) ||
          availableBrowserVoices.find((v) => /en[-_](us|gb)/i.test(v.lang));
      }
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    } else {
      utterance.lang = selectedLang === "hi" ? "hi-IN" : "en-IN";
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    stopSpeaking();

    const userMsg: Message = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://wutkiwsapywuxdirpngh.supabase.co/functions/v1/openrouter-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are NyayaVoice, a warm, authoritative, and practical Senior Indian Advocate.
The citizen is speaking to you directly.
Provide your response in conversational, clear, empowering language (English or Hinglish if user spoke Hindi).

Structure your reply cleanly:
1. Direct Legal Position (1-2 sentences: Are they legally right or wrong?)
2. Applicable Indian Law & Sections (e.g., Section 106 Transfer of Property Act, Section 27 Contract Act, Consumer Protection Act 2019, or BNS 2023)
3. 3 Immediate Steps to Take Today
4. Advice on whether hiring an advocate or sending a 15-day statutory legal notice is necessary.

Keep the advice direct, realistic, and reassuring. Do not overwhelm with unnecessary legalese.`,
              },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: query },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Edge function response error");
      }

      const data = await response.json();
      const replyContent =
        data?.answer ||
        data?.choices?.[0]?.message?.content ||
        "I have analyzed your situation under Indian law. Could you share more details?";

      const botMsg: Message = {
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response
      speakText(replyContent);
    } catch (err) {
      console.warn("AI edge function error, using instant advocate response:", err);
      // Smart structured fallback
      const fallbackResponse = `**Direct Legal Position:** Under Indian law, you have a prima facie legitimate grievance. You cannot be arbitrarily penalized or deprived of your property/money without due process of law.

**Applicable Indian Law:**
- Section 106, Transfer of Property Act (for tenancy disputes)
- Section 27 & 73, Indian Contract Act, 1872 (for employment and service bonds)
- Consumer Protection Act, 2019 (for defective goods/services)
- Bharatiya Nyaya Sanhita, 2023 (for criminal intimidation or wrongful loss)

**3 Immediate Steps to Take Today:**
1. Document every communication (emails, WhatsApp chats, payment receipts, agreements).
2. Issue a formal 15-day written statutory demand notice demanding resolution.
3. If no restitution is made within 15 days, lodge an online consumer grievance at consumerhelpline.gov.in or consult a verified advocate on NyayaPath.`;

      const botMsg: Message = {
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(fallbackResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Advice copied to clipboard!");
  };

  const handleReset = () => {
    stopSpeaking();
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation reset. Tap the microphone to speak your query or choose an issue below.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NyayaVoice Live AI Advocate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              <span>Virtual Legal Advocate</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Speak naturally in Hindi, Hinglish, or English. Listen to natural voice playback and get a practical 3-step action plan.
            </p>
          </div>

          {/* Controls: Language, Voice Settings, Reset */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            {/* Language Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedLang("en")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedLang === "en"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLang("hi")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedLang === "hi"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                हिन्दी / Hinglish
              </button>
            </div>

            {/* Voice Engine Settings Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="text-xs gap-1.5 border-gray-200 dark:border-gray-700"
              title="Configure Voice Engine (ElevenLabs / OpenAI / Browser)"
            >
              <Settings className="h-3.5 w-3.5 text-primary" />
              <span>Voice Settings</span>
              {voiceConfig.provider !== "browser" && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </Button>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-red-500"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Voice Engine Status Pill & Visualizer */}
        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Headphones className="h-4 w-4 text-primary" />
            <span>
              Voice Engine:{" "}
              <strong className="text-primary capitalize">
                {voiceConfig.provider === "elevenlabs"
                  ? "ElevenLabs AI Studio"
                  : voiceConfig.provider === "openai"
                  ? "OpenAI Neural (Onyx)"
                  : "Enhanced Natural Voice"}
              </strong>
            </span>
          </div>

          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
              <span className="flex gap-1 items-center">
                <span className="h-2 w-1 bg-primary rounded-full animate-bounce"></span>
                <span className="h-3 w-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>Advocate Speaking...</span>
              <button
                onClick={stopSpeaking}
                className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-[10px] hover:bg-red-200"
              >
                Stop Audio
              </button>
            </div>
          )}

          {isGeneratingAudio && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Synthesizing Studio Audio...</span>
            </div>
          )}
        </div>

        {/* Quick Voice Chips */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span>1-Click Voice Problem Prompts:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-left text-xs p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/40 hover:bg-primary/5 text-gray-700 dark:text-gray-300 transition-all truncate"
              >
                👉 {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream Window */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Scale className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-700/50"
                  }`}
                >
                  <div className="whitespace-pre-line prose dark:prose-invert max-w-none text-xs sm:text-sm">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] opacity-80">
                    <span>{m.timestamp}</span>

                    {m.role === "assistant" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakText(m.content)}
                          className="hover:text-primary transition-colors flex items-center gap-1 p-1 rounded"
                          title="Listen with AI Voice"
                        >
                          {isSpeaking ? (
                            <>
                              <Square className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                              <span className="text-[10px] text-red-500">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5 text-primary" />
                              <span className="text-[10px]">Listen</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(m.content)}
                          className="hover:text-primary transition-colors p-1 rounded"
                          title="Copy text"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0 text-white shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Scale className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
                  <span>Advocate is formulating legal strategy & sections...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </CardContent>
        </Card>

        {/* Input & Microphone Bar */}
        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2 sm:gap-3">
          {/* Big Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 scale-105"
                : "bg-primary text-white hover:bg-primary/90 shadow-sm"
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak in Hindi or English"}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* Text Input */}
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening
                ? "Listening... speak now..."
                : selectedLang === "hi"
                ? "Apna kanooni sawaal bole ya type kare..."
                : "Speak or type your legal question..."
            }
            className="flex-1 border-gray-200 dark:border-gray-800 text-xs sm:text-sm h-11"
          />

          {/* Send Button */}
          <Button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            className="h-11 px-4 bg-primary hover:bg-primary/90 text-white font-bold shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

      </div>

      {/* VOICE SETTINGS MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Voice Engine & Pronunciation Settings
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Provider Tabs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Select Speech Provider:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceConfig((c) => ({ ...c, provider: "browser" }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      voiceConfig.provider === "browser"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-xs font-bold">Natural Voice</div>
                    <div className="text-[10px] opacity-75">100% Free / Built-in</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoiceConfig((c) => ({ ...c, provider: "elevenlabs" }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      voiceConfig.provider === "elevenlabs"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-xs font-bold">ElevenLabs AI</div>
                    <div className="text-[10px] opacity-75">Studio Realistic</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoiceConfig((c) => ({ ...c, provider: "openai" }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      voiceConfig.provider === "openai"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="text-xs font-bold">OpenAI Neural</div>
                    <div className="text-[10px] opacity-75">Onyx / Nova</div>
                  </button>
                </div>
              </div>

              {/* Provider Config Fields */}
              {voiceConfig.provider === "elevenlabs" && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      ElevenLabs API Key:
                    </label>
                    <Input
                      type="password"
                      placeholder="Paste xi-api-key (e.g. sk_... or xi-...)"
                      value={voiceConfig.elevenLabsApiKey}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({ ...c, elevenLabsApiKey: e.target.value }))
                      }
                      className="text-xs font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Stored locally in your browser. Get a key at{" "}
                      <a
                        href="https://elevenlabs.io"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        elevenlabs.io
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Select Voice:
                    </label>
                    <select
                      value={voiceConfig.elevenLabsVoiceId}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({ ...c, elevenLabsVoiceId: e.target.value }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    >
                      {ELEVENLABS_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {voiceConfig.provider === "openai" && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      OpenAI API Key:
                    </label>
                    <Input
                      type="password"
                      placeholder="sk-proj-..."
                      value={voiceConfig.openaiApiKey}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({ ...c, openaiApiKey: e.target.value }))
                      }
                      className="text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Voice Persona:
                    </label>
                    <select
                      value={voiceConfig.openaiVoice}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({ ...c, openaiVoice: e.target.value }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    >
                      {OPENAI_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {voiceConfig.provider === "browser" && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Installed Browser Voice (Prioritizing Natural & Indian Accents):
                    </label>
                    <select
                      value={voiceConfig.browserVoiceURI}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({ ...c, browserVoiceURI: e.target.value }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Auto-Detect Best Natural / Indian Accent Voice</option>
                      {availableBrowserVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Speaking Speed:</span>
                      <span className="font-bold">{voiceConfig.speechRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.05"
                      value={voiceConfig.speechRate}
                      onChange={(e) =>
                        setVoiceConfig((c) => ({
                          ...c,
                          speechRate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Test Audio Preview */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    speakText(
                      "Greetings. I am your NyayaPath AI Advocate. Under Section 106 of the Transfer of Property Act, your security deposit of 60 thousand rupees must be settled properly."
                    )
                  }
                  className="text-xs gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 text-primary" />
                  <span>Test Voice Preview</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSettingsOpen(false);
                    toast.success("Voice engine preferences saved!");
                  }}
                  className="bg-primary text-white text-xs font-bold"
                >
                  Save & Close
                </Button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
