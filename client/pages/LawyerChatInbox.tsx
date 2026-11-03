import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare, User, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ChatThread {
  user_id: string;
  user_name: string;
  last_message: string;
  unread_count: number;
  last_message_time: string;
}

const DEMO_CLIENT_CHATS: ChatThread[] = [
  {
    user_id: "lawyer-demo-client-1",
    user_name: "Karan Mehra",
    last_message:
      "Advocate sir, my landlord sent an informal WhatsApp notice demanding 35% hike. Is that legally valid without 3 months notice?",
    unread_count: 1,
    last_message_time: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    user_id: "lawyer-1-demo",
    user_name: "Pooja Hegde",
    last_message:
      "Thank you for the guidance on Section 106 notice. I have compiled all the rent transaction slips.",
    unread_count: 0,
    last_message_time: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    user_id: "lawyer-2-demo",
    user_name: "Rajiv Sen",
    last_message:
      "Need urgent consultation regarding consumer court jurisdiction in Bangalore for warranty replacement.",
    unread_count: 2,
    last_message_time: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
];

export default function LawyerChatInbox() {
  const [chats, setChats] = useState<ChatThread[]>(DEMO_CLIENT_CHATS);
  const [loading, setLoading] = useState(false);
  const [currentLawyer, setCurrentLawyer] = useState<any>(null);

  useEffect(() => {
    fetchLawyerChats();
    const timeout = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Real-time notifications for lawyers
  useEffect(() => {
    if (!currentLawyer) return;

    const subscription = supabase
      .channel("lawyer_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          if (payload.new.receiver_id === currentLawyer?.id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payload.new.sender_id)
              .maybeSingle();

            toast.success(
              `💬 New inquiry from ${profile?.full_name || "Client"}`,
              {
                description: payload.new.content?.substring(0, 50) + "...",
                action: {
                  label: "View",
                  onClick: () =>
                    (window.location.href = `/chat/${payload.new.sender_id}`),
                },
              },
            );

            fetchLawyerChats();
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentLawyer]);

  async function fetchLawyerChats() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentLawyer(user || null);

      if (!user) {
        setChats(DEMO_CLIENT_CHATS);
        return;
      }

      const { data: messages } = await supabase
        .from("messages")
        .select("sender_id, content, created_at")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (!messages || messages.length === 0) {
        setChats(DEMO_CLIENT_CHATS);
        return;
      }

      const chatMap = new Map<string, ChatThread>();

      for (const msg of messages) {
        if (!chatMap.has(msg.sender_id)) {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", msg.sender_id)
            .eq("receiver_id", user.id)
            .gt(
              "created_at",
              localStorage.getItem(`last_read_${msg.sender_id}`) ||
                "2020-01-01",
            );

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", msg.sender_id)
            .maybeSingle();

          chatMap.set(msg.sender_id, {
            user_id: msg.sender_id,
            user_name: profile?.full_name || "Client Inquiry",
            last_message: msg.content || "Attached document",
            last_message_time: msg.created_at,
            unread_count: count || 0,
          });
        }
      }

      const list = Array.from(chatMap.values());
      setChats(list.length > 0 ? list : DEMO_CLIENT_CHATS);
    } catch (err) {
      console.warn("Error fetching lawyer chats:", err);
      setChats(DEMO_CLIENT_CHATS);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading client inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              Client Consultation Inquiries
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active case discussions and client inquiries awaiting your
              response
            </p>
          </div>

          <Button asChild className="bg-primary text-white">
            <Link to="/lawyers">Browse Directory</Link>
          </Button>
        </div>

        {/* Demo Notification if guest */}
        {!currentLawyer && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs text-blue-900 dark:text-blue-200">
                Viewing client inquiry inbox in preview mode. Click on any
                client thread to test advocate response.
              </p>
            </div>
            <Link
              to="/login"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shrink-0 ml-2"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {chats.map((chat) => (
            <Link
              key={chat.user_id}
              to={`/chat/${chat.user_id}`}
              onClick={() =>
                localStorage.setItem(
                  `last_read_${chat.user_id}`,
                  new Date().toISOString(),
                )
              }
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-xs hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700 relative"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-base shrink-0">
                    <User className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-base font-bold truncate ${
                          chat.unread_count > 0
                            ? "text-primary"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {chat.user_name}
                      </h3>
                      {chat.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {chat.unread_count} new
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">
                      {chat.last_message}
                    </p>

                    <p className="text-[10px] text-gray-400">
                      {new Date(chat.last_message_time).toLocaleString(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-primary shrink-0">
                  <span>Open Chat</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
