import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, LogIn, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Question {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  contact_method: string;
  response: string | null;
  created_at: string;
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: "demo-q1",
    title: "Security Deposit Refund from Landlord in Bengaluru",
    description:
      "My tenancy ended 45 days ago, and my landlord is delaying the refund of my ₹80,000 security deposit despite no damages to the premises.",
    status: "answered",
    category: "Property & Tenancy",
    contact_method: "Email",
    response:
      "Under Indian tenancy law, landlords cannot withhold security deposits unreasonably beyond 30 days without producing receipts of valid repairs. You can issue a formal legal notice under Section 106 of Transfer of Property Act demanding repayment within 15 days, failing which you can file a complaint with the Rent Tribunal or Small Causes Court.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-q2",
    title: "Notice Period Buyout and Relieving Letter Dispute",
    description:
      "My previous employer is refusing to issue my relieving letter after I offered to buy out the remaining 30 days of notice as per my appointment letter.",
    status: "pending",
    category: "Employment & Labour",
    contact_method: "WhatsApp",
    response: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getStatusBadge(status: string) {
  if (status === "pending") {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        Pending Review
      </span>
    );
  }
  if (status === "answered") {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        Answered by Advocate
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
      {status}
    </span>
  );
}

export default function MyQuestions() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      if (authLoading) return;
      setLoading(true);

      try {
        let guestQs: Question[] = [];
        try {
          const stored = localStorage.getItem("guest_questions");
          if (stored) {
            guestQs = JSON.parse(stored);
          }
        } catch (e) {
          console.warn("Could not parse guest questions:", e);
        }

          if (currentUser) {
            const { data, error } = await supabase
              .from("questions")
              .select("*")
              .eq("user_id", currentUser.id)
              .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
              setQuestions([...guestQs, ...data]);
            } else {
              // Logged in user with no DB questions yet
              setQuestions(guestQs);
            }
          } else {
            // Guest mode
            setQuestions(guestQs.length > 0 ? guestQs : DEMO_QUESTIONS);
          }
        } catch (err) {
          console.error("Error fetching questions:", err);
          setQuestions(DEMO_QUESTIONS);
        } finally {
          setLoading(false);
        }
      }

        fetchQuestions();
}, [currentUser, authLoading]);

return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" />
            My Legal Questions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your queries and verified advocate responses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Link to="/ask-question">
              <Plus className="h-4 w-4" />
              Ask a New Question
            </Link>
          </Button>
        </div>
      </div>

        {/* Guest Banner only if definitely not logged in and auth finished */ }
      {!currentUser && !authLoading && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Viewing sample questions in Guest Mode
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                Sign in to save your personal questions, receive advocate
                responses, and access private case snapshots.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
          >
            <Link to="/login" className="flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </Button>
        </div>
      )}

      {/* Logged in User Status Banner */}
      {currentUser && (
        <div className="mb-6 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {(currentUser.user_metadata?.full_name || currentUser.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Account: <span className="text-primary font-bold">{currentUser.user_metadata?.full_name || currentUser.email}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All legal queries & advocate responses are privately synced to your account.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-primary text-white"
          >
            <Link to="/ask-question">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Ask Question
            </Link>
          </Button>
        </div>
      )}

      {/* Content */}
        { loading || authLoading ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Loading your legal questions...
            </p>
          </div>
        ): questions.length === 0 && !showDemo ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            No Questions Submitted Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Need legal clarification? Ask our network of verified legal
            practitioners and get answers within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-primary text-white">
              <Link to="/ask-question">Ask Your First Question</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDemo(true)}
              className="text-gray-700 dark:text-gray-300"
            >
              View Sample Precedents
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
            {(showDemo && questions.length === 0 ? DEMO_QUESTIONS : questions).map((q) => (
              <div
                key={q.id}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {q.title}
                  </h3>
                  {getStatusBadge(q.status)}
                </div>

                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                    {q.category}
                  </span>
                  <span>•</span>
                  <span>
                    Submitted on {new Date(q.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Preferred contact: {q.contact_method}</span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-line">
                  {q.description}
                </p>

                {q.response ? (
                  <div className="mt-4 p-5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>⚖️ Advocate Response</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                      {q.response}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Our legal panel is currently reviewing this query. Typical
                    turnaround is under 24 hours.
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  </div>
);
}
