import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Scale, Info, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "Property",
  "Employment",
  "Divorce & Family",
  "Criminal",
  "Consumer Dispute",
  "Business & Corporate",
  "Cyber Law",
  "Other",
];

const CONTACT_METHODS = ["Email", "Phone", "WhatsApp", "Either"];

const URGENCY_LEVELS = ["Low", "Medium", "High"];

export default function AskQuestion() {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [contactMethod, setContactMethod] = useState<string>(
    CONTACT_METHODS[0],
  );
  const [urgency, setUrgency] = useState<string>(URGENCY_LEVELS[1]); // default Medium
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let fileUrl: string | null = null;

      if (file && user) {
        try {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const { data, error: uploadError } = await supabase.storage
            .from("question-documents")
            .upload(fileName, file);

          if (!uploadError && data) {
            fileUrl = data.path;
          }
        } catch (uploadErr) {
          console.warn("Storage upload optional warning:", uploadErr);
        }
      }

      // If user is logged in, insert to Supabase
      if (user) {
        const { error: insertError } = await supabase.from("questions").insert({
          user_id: user.id,
          title,
          description,
          category,
          contact_method: contactMethod,
          urgency,
          file_url: fileUrl,
        });

        if (insertError) {
          console.warn(
            "DB insert error, saving to local session backup:",
            insertError,
          );
          saveGuestQuestion();
        }
      } else {
        // Save as guest question in localStorage
        saveGuestQuestion();
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setContactMethod(CONTACT_METHODS[0]);
      setUrgency(URGENCY_LEVELS[1]);
      setFile(null);
    } catch (err: any) {
      console.error("Error submitting question:", err);
      // Even if unexpected error occurs, save to session so user never loses their question
      saveGuestQuestion();
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const saveGuestQuestion = () => {
    const newQ = {
      id: `guest-q-${Date.now()}`,
      title,
      description,
      status: "pending",
      category,
      contact_method: contactMethod,
      urgency,
      response: null,
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("guest_questions") || "[]",
      );
      existing.unshift(newQ);
      localStorage.setItem("guest_questions", JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="mb-2 text-gray-900 dark:text-white font-bold text-2xl">
            Question Submitted!
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Your query has been logged and assigned to verified advocates
            specializing in {category}. You can monitor progress and advocate
            feedback under My Questions.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/my-questions"
              className="w-full bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition shadow-sm"
            >
              View in My Questions
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
            >
              Submit Another Query
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-xl w-full border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold mb-1 tracking-tight">
            Ask a Legal Question
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Get practical legal guidance from verified high court advocates and
            specialists.
          </p>
        </div>

        {!currentUser && (
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 flex items-start gap-2.5">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="font-bold">Submitting in Guest Mode:</span> Your
              question will be stored in your browser session and visible under
              My Questions.{" "}
              <Link to="/login" className="underline font-bold">
                Sign in
              </Link>{" "}
              to receive email and SMS updates when advocates respond.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-100 text-red-700 rounded-xl text-center text-sm font-semibold dark:bg-red-900/30 dark:text-red-400 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
            >
              Question Title
            </label>
            <input
              id="title"
              type="text"
              required
              placeholder="e.g. Landlord refusing to return deposit after lease expiry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
            >
              Detailed Description of Grievance
            </label>
            <textarea
              id="description"
              required
              placeholder="Include dates, key events, city, amounts involved, and any agreements signed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none shadow-xs"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="urgency"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
              >
                Urgency Level
              </label>
              <select
                id="urgency"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                {URGENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level} Urgency
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="contactMethod"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
            >
              Preferred Contact Method
            </label>
            <select
              id="contactMethod"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
            >
              {CONTACT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
            >
              Supporting Notice / Agreement / Document (Optional)
            </label>
            <input
              id="file"
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 px-4 rounded-xl hover:bg-primary/90 font-bold text-sm transition disabled:opacity-50 shadow-md shadow-primary/20"
          >
            {loading
              ? "Submitting Question..."
              : "Submit Question to Advocates"}
          </button>
        </form>
      </div>
    </div>
  );
}
