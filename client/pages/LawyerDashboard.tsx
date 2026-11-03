import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  MessageCircle,
  FileText,
  Star,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import {
  QuestionSnapshot,
  QuestionSnapshotData,
} from "../components/ui/QuestionSnapshot";

interface Question extends QuestionSnapshotData {
  user_id: string;
  status: string;
  response: string | null;
  contact_method?: string;
  urgency?: string;
}

interface Booking {
  id: string;
  user_id: string;
  booking_time: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
  }[];
}

const DEMO_BOOKINGS: Booking[] = [
  {
    id: "demo-booking-1",
    user_id: "client-1",
    booking_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    user_profile: [{ full_name: "Vikramaditya Nair" }],
  },
  {
    id: "demo-booking-2",
    user_id: "client-2",
    booking_time: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: "accepted",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    user_profile: [{ full_name: "Sunita Sharma" }],
  },
];

const DEMO_DASHBOARD_QUESTIONS: Question[] = [
  {
    id: "dash-q1",
    user_id: "user-101",
    title: "Arbitrary Rent Increase & Eviction Notice in Mumbai",
    description:
      "My landlord sent an informal WhatsApp message demanding a 35% rent increase effective next month, or vacate within 15 days. My registered rent agreement has 6 months remaining with a 7% annual escalation clause.",
    status: "pending",
    category: "Property",
    contact_method: "Email",
    urgency: "High",
    response: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "dash-q2",
    user_id: "user-102",
    title: "Wrongful Deductions from Full & Final Settlement",
    description:
      "Employer deducted ₹45,000 citing equipment depreciation after I returned the laptop in pristine condition with transit insurance receipt.",
    status: "pending",
    category: "Employment",
    contact_method: "Phone",
    urgency: "Medium",
    response: null,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "dash-q3",
    user_id: "user-103",
    title: "Consumer Court Filing for Defective EV Vehicle Battery",
    description:
      "The authorized service center has refused warranty replacement for a failed electric two-wheeler battery within the 3-year manufacturer guarantee period.",
    status: "answered",
    category: "Consumer",
    contact_method: "Either",
    urgency: "Medium",
    response:
      "You can file a formal complaint under the Consumer Protection Act, 2019 before the District Consumer Disputes Redressal Commission (DCDRC). Issue a statutory 15-day notice first citing deficiency of service under Section 2(11).",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function LawyerDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>(
    DEMO_DASHBOARD_QUESTIONS,
  );
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [myRating, setMyRating] = useState({
    avg: 4.9,
    count: 24,
    reviews: [
      {
        rating: 5,
        review:
          "Advocate gave clear, actionable advice on property documentation.",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        rating: 5,
        review:
          "Extremely professional, resolved my employment contract clause dispute quickly.",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
  });
  const [showRatingDetails, setShowRatingDetails] = useState(false);
  const statuses = ["all", "pending", "answered"];
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user || null);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        let query = supabase
          .from("questions")
          .select("*")
          .order("created_at", { ascending: false });

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setQuestions(data as Question[]);
        } else {
          // Filter demo questions by status
          if (filterStatus === "all") {
            setQuestions(DEMO_DASHBOARD_QUESTIONS);
          } else {
            setQuestions(
              DEMO_DASHBOARD_QUESTIONS.filter((q) => q.status === filterStatus),
            );
          }
        }
      } catch (err) {
        console.warn(
          "Could not load questions from DB, using demo questions:",
          err,
        );
        setQuestions(DEMO_DASHBOARD_QUESTIONS);
      }
    }
    fetchQuestions();
  }, [filterStatus]);

  useEffect(() => {
    async function fetchMyRatings() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: reviews } = await supabase
          .from("lawyer_reviews")
          .select("rating, review, created_at")
          .eq("lawyer_id", user.id)
          .order("created_at", { ascending: false });

        if (reviews && reviews.length > 0) {
          const avg =
            reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            reviews.length;
          setMyRating({
            avg: parseFloat(avg.toFixed(1)),
            count: reviews.length,
            reviews: reviews.slice(0, 3),
          });
        }
      } catch (err) {
        console.warn("Error loading reviews:", err);
      }
    }
    fetchMyRatings();
  }, []);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoadingBookings(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setBookings(DEMO_BOOKINGS);
          return;
        }

        const { data, error } = await supabase
          .from("bookings")
          .select(
            "id, user_id, booking_time, status, created_at, updated_at, user_profile:profiles!bookings_user_id_fkey(full_name)",
          )
          .eq("lawyer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          const { data: fallbackData } = await supabase
            .from("bookings")
            .select("id, user_id, booking_time, status, created_at, updated_at")
            .eq("lawyer_id", user.id)
            .order("created_at", { ascending: false });

          if (fallbackData && fallbackData.length > 0) {
            setBookings(fallbackData as Booking[]);
          } else {
            setBookings(DEMO_BOOKINGS);
          }
        } else if (data && data.length > 0) {
          setBookings(data as Booking[]);
        } else {
          setBookings(DEMO_BOOKINGS);
        }
      } catch (err) {
        console.warn("Error fetching bookings:", err);
        setBookings(DEMO_BOOKINGS);
      } finally {
        setLoadingBookings(false);
      }
    }
    fetchBookings();
  }, []);

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    // If it's a demo booking, update locally
    if (bookingId.startsWith("demo-")) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: newStatus, updated_at: new Date().toISOString() }
            : b,
        ),
      );
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: newStatus, updated_at: new Date().toISOString() }
            : b,
        ),
      );
    }
  }

  const handleSelect = (question: Question) => {
    setSelectedQuestion(question);
    setResponseText(question.response || "");
  };

  const handleSaveResponse = async () => {
    if (!selectedQuestion) return;
    setLoading(true);

    if (selectedQuestion.id.startsWith("dash-")) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion.id
            ? { ...q, response: responseText, status: "answered" }
            : q,
        ),
      );
      setSelectedQuestion(null);
      setResponseText("");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("questions")
      .update({ response: responseText, status: "answered" })
      .eq("id", selectedQuestion.id);

    if (!error) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion.id
            ? { ...q, response: responseText, status: "answered" }
            : q,
        ),
      );
      setSelectedQuestion(null);
      setResponseText("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              👨‍⚖️ Advocate Workspace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage client consultation requests, answer citizen inquiries, and
              view ratings.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/lawyer-chats"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              Client Inquiries
            </Link>
          </div>
        </div>

        {/* Demo Mode / Guest Notice if not logged in */}
        {!currentUser && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs text-blue-900 dark:text-blue-200">
                <span className="font-bold">
                  Advocate Portal: Interactive Preview.
                </span>{" "}
                Test consultation bookings and reply to legal inquiries below.
                Sign in to link your real bar profile.
              </p>
            </div>
            <Link
              to="/login"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shrink-0"
            >
              Advocate Sign In
            </Link>
          </div>
        )}

        {/* Ratings Card */}
        {myRating.count > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-md mb-8 overflow-hidden">
            <button
              onClick={() => setShowRatingDetails(!showRatingDetails)}
              className="w-full p-6 flex items-center justify-between hover:bg-black/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Star className="h-8 w-8 fill-white" />
                <div className="text-left">
                  <h2 className="text-2xl font-bold">
                    Advocate Score: ⭐ {myRating.avg} / 5.0
                  </h2>
                  <p className="text-xs opacity-90 mt-0.5">
                    Based on {myRating.count} verified client consultations •
                    Click to {showRatingDetails ? "hide" : "view"} feedback
                  </p>
                </div>
              </div>
              {showRatingDetails ? (
                <ChevronUp className="h-6 w-6" />
              ) : (
                <ChevronDown className="h-6 w-6" />
              )}
            </button>

            {showRatingDetails && (
              <div className="px-6 pb-6 space-y-3">
                <div className="pt-4 border-t border-amber-400/50">
                  <p className="font-semibold text-sm mb-3">Client Feedback:</p>
                  {myRating.reviews.map((review: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-black/10 backdrop-blur-xs p-4 rounded-lg mb-2"
                    >
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-white text-white"
                                : "text-white/40"
                            }`}
                          />
                        ))}
                      </div>
                      {review.review && (
                        <p className="text-xs leading-relaxed mb-1">
                          "{review.review}"
                        </p>
                      )}
                      <p className="text-[10px] opacity-75">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONSULTATION BOOKINGS SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Client Consultation Bookings
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
              {bookings.length} Requests
            </span>
          </div>

          {loadingBookings ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Loading consultation bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
              No consultation requests at this time.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {bookings.map((booking) => {
                const formattedBookingTime = new Date(
                  booking.booking_time,
                ).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <User className="h-4 w-4 text-gray-500" />
                          {booking.user_profile &&
                          booking.user_profile.length > 0 &&
                          booking.user_profile[0]?.full_name
                            ? booking.user_profile[0].full_name
                            : "Client"}
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : booking.status === "accepted"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Scheduled Slot:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formattedBookingTime}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                      {booking.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking.id, "accepted")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking.id, "rejected")
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          Status updated
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QUESTIONS & RESPONSE WORKSPACE */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Questions list */}
          <div className="w-full lg:w-5/12 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Citizen Questions
              </h3>
              <div className="flex gap-1">
                {statuses.map((status) => (
                  <button
                    key={status}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      filterStatus === status
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelect(q)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedQuestion && selectedQuestion.id === q.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <QuestionSnapshot question={q} />

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        q.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      }`}
                    >
                      {q.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {q.created_at
                        ? new Date(q.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Drafting View */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            {selectedQuestion ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Responding to Citizen Query
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedQuestion.title}
                  </h2>
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedQuestion.description}
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Official Advocate Legal Opinion / Advice:
                  </label>
                  <textarea
                    className="w-full flex-1 min-h-[160px] p-4 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none mb-4"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Provide your legal guidance, relevant statutes, sections, and recommended next steps..."
                    rows={6}
                  />
                  <button
                    disabled={loading || !responseText.trim()}
                    onClick={handleSaveResponse}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "Transmitting Response..."
                      : "Submit Legal Response"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center py-24 text-center">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                  Select a question from the list
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Review the client's case snapshot and draft a professional
                  legal advisory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
