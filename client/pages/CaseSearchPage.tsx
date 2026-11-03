import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Search, FileText, X, Scale, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface CourtCase {
  id: string;
  title: string;
  court: string;
  year: string;
  category: string;
  summary: string;
  full_text: string;
}

const DEFAULT_LANDMARK_CASES: CourtCase[] = [
  {
    id: "case-1",
    title: "Kesavananda Bharati v. State of Kerala",
    court: "Supreme Court of India",
    year: "1973",
    category: "Constitutional",
    summary:
      "Historic 13-judge bench ruling establishing the 'Basic Structure Doctrine', restricting Parliament from amending foundational constitutional pillars under Article 368.",
    full_text:
      "A 13-judge constitutional bench ruled by a 7-6 majority that while Parliament has wide powers under Article 368 to amend any part of the Constitution, including Fundamental Rights, it cannot amend the 'Basic Structure' or foundational pillars of the Constitution such as democracy, secularism, rule of law, and judicial review.",
  },
  {
    id: "case-2",
    title: "Maneka Gandhi v. Union of India",
    court: "Supreme Court of India",
    year: "1978",
    category: "Constitutional",
    summary:
      "Radically expanded Article 21 (Right to Life and Personal Liberty), ruling that any law depriving personal liberty must be 'just, fair, and reasonable', introducing substantive due process into Indian jurisprudence.",
    full_text:
      "When Maneka Gandhi's passport was impounded without reason, the Supreme Court held that the right to travel abroad is part of personal liberty under Article 21. It established the interrelationship between Articles 14, 19, and 21 (the 'Golden Triangle') and held that administrative action depriving liberty must satisfy procedural fairness and reasonableness.",
  },
  {
    id: "case-3",
    title: "Justice K.S. Puttaswamy (Retd.) v. Union of India",
    court: "Supreme Court of India",
    year: "2017",
    category: "Cyber & Privacy",
    summary:
      "Unanimous 9-judge bench decision affirming that the Right to Privacy is a fundamental right protected under Article 21 and Part III of the Constitution.",
    full_text:
      "The Supreme Court unanimously ruled that privacy is an intrinsic part of the right to life and personal liberty under Article 21. The judgment laid down a strict three-fold proportionality test (legality, legitimate aim, proportionality) for any state encroachment on privacy and spurred modern data protection laws in India.",
  },
  {
    id: "case-4",
    title: "Vishaka and Ors. v. State of Rajasthan",
    court: "Supreme Court of India",
    year: "1997",
    category: "Women's Rights",
    summary:
      "Formulated the historic 'Vishaka Guidelines' for the prevention, prohibition, and redressal of sexual harassment of women in the workplace.",
    full_text:
      "Arising from the brutal gang rape of social worker Bhanwari Devi, the Supreme Court filled a legislative vacuum by framing binding guidelines requiring workplaces to establish Internal Complaints Committees (ICC), which later formed the statutory foundation for the POSH Act, 2013.",
  },
  {
    id: "case-5",
    title: "Navtej Singh Johar v. Union of India",
    court: "Supreme Court of India",
    year: "2018",
    category: "Constitutional",
    summary:
      "Unanimously decriminalized consensual homosexual acts between adults by reading down Section 377 of the Indian Penal Code.",
    full_text:
      "A 5-judge Constitution bench held that Section 377 IPC violated Articles 14, 15, 19, and 21 of the Constitution to the extent that it criminalized consensual sexual acts of adults in private, affirming individual autonomy, dignity, and constitutional morality over societal morality.",
  },
  {
    id: "case-6",
    title: "Shreya Singhal v. Union of India",
    court: "Supreme Court of India",
    year: "2015",
    category: "Cyber & Privacy",
    summary:
      "Struck down Section 66A of the Information Technology Act, 2000 as unconstitutional for violating the fundamental right to freedom of speech and expression.",
    full_text:
      "The Supreme Court struck down Section 66A in its entirety on grounds of overbreadth and vagueness, holding that online speech cannot be subjected to a standard lower than print or oral speech under Article 19(1)(a) and Article 19(2).",
  },
  {
    id: "case-7",
    title: "Shayara Bano v. Union of India",
    court: "Supreme Court of India",
    year: "2017",
    category: "Women's Rights",
    summary:
      "Declared the practice of Talaq-e-Biddat (instant Triple Talaq) unconstitutional, arbitrary, and violative of Article 14.",
    full_text:
      "By a 3-2 majority, the Supreme Court set aside the practice of instantaneous Triple Talaq as void and illegal, holding that manifest arbitrariness is a recognized ground to invalidate laws and practices violating gender equality under Article 14.",
  },
  {
    id: "case-8",
    title: "M.C. Mehta v. Union of India (Oleum Gas Leak)",
    court: "Supreme Court of India",
    year: "1987",
    category: "Corporate",
    summary:
      "Introduced the revolutionary principle of 'Absolute Liability' for hazardous and inherently dangerous industrial operations in India.",
    full_text:
      "In the aftermath of the oleum gas leak in Delhi, Chief Justice P.N. Bhagwati established that enterprises engaged in hazardous activities owe an absolute and non-delegable duty to the community, not subject to the exceptions laid down under the English Rylands v. Fletcher strict liability rule.",
  },
  {
    id: "case-9",
    title: "D.K. Basu v. State of West Bengal",
    court: "Supreme Court of India",
    year: "1997",
    category: "Criminal",
    summary:
      "Prescribed 11 mandatory procedural safeguards during arrest and detention to prevent custodial torture and police violence.",
    full_text:
      "The Supreme Court laid down strict guidelines including issuing an arrest memo, informing next of kin within 8 to 12 hours, mandatory medical examination every 48 hours, and displaying police officer badges, establishing accountability for human rights violations in custody.",
  },
  {
    id: "case-10",
    title: "Arnesh Kumar v. State of Bihar",
    court: "Supreme Court of India",
    year: "2014",
    category: "Criminal",
    summary:
      "Restricted automatic police arrests in offences punishable with imprisonment of less than 7 years, mandating notice under Section 41A CrPC.",
    full_text:
      "The Supreme Court mandated that police officers shall not arrest the accused routinely upon lodging of cases under Section 498A IPC or other offences carrying under 7 years imprisonment without first satisfying parameters laid down under Section 41 CrPC and issuing a formal appearance notice.",
  },
  {
    id: "case-11",
    title: "Vineeta Sharma v. Rakesh Sharma",
    court: "Supreme Court of India",
    year: "2020",
    category: "Civil & Property",
    summary:
      "Held that daughters possess coparcenary rights by birth in ancestral property under Section 6 of Hindu Succession Act, with retroactive application.",
    full_text:
      "A 3-judge bench resolved prior conflicting decisions and clarified that daughters possess equal birthright coparcenary rights in Hindu joint family property irrespective of whether the father was alive when the Hindu Succession (Amendment) Act, 2005 took effect.",
  },
  {
    id: "case-12",
    title: "Lalita Kumari v. Govt. of U.P.",
    court: "Supreme Court of India",
    year: "2014",
    category: "Criminal",
    summary:
      "Held that registration of First Information Report (FIR) is mandatory under Section 154 CrPC if information discloses a cognizable offence.",
    full_text:
      "A 5-judge Constitution bench ruled that police have no discretion to delay or conduct a preliminary inquiry before filing an FIR when the information discloses the commission of a cognizable offence, underscoring citizen access to criminal justice machinery.",
  },
  {
    id: "case-13",
    title: "Anuradha Bhasin v. Union of India",
    court: "Supreme Court of India",
    year: "2020",
    category: "Cyber & Privacy",
    summary:
      "Declared that freedom of speech and expression and right to practice any trade through internet is constitutionally protected under Article 19(1)(a) and 19(1)(g).",
    full_text:
      "Examining internet shutdowns in Jammu & Kashmir, the Supreme Court held that internet access enables fundamental rights and indefinite internet bans are unconstitutional. Any shutdown must adhere to the proportionality doctrine and undergo periodic review.",
  },
  {
    id: "case-14",
    title: "Common Cause v. Union of India",
    court: "Supreme Court of India",
    year: "2018",
    category: "Constitutional",
    summary:
      "Recognized passive euthanasia and the right of an individual to die with dignity as part of Article 21, validating Advance Medical Directives (Living Wills).",
    full_text:
      "A 5-judge Constitution bench declared that the right to live with dignity under Article 21 extends to the end of life. Patients suffering from terminal illness without hope of recovery have the legal right to execute Living Wills refusing medical support.",
  },
  {
    id: "case-15",
    title: "Subhash Kumar v. State of Bihar",
    court: "Supreme Court of India",
    year: "1991",
    category: "Environmental",
    summary:
      "Explicitly held that the Right to Life under Article 21 includes the right to the enjoyment of pollution-free water and air.",
    full_text:
      "The Supreme Court recognized environmental health as a fundamental constitutional entitlement. If anything endangers or impairs the quality of water or air in derogation of people's health, citizens have the constitutional right to invoke Article 32.",
  },
];

const CATEGORIES = [
  "All",
  "Constitutional",
  "Criminal",
  "Civil & Property",
  "Cyber & Privacy",
  "Women's Rights",
  "Corporate",
  "Environmental",
];

export default function CaseSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cases, setCases] = useState<CourtCase[]>(DEFAULT_LANDMARK_CASES);
  const [loading, setLoading] = useState(false);

  // AI SUMMARY STATES
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    async function filterAndFetchCases() {
      setLoading(true);
      try {
        let dbCases: CourtCase[] = [];
        const { data, error } = await supabase.from("cases").select("*");

        if (!error && data && data.length > 0) {
          dbCases = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            court: d.court || "High Court / Supreme Court",
            year: d.year || "Recent",
            category: d.category || "Constitutional",
            summary: d.summary || "",
            full_text: d.full_text || d.summary || "",
          }));
        }

        // Combine DB cases with landmark cases (avoiding duplicates by title)
        const combined = [...dbCases];
        for (const c of DEFAULT_LANDMARK_CASES) {
          if (
            !combined.some(
              (item) => item.title.toLowerCase() === c.title.toLowerCase(),
            )
          ) {
            combined.push(c);
          }
        }

        // Filter by category and search term
        const lower = searchTerm.trim().toLowerCase();
        const filtered = combined.filter((c) => {
          const matchesCategory =
            selectedCategory === "All" ||
            c.category.toLowerCase() === selectedCategory.toLowerCase();

          const matchesSearch =
            !lower ||
            c.title.toLowerCase().includes(lower) ||
            c.summary.toLowerCase().includes(lower) ||
            c.court.toLowerCase().includes(lower) ||
            c.year.includes(lower) ||
            c.full_text.toLowerCase().includes(lower);

          return matchesCategory && matchesSearch;
        });

        setCases(filtered);
      } catch (err) {
        console.error("Error filtering cases:", err);
        const lower = searchTerm.trim().toLowerCase();
        setCases(
          DEFAULT_LANDMARK_CASES.filter((c) => {
            const matchesCategory =
              selectedCategory === "All" ||
              c.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch =
              !lower ||
              c.title.toLowerCase().includes(lower) ||
              c.summary.toLowerCase().includes(lower);
            return matchesCategory && matchesSearch;
          }),
        );
      } finally {
        setLoading(false);
      }
    }

    filterAndFetchCases();
  }, [searchTerm, selectedCategory]);

  // AI SUMMARY FUNCTION
  async function generateAiSummary(caseItem: CourtCase) {
    try {
      setSelectedCase(caseItem);
      setLoadingSummary(true);
      setAiSummary(null);

      const response = await fetch(
        "https://wutkiwsapywuxdirpngh.supabase.co/functions/v1/openrouter-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert Indian legal assistant. Provide a structured legal summary with key facts, ratio decidendi, applicable constitutional or penal sections, and why the judgment remains critical.",
              },
              {
                role: "user",
                content: `
Summarize this landmark Indian court judgment clearly:

Title: ${caseItem.title}
Court: ${caseItem.court}
Year: ${caseItem.year}
Category: ${caseItem.category}

Facts and Text:
${caseItem.full_text}
                `,
              },
            ],
          }),
        },
      );

      let content = "";
      if (response.ok) {
        const data = await response.json();
        content =
          data?.answer ||
          data?.content ||
          data?.choices?.[0]?.message?.content ||
          "";
      }

      if (content) {
        setAiSummary(content);
      } else {
        setAiSummary(
          `## Ratio Decidendi & Legal Precedent\n\n**Judgment:** ${caseItem.title} (${caseItem.year})\n**Bench / Court:** ${caseItem.court}\n**Category:** ${caseItem.category}\n\n### Core Summary\n${caseItem.summary}\n\n### Foundational Principles Established\n${caseItem.full_text}\n\n*Source: Official Supreme Court / High Court Law Reports.*`,
        );
      }
    } catch (err) {
      console.warn("AI summary fallback:", err);
      setAiSummary(
        `## Ratio Decidendi & Legal Precedent\n\n**Judgment:** ${caseItem.title} (${caseItem.year})\n**Bench / Court:** ${caseItem.court}\n**Category:** ${caseItem.category}\n\n### Core Summary\n${caseItem.summary}\n\n### Foundational Principles Established\n${caseItem.full_text}\n\n*Source: Official Supreme Court / High Court Law Reports.*`,
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  return (
    <main className="py-12 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20">
            <Scale className="h-3.5 w-3.5" />
            <span>Official Case Law Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3 text-gray-900 dark:text-white">
            Search Court Cases & Judgments
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore landmark Supreme Court and High Court precedents with
            instant AI ratio decidendi summaries.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case title, topic (e.g. Right to Privacy, Bail, Section 377, Property)..."
            className="pl-12 py-7 text-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus-visible:ring-primary transition-all placeholder:text-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count Indicator */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6 px-1">
          <span>
            Showing {cases.length} court {cases.length === 1 ? "case" : "cases"}
          </span>
          {selectedCategory !== "All" && (
            <span className="text-primary">
              Filtered by: {selectedCategory}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex justify-center mb-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="space-y-6">
          {cases.length === 0 && !loading && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <Scale className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                No Matching Cases Found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Try searching for keywords like "Article 21", "Bail", "Divorce",
                or reset filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}

          {cases.map((caseItem, idx) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.4) }}
            >
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 rounded-2xl">
                <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="h-3 w-3" />
                          {caseItem.court}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">
                          •
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {caseItem.category}
                        </span>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                        {caseItem.title}
                      </CardTitle>
                      <CardDescription className="text-gray-500 text-xs font-medium mt-1">
                        Year of Judgment: {caseItem.year}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-6">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {caseItem.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => generateAiSummary(caseItem)}
                      className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      AI Legal Summary
                    </Button>

                    <details className="w-full mt-2">
                      <summary className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Read Ratio Decidendi & Legal Principles
                      </summary>
                      <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 leading-relaxed whitespace-pre-line">
                        {caseItem.full_text}
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI SUMMARY MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-none rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 flex flex-row items-center justify-between py-4 px-6">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Precedent Breakdown
                </CardTitle>
                <CardDescription className="truncate max-w-[320px] sm:max-w-md text-xs font-medium">
                  {selectedCase.title} ({selectedCase.year})
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCase(null);
                  setAiSummary(null);
                }}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-4">
              {loadingSummary ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-gray-500 animate-pulse">
                    Synthesizing constitutional principles and legal
                    implications...
                  </p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                  <ReactMarkdown>{aiSummary || ""}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
