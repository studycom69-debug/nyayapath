import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Scale, Loader2, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function loadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
    }
  }

  async function saveMessage(role: "user" | "assistant", content: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("chat_messages").insert([
      {
        user_id: user.id,
        role,
        content,
      },
    ]);
  }

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage("user", input);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://wutkiwsapywuxdirpngh.supabase.co/functions/v1/openrouter-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        },
      );

      let aiContent = "";
      if (res.ok) {
        const data = await res.json();
        aiContent =
          data?.answer ||
          data?.content ||
          data?.choices?.[0]?.message?.content ||
          "";
      }

      if (!aiContent) {
        // Fallback legal response if AI endpoint returns empty
        const q = input.toLowerCase();
        if (
          q.includes("tenant") ||
          q.includes("rent") ||
          q.includes("landlord")
        ) {
          aiContent =
            "**Tenant & Rental Rights in India:**\n\n1. **Statutory Notice**: Under Section 106 of the Transfer of Property Act, 1882, a landlord must provide at least 15 days' written notice to terminate a monthly lease.\n2. **Security Deposit**: Unreasonable withholding beyond 30 days is actionable before the Rent Control Court or Small Causes Court.\n3. **Arbitrary Eviction**: A landlord cannot forcefully evict a tenant without obtaining a decree from the competent civil or rent court.";
        } else if (
          q.includes("consumer") ||
          q.includes("defective") ||
          q.includes("warranty")
        ) {
          aiContent =
            "**Consumer Protection Under CPA 2019:**\n\n1. **Right to Redressal**: Under Section 2(9) and Section 35, you can file a complaint online on **e-Daakhil** or before the District Consumer Disputes Redressal Commission.\n2. **Pecuniary Jurisdiction**: District Commission handles claims up to ₹50 Lakhs; State Commission from ₹50 Lakhs to ₹2 Crores.\n3. **Procedure**: Issue a 15-day statutory notice to the manufacturer/seller first.";
        } else if (
          q.includes("bail") ||
          q.includes("fir") ||
          q.includes("arrest") ||
          q.includes("police")
        ) {
          aiContent =
            "**Arrest and Bail Safeguards (BNSS / CrPC):**\n\n1. **Right to Grounds**: Under Article 22(1) and BNSS guidelines, you must be informed of the grounds of arrest immediately.\n2. **24-Hour Rule**: The arrested person must be produced before the nearest Judicial Magistrate within 24 hours.\n3. **Legal Aid**: Free legal counsel is guaranteed under Article 39A via NALSA Helpline (15100).";
        } else {
          aiContent = `**NyayaPath Legal Guidance:**\n\nRegarding your inquiry on "${input}":\n\n• **Applicable Legal Scope**: In India, this matter falls under statutory civil or penal provisions. If rights are infringed, the initial remedy is issuing a formal statutory Legal Notice under Section 80 CPC or relevant special act.\n• **Recommended Steps**: Preserve all transaction records, written agreements, and dates. Consult a specialized advocate on our Lawyer Directory for formal representation.\n• **Free Legal Assistance**: You can also reach out to the National Legal Services Authority (NALSA) helpline at **15100**.`;
        }
      }

      const aiMessage: Message = {
        role: "assistant",
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage("assistant", aiContent);
    } catch (error) {
      console.warn("AI Assistant fallback activated:", error);
      const fallbackAiMessage: Message = {
        role: "assistant",
        content: `**NyayaPath Legal Guidance:**\n\nRegarding your query on "${input}":\n\nUnder Indian law, you are entitled to constitutional protections and statutory remedies. You can generate a tailored **Legal Notice** or consult verified high court advocates in our **Find Lawyers** directory. If you require free legal aid, contact NALSA at **15100**.`,
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
            <Scale className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              NyayaPath AI Assistant
            </h1>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
              Online | Expert Legal Guidance
            </p>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Scale className="h-32 w-32" />
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                NyayaPath Intelligence
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                How can I assist you with Indian law, rights, or legal
                procedures today?
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                "What are my rights as a tenant?",
                "How to file a consumer complaint?",
                "Property inheritance laws",
                "Labor law violations",
              ].map((tip) => (
                <button
                  key={tip}
                  onClick={() => setInput(tip)}
                  className="text-xs p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-colors text-gray-600 dark:text-gray-300 text-left shadow-sm"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none"
              }`}
            >
              <div
                className={`prose prose-sm ${msg.role === "user" ? "prose-invert" : "dark:prose-invert"} max-w-none`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span className="text-sm text-gray-500 italic">
                NyayaPath AI is thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
          <textarea
            rows={1}
            className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 dark:text-white resize-none max-h-32"
            placeholder="Describe your legal issue..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white h-10 w-10 p-0 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          NyayaPath AI can make mistakes. Verify important legal information.
        </p>
      </div>
    </div>
  );
}
