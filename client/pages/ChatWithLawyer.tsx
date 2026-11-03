import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft,
  Send,
  Star,
  Check,
  Paperclip,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import RatingModal from "../components/ui/RatingModal";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

const DEMO_LAWYER_DIRECTORY: Record<
  string,
  { name: string; specialization: string; rating: number }
> = {
  "lawyer-1-demo": {
    name: "Adv. Rajesh Sharma",
    specialization: "Corporate Law",
    rating: 4.9,
  },
  "lawyer-2-demo": {
    name: "Adv. Priya Deshmukh",
    specialization: "Family Law",
    rating: 4.8,
  },
  "lawyer-3-demo": {
    name: "Adv. Vikram Sethi",
    specialization: "Criminal Law",
    rating: 4.9,
  },
  "lawyer-4-demo": {
    name: "Adv. Ananya Roy",
    specialization: "Property Law",
    rating: 4.7,
  },
  "lawyer-5-demo": {
    name: "Adv. Amit Verma",
    specialization: "Labour Law",
    rating: 4.8,
  },
  "lawyer-6-demo": {
    name: "Adv. Meenakshi Sundaram",
    specialization: "Tax Law",
    rating: 4.9,
  },
  "lawyer-demo-client-1": {
    name: "Karan Mehra (Client)",
    specialization: "Client Inquiry",
    rating: 5.0,
  },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ChatWithLawyer() {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [otherPersonName, setOtherPersonName] = useState("Advocate");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isDemo = !lawyerId || !UUID_REGEX.test(lawyerId);

  useEffect(() => {
    initChat();
  }, [lawyerId]);

  useEffect(() => {
    if (isDemo) return;
    const interval = setInterval(() => {
      if (user && lawyerId) {
        fetchMessages(user);
        fetchChatStatus(user);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, lawyerId, isDemo]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function initChat() {
    try {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      setUser(authUser || null);

      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .maybeSingle();
        setCurrentUserRole(
          profileData?.role || authUser.user_metadata?.role || "user",
        );
      }

      // 1. If it's a demo lawyer or invalid UUID
      if (isDemo) {
        const demoInfo = DEMO_LAWYER_DIRECTORY[lawyerId || ""] || {
          name: "Adv. Rajesh Sharma",
          specialization: "Legal Counsel",
          rating: 4.9,
        };
        setOtherPersonName(demoInfo.name);

        const storageKey = `demo_chat_${lawyerId || "default"}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            setMessages(JSON.parse(saved));
          } catch {
            setMessages(getDefaultDemoMessages(demoInfo.name));
          }
        } else {
          const initialMsgs = getDefaultDemoMessages(demoInfo.name);
          setMessages(initialMsgs);
          localStorage.setItem(storageKey, JSON.stringify(initialMsgs));
        }

        setLoading(false);
        return;
      }

      // 2. Real UUID lawyer from Supabase
      if (lawyerId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", lawyerId)
          .maybeSingle();

        if (profile?.full_name) {
          setOtherPersonName(profile.full_name);
        } else {
          setOtherPersonName("Legal Counsel");
        }

        if (authUser) {
          const { data: existingRating } = await supabase
            .from("lawyer_reviews")
            .select("rating")
            .eq("user_id", authUser.id)
            .eq("lawyer_id", lawyerId)
            .maybeSingle();

          if (existingRating) {
            setHasRated(true);
            setMyRating(existingRating.rating);
          }

          await fetchMessages(authUser);
          await fetchChatStatus(authUser);
        }
      }
    } catch (err) {
      console.warn("Error in initChat:", err);
    } finally {
      setLoading(false);
    }
  }

  function getDefaultDemoMessages(advocateName: string): Message[] {
    return [
      {
        id: "msg-1",
        sender_id: lawyerId || "lawyer-1",
        receiver_id: "me",
        content: `Greetings! I am ${advocateName}. I have received your consultation inquiry. Please describe your legal matter, relevant dates, and any documents you hold so I can advise you accurately.`,
        file_url: null,
        file_name: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  async function fetchMessages(currentUser: any) {
    if (!currentUser || !lawyerId || isDemo) return;

    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${lawyerId}),and(sender_id.eq.${lawyerId},receiver_id.eq.${currentUser.id})`,
        )
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as Message[]);
      }
    } catch (err) {
      console.warn("fetchMessages error:", err);
    }
  }

  async function fetchChatStatus(currentUser: any) {
    if (!currentUser || !lawyerId || isDemo) return;

    try {
      const first = currentUser.id < lawyerId ? currentUser.id : lawyerId;
      const second = currentUser.id < lawyerId ? lawyerId : currentUser.id;

      const { data } = await supabase
        .from("chat_status")
        .select("is_closed")
        .eq("user_a", first)
        .eq("user_b", second)
        .maybeSingle();

      if (data) setIsClosed(data.is_closed);
    } catch (err) {
      console.warn("fetchChatStatus error:", err);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert("Max 10 MB file size allowed.");
      return;
    }
    setFile(f);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (isClosed) return;
    if (!newMessage.trim() && !file) return;

    setSending(true);

    try {
      // 1. DEMO MODE CHAT (Simulate realistic advocate response)
      if (isDemo || !user) {
        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          sender_id: user?.id || "guest-user",
          receiver_id: lawyerId || "lawyer-1-demo",
          content: newMessage.trim() || null,
          file_url: file ? URL.createObjectURL(file) : null,
          file_name: file ? file.name : null,
          created_at: new Date().toISOString(),
        };

        const updated = [...messages, userMsg];
        setMessages(updated);
        setNewMessage("");
        setFile(null);

        const storageKey = `demo_chat_${lawyerId || "default"}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));

        // Simulate fast advocate acknowledgment
        setTimeout(() => {
          const autoReplies = [
            "Thank you for sharing this. Under applicable Indian law, we can issue a formal legal notice or file an appropriate motion. Do you have copies of all relevant communications or agreements?",
            "Understood. This matter appears to fall within statutory rights. I recommend keeping a clean record of all transaction receipts while we prepare the response draft.",
            "I have noted these points. I will review the clauses and suggest the strongest legal remedy. Let me know if you would like me to draft an initial reply.",
          ];
          const replyText =
            autoReplies[Math.floor(Math.random() * autoReplies.length)];
          const advReply: Message = {
            id: `reply-${Date.now()}`,
            sender_id: lawyerId || "lawyer-1-demo",
            receiver_id: user?.id || "guest-user",
            content: replyText,
            file_url: null,
            file_name: null,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => {
            const next = [...prev, advReply];
            localStorage.setItem(storageKey, JSON.stringify(next));
            return next;
          });
        }, 1000);

        setSending(false);
        return;
      }

      // 2. LIVE SUPABASE CHAT
      let file_url: string | null = null;
      let file_name: string | null = null;

      if (file) {
        const path = `${user.id}/${lawyerId}/${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("chat-files")
          .upload(path, file);

        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage
            .from("chat-files")
            .getPublicUrl(data.path);
          file_url = publicUrlData.publicUrl;
          file_name = file.name;
        }
      }

      const { error } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: lawyerId,
          content: newMessage.trim() || null,
          file_url,
          file_name,
        },
      ]);

      if (!error) {
        setNewMessage("");
        setFile(null);
        await fetchMessages(user);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseChat() {
    if (isClosed) return;
    if (
      !confirm(
        "Are you sure you want to conclude and close this consultation thread?",
      )
    ) {
      return;
    }

    try {
      setClosing(true);
      if (isDemo || !user) {
        setIsClosed(true);
        return;
      }

      const first = user.id < lawyerId! ? user.id : lawyerId!;
      const second = user.id < lawyerId! ? lawyerId! : user.id;

      const { data: existing } = await supabase
        .from("chat_status")
        .select("id")
        .eq("user_a", first)
        .eq("user_b", second)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("chat_status")
          .update({ is_closed: true })
          .eq("id", existing.id);
      } else {
        await supabase.from("chat_status").insert({
          user_a: first,
          user_b: second,
          is_closed: true,
        });
      }

      setIsClosed(true);
    } catch (err) {
      console.error("Error closing chat", err);
    } finally {
      setClosing(false);
    }
  }

  function handleRatingSubmitted() {
    setShowRatingModal(false);
    setHasRated(true);
    setMyRating(5);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to secure advocate channel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-xs border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg border border-primary/20">
                {otherPersonName.charAt(0).toUpperCase() || "⚖️"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {otherPersonName}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> Verified Advocate
                  </span>
                </div>
                {isClosed ? (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                    <Lock className="h-3 w-3" /> Consultation closed. You can
                    review past messages.
                  </p>
                ) : (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ● Encrypted Legal Consultation
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCloseChat}
                disabled={isClosed || closing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                <Lock className="h-3 w-3" />
                {isClosed ? "Closed" : closing ? "Closing..." : "Conclude"}
              </button>

              {currentUserRole !== "lawyer" && (
                <>
                  {hasRated ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold text-xs">
                      <Check className="h-3.5 w-3.5" />
                      Rated {myRating}⭐
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                    >
                      <Star className="h-3.5 w-3.5 fill-white" />
                      Rate Advocate
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Mode Notification Banner */}
      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800/40 py-2 px-4 text-center text-xs text-blue-800 dark:text-blue-300">
          <span>You are chatting in consultation mode. </span>
          <Link
            to="/login"
            className="font-bold underline hover:text-blue-950 dark:hover:text-blue-100"
          >
            Sign in
          </Link>
          <span>
            {" "}
            to save conversation history and official documentation to your
            account.
          </span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <UserCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Consultation initiated with {otherPersonName}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Send a message to begin your case discussion.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user
              ? msg.sender_id === user.id
              : msg.sender_id === "guest-user" || msg.sender_id === "me";

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl shadow-xs ${
                    isMe
                      ? "bg-primary text-white rounded-br-xs"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-xs"
                  }`}
                >
                  {msg.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                      {msg.content}
                    </p>
                  )}

                  {msg.file_url && (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline ${
                        isMe ? "text-blue-100" : "text-primary"
                      }`}
                    >
                      📎 {msg.file_name || "Attached Legal Document"}
                    </a>
                  )}

                  <p
                    className={`text-[10px] mt-1.5 ${
                      isMe ? "text-blue-100/80" : "text-gray-400"
                    } text-right`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-20">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto px-4 py-3 flex gap-2.5 items-center"
        >
          <label
            className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isClosed ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title="Attach document or notice"
          >
            <Paperclip className="h-5 w-5" />
            <input
              type="file"
              className="hidden"
              disabled={isClosed}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>

          {file && (
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-md max-w-[140px] truncate">
              {file.name}
            </span>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isClosed
                ? "This consultation thread is closed."
                : "Type your query or reply to the advocate..."
            }
            disabled={sending || isClosed}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={sending || isClosed || (!newMessage.trim() && !file)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          lawyerId={lawyerId || ""}
          lawyerName={otherPersonName}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
