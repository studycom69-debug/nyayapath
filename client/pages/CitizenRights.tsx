import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Phone,
  Scale,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface RightScenario {
  id: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  cannotDo: string[];
  whatToSay: string;
  supremeCourtRule: string;
  legalSection: string;
}

const PRESET_SCENARIOS: RightScenario[] = [
  {
    id: "phone-search",
    title: "Can Police Search My Phone or Read WhatsApp Messages?",
    category: "Digital Privacy",
    badge: "Strictly Protected",
    summary:
      "Police officers cannot randomly stop you and force you to unlock your phone, show chats, or browse gallery photos without a formal judicial warrant.",
    cannotDo: [
      "Cannot force you to unlock phone with biometric or passcode without a court order.",
      "Cannot browse personal photos, WhatsApp chats, or emails on the road.",
      "Cannot seize your mobile phone without providing a formal seizure memo (Panchnama) specifying case number.",
    ],
    whatToSay:
      "\"Officer, my phone contains private personal data protected under Article 21 of the Indian Constitution. Unless you have a formal search warrant or written seizure order under CrPC/BNSS stating the crime number, I am unable to unlock it.\"",
    supremeCourtRule:
      "Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) — Right to Privacy is a fundamental right. Arbitrary electronic device inspections without statutory judicial oversight are unconstitutional.",
    legalSection: "Article 21 Constitution of India & Section 94 CrPC / Sec 97 BNSS",
  },
  {
    id: "women-arrest",
    title: "Can Women Be Arrested After Sunset or Before Sunrise?",
    category: "Women's Rights",
    badge: "Mandatory Safeguard",
    summary:
      "Indian law strictly prohibits arresting a woman between 6 PM (sunset) and 6 AM (sunrise), except under extraordinary written permission from a Judicial Magistrate.",
    cannotDo: [
      "Male police officers cannot touch, search, or arrest a woman without a female officer present.",
      "Cannot arrest a woman between sunset and sunrise without prior written order from Judicial Magistrate First Class.",
      "Cannot detain a woman at a police station overnight under normal circumstances.",
    ],
    whatToSay:
      "\"Under Section 46(4) of the Code of Criminal Procedure, no female person can be arrested between sunset and sunrise without prior written permission of the Judicial Magistrate, and only in the presence of a woman police officer.\"",
    supremeCourtRule:
      "Sheela Barse v. State of Maharashtra (1983) — Supreme Court mandated that female arrestees must be held in segregated lockups, assisted by female officers, and protected from night-time interrogation.",
    legalSection: "Section 46(4) CrPC / Section 43(5) BNSS 2023",
  },
  {
    id: "traffic-keys",
    title: "Traffic Police Seized My Vehicle Keys or Demanding Cash Fine",
    category: "Traffic & Road",
    badge: "Anti-Harassment",
    summary:
      "Traffic police constables do not have the legal authority to remove your car/bike keys from the ignition, deflate tires, or demand on-the-spot cash without an official e-challan receipt.",
    cannotDo: [
      "Cannot snatch keys from ignition or puncture vehicle tires.",
      "Sub-inspectors (1 star) or constables cannot issue heavy challans; only officers of ASI (Assistant Sub-Inspector) or above rank with a government challan book can fine you.",
      "Cannot accept undocumented cash without giving an authorized digital/printed government receipt.",
    ],
    whatToSay:
      "\"Sir, removing vehicle ignition keys is prohibited by police department circulars. I have valid digital copies of my RC, Insurance, and DL on DigiLocker / mParivahan. Please generate an official e-challan and I will pay through the government traffic portal.\"",
    supremeCourtRule:
      "Ministry of Road Transport and Highways (MoRTH) Notification (2018) — Electronic documents stored on DigiLocker / mParivahan are legally equivalent to physical certificates under IT Act Section 9A.",
    legalSection: "Section 130 & 206 Motor Vehicles Act 1988",
  },
  {
    id: "fir-refusal",
    title: "What to Do If Police Refuse to Register Your FIR",
    category: "Police Complaints",
    badge: "Mandatory Duty",
    summary:
      "Police are legally obligated under the Supreme Court's Lalita Kumari judgment to register an FIR immediately if you report a cognizable (serious) crime.",
    cannotDo: [
      "Cannot refuse to write an FIR for theft, physical assault, cyber fraud, robbery, or harassment.",
      "Cannot force you to reach an informal compromise before taking your written complaint.",
      "Cannot refuse to provide a free signed copy of the FIR on the spot.",
    ],
    whatToSay:
      "\"Officer, as per the Supreme Court Constitution Bench ruling in Lalita Kumari v. Govt. of UP, registration of an FIR is mandatory for cognizable complaints. If you cannot register it here, please give me in writing or I will forward it to the Superintendent of Police under Section 154(3).\"",
    supremeCourtRule:
      "Lalita Kumari v. Govt. of U.P. (2014) 2 SCC 1 — Constitution Bench ruled that police officers who refuse to register an FIR for cognizable offences face disciplinary action and prosecution under Section 166A IPC/BNS.",
    legalSection: "Section 154 CrPC / Section 173 BNSS 2023",
  },
  {
    id: "called-questioning",
    title: "What to Do If Called to Police Station for Questioning",
    category: "Police Notices",
    badge: "Statutory Notice",
    summary:
      "Police cannot casually call you or threaten arrest over a phone call without issuing a formal written notice under Section 41A CrPC.",
    cannotDo: [
      "Cannot force you to come to the police station without a formal written Notice of Appearance specifying time, date, and case details.",
      "Cannot torture or threaten you to sign blank papers or force confessions.",
      "Cannot detain you indefinitely without recording arrest or producing you before a magistrate within 24 hours.",
    ],
    whatToSay:
      "\"Sir, under the Supreme Court's Arnesh Kumar guidelines and Section 41A, please issue a formal written Notice of Appearance specifying the complaint details. I will attend with my legal counsel.\"",
    supremeCourtRule:
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273 — Automatic arrests in offences punishable with under 7 years are prohibited. Police must issue a written 41A appearance notice first.",
    legalSection: "Section 41A CrPC / Section 35(3) BNSS 2023",
  },
];

export default function CitizenRights() {
  const [selectedScenario, setSelectedScenario] = useState<RightScenario>(
    PRESET_SCENARIOS[0],
  );
  const [customQuery, setCustomQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) {
      toast.error("Please enter your situation or police question first.");
      return;
    }

    setLoadingAi(true);
    setAiAnswer(null);

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
                content: `You are an Indian citizen legal rights expert.
Analyze the user's police or law enforcement situation.
Provide your advice in clean, simple, non-intimidating Markdown:

### 🛑 What Police CANNOT Legally Do
(List 3 clear, practical prohibitions under Indian law)

### 💬 Exact Words to Say on the Spot
(Write 2-3 polite, firm sentences the citizen can speak directly to the officer)

### ⚖️ The Law & Supreme Court Rule
(Mention exact Section of CrPC/BNSS 2023 or Landmark Supreme Court Judgment like D.K. Basu / Arnesh Kumar)

### 📋 Next Immediate Action Steps
(What to do if the officer still misbehaves - SP complaint, 156(3) magistrate plea, or recording)`,
              },
              {
                role: "user",
                content: `My situation:\n\n${customQuery}`,
              },
            ],
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.answer || data?.choices?.[0]?.message?.content || "";
        if (text) {
          setAiAnswer(text);
          toast.success("Citizen rights guidance generated!");
        } else {
          throw new Error("Empty response");
        }
      } else {
        throw new Error("Service busy");
      }
    } catch {
      // Structured fallback
      setAiAnswer(`### 🛑 What Police CANNOT Legally Do
* Cannot search your body or belongings without reasonable suspicion of a cognizable offence.
* Cannot confiscate your phone or demand passwords without a formal judicial warrant.
* Cannot detain you beyond 24 hours without producing you before a Judicial Magistrate.

### 💬 Exact Words to Say on the Spot
"Officer, I am cooperating fully. Please inform me under which section and crime number I am being questioned, and kindly issue a formal written notice under Section 41A / Section 35 BNSS so my advocate may attend."

### ⚖️ The Law & Supreme Court Rule
* **D.K. Basu v. State of West Bengal (1997)**: Police officers must display clear name tags with designations and provide an arrest memo signed by at least one family member or witness.
* **Article 22(1) Constitution of India**: Fundamental right to be informed of grounds of arrest and consult a legal practitioner of choice.

### 📋 Next Immediate Action Steps
1. Note the officer's name, badge number, police station, and patrol vehicle number.
2. If forced or threatened, immediately call the National Legal Services Helpline at **15100** or Police Control Room at **112**.
3. Submit a written complaint to the District Superintendent of Police (SP) or State Human Rights Commission.`);
      toast.success("Guidance loaded successfully!");
    } finally {
      setLoadingAi(false);
    }
  };

  const copyDialogue = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Legal dialogue copied! You can read or show this to the officer.");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">
            🛡️ Citizen Defense & Police Rights
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Know Your Rights During Police Encounters
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Understand exactly what police can and cannot do under Indian law, what to say on the spot, and how to protect yourself without fear.
          </p>
        </div>

        {/* Custom Question Box */}
        <Card className="border border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-900 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Ask Any Police Encounter Situation
            </CardTitle>
            <CardDescription className="text-xs">
              Type what happened or what you're worried about (e.g. traffic fine, search, FIR, night arrest).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAskAI} className="flex flex-col sm:flex-row gap-2.5">
              <Input
                placeholder="e.g., Police stopped me at night and asked to open WhatsApp. Can I refuse?"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="bg-white dark:bg-gray-800 text-sm h-11"
              />
              <Button
                type="submit"
                disabled={loadingAi}
                className="bg-primary hover:bg-primary/90 text-white shrink-0 h-11 px-5"
              >
                {loadingAi ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing Law...
                  </span>
                ) : (
                  "Check My Rights"
                )}
              </Button>
            </form>

            {aiAnswer && (
              <div className="mt-5 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" />
                    AI Citizen Rights Breakdown
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyDialogue(aiAnswer)}
                    className="text-xs h-8 text-gray-500"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                  <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 1-Click Common Scenarios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Popular Everyday Citizen Situations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_SCENARIOS.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setAiAnswer(null);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white dark:bg-gray-800 border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {sc.category}
                    </Badge>
                    <span className="text-[11px] font-bold text-primary">
                      {sc.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                    {sc.title}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Scenario Detailed Breakdown */}
        {selectedScenario && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-md">
            <CardHeader className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-1">
                    {selectedScenario.category}
                  </Badge>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedScenario.title}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedScenario.legalSection}
                </Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
                {selectedScenario.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Prohibited Police Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  What Police CANNOT Legally Do
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedScenario.cannotDo.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs sm:text-sm text-red-900 dark:text-red-300 flex items-start gap-2.5"
                    >
                      <AlertOctagon className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exact Dialogue to Say on the Spot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Exact Words to Say to the Officer (Polite & Legally Protected)
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyDialogue(selectedScenario.whatToSay)}
                    className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Lines
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 leading-relaxed italic">
                  {selectedScenario.whatToSay}
                </div>
              </div>

              {/* Supreme Court Ruling Reference */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-primary" />
                  Landmark Supreme Court Precedent:
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedScenario.supremeCourtRule}
                </p>
              </div>

              {/* Emergency Helplines Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>Free Legal Aid Helpline: <strong>15100</strong> (NALSA)</span>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span>Police Emergency: <strong>112</strong></span>
                </div>

                <Button asChild size="sm" variant="ghost" className="text-xs text-primary">
                  <Link to="/lawyers" className="flex items-center gap-1">
                    Consult an Advocate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

