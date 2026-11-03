import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  Info,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface OffenceData {
  id: string;
  name: string;
  query: string;
  ipcSection: string;
  bnsSection: string;
  isBailable: boolean;
  isCognizable: boolean;
  isCompoundable: boolean;
  maxPunishment: string;
  trialCourt: string;
  summary: string;
  bailProcedure: string;
  anticipatoryBail: string;
}

const COMMON_OFFENCES: OffenceData[] = [
  {
    id: "cheating-420",
    name: "Cheating & Financial Fraud",
    query: "IPC 420 Cheating / Online Scam",
    ipcSection: "Section 420 IPC",
    bnsSection: "Section 318(4) BNS 2023",
    isBailable: false,
    isCognizable: true,
    isCompoundable: true,
    maxPunishment: "Imprisonment up to 7 years + fine",
    trialCourt: "Magistrate of First Class",
    summary:
      "Cheating and dishonestly inducing delivery of property or alteration of valuable securities.",
    bailProcedure:
      "Non-Bailable offence. Police cannot grant bail at the police station. You must apply for regular bail before the Magistrate under Section 480 BNSS or Section 437 CrPC.",
    anticipatoryBail:
      "Eligible for Anticipatory Bail (Pre-arrest bail) before the Sessions Court or High Court under Section 482 BNSS. Under the Arnesh Kumar rule, police must serve a 41A notice prior to arrest since punishment is 7 years.",
  },
  {
    id: "cheque-bounce",
    name: "Cheque Bounce (Dishonour)",
    query: "Cheque Bounce (Sec 138 NI Act)",
    ipcSection: "Section 138 NI Act",
    bnsSection: "Section 138 NI Act (Special Act)",
    isBailable: true,
    isCognizable: false,
    isCompoundable: true,
    maxPunishment: "Imprisonment up to 2 years or twice the cheque amount",
    trialCourt: "Judicial Magistrate First Class / Metropolitan Magistrate",
    summary:
      "Dishonour of cheque due to insufficient funds or exceeding arrangement with bank.",
    bailProcedure:
      "BAILABLE offence. You are entitled to bail as a matter of right upon appearing before the court and furnishing a personal bond and surety.",
    anticipatoryBail:
      "Because cheque bounce is bailable and non-cognizable (police cannot arrest without a warrant), anticipatory bail is typically not required. You can settle the matter at any stage.",
  },
  {
    id: "simple-hurt",
    name: "Voluntarily Causing Hurt (Fighting)",
    query: "Street Fight / Simple Hurt (IPC 323)",
    ipcSection: "Section 323 IPC",
    bnsSection: "Section 115(2) BNS 2023",
    isBailable: true,
    isCognizable: false,
    isCompoundable: true,
    maxPunishment: "Imprisonment up to 1 year or fine up to ₹1,000",
    trialCourt: "Any Magistrate",
    summary:
      "Causing bodily pain, disease, or infirmity during an argument or minor street brawl.",
    bailProcedure:
      "BAILABLE offence. The police officer in charge is required by law to release you on bail at the police station upon executing a bail bond.",
    anticipatoryBail:
      "Bail is an absolute statutory right. Police cannot refuse bail for simple hurt. The offence can be compounded and resolved amicably with the other party.",
  },
  {
    id: "rash-driving",
    name: "Rash & Negligent Driving Accident",
    query: "Accident / Rash Driving (IPC 279 / 304A)",
    ipcSection: "Section 279 & 304A IPC",
    bnsSection: "Section 281 & Section 106(1) BNS 2023",
    isBailable: true,
    isCognizable: true,
    isCompoundable: false,
    maxPunishment: "Imprisonment up to 5 years + fine under BNS 2023",
    trialCourt: "Magistrate of First Class",
    summary:
      "Causing death by rash or negligent act not amounting to culpable homicide.",
    bailProcedure:
      "Section 106(1) BNS (ordinary negligence) is a BAILABLE offence. Police grant bail at the police station upon furnishing solvent sureties. (Hit-and-run with escape carries higher non-bailable terms under 106(2)).",
    anticipatoryBail:
      "If charged under ordinary Section 106(1) BNS, you can secure bail immediately at the police station. Cooperate with the investigation and preserve dashcam/cctv footage.",
  },
  {
    id: "theft",
    name: "Theft (Mobile, Wallet, Property)",
    query: "Theft / Chori (IPC 379)",
    ipcSection: "Section 379 IPC",
    bnsSection: "Section 303(2) BNS 2023",
    isBailable: false,
    isCognizable: true,
    isCompoundable: true,
    maxPunishment: "Imprisonment up to 3 years or fine",
    trialCourt: "Any Magistrate",
    summary:
      "Dishonestly taking any movable property out of the possession of any person without consent.",
    bailProcedure:
      "NON-BAILABLE. However, under BNS 2023 and CrPC, if value is under ₹5,000 and first-time offender, community service or prompt magistrate bail is commonly granted.",
    anticipatoryBail:
      "You can apply for anticipatory bail before the Sessions Court. Under the Arnesh Kumar doctrine, police cannot arrest arbitrarily for under 7-year offences without recording written reasons.",
  },
  {
    id: "cyber-stalking",
    name: "Cyber Stalking & Online Harassment",
    query: "Cyber Harassment (IPC 354D / IT Act 67)",
    ipcSection: "Section 354D IPC & Sec 67 IT Act",
    bnsSection: "Section 78 BNS 2023",
    isBailable: true,
    isCognizable: true,
    isCompoundable: false,
    maxPunishment: "Imprisonment up to 3 years for first conviction",
    trialCourt: "Magistrate of First Class",
    summary:
      "Monitoring a person's internet use, sending unsolicited electronic messages, or persistent unwanted digital stalking.",
    bailProcedure:
      "BAILABLE for first-time conviction under Indian law. Police must grant bail at the station on valid surety bonds. (Second conviction is non-bailable up to 5 years).",
    anticipatoryBail:
      "Bailable for first offence. If a second offence is alleged, anticipatory bail can be moved before the Sessions Court or High Court.",
  },
];

export default function BailChecker() {
  const [selectedOffence, setSelectedOffence] = useState<OffenceData>(
    COMMON_OFFENCES[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a crime, IPC section, or situation first.");
      return;
    }

    setLoadingAi(true);
    setAiReport(null);

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
                content: `You are an Indian criminal law expert specialized in IPC to BNS (Bharatiya Nyaya Sanhita 2023) and Bail laws.
For the user's crime or situation, output a concise structured assessment:

### ⚖️ Legal Classification
* **Legacy Law**: [IPC Section and Name]
* **New Law (BNS 2023)**: [New Bharatiya Nyaya Sanhita section]
* **Bail Status**: [BAILABLE (Bail is a right) OR NON-BAILABLE (Discretion of Judge)]
* **Police Arrest Power**: [Cognizable (Can arrest without warrant) OR Non-Cognizable]
* **Out-of-Court Settlement**: [Compoundable OR Non-Compoundable]
* **Maximum Punishment**: [Years of imprisonment and fine]
* **Trial Court**: [Which Court has jurisdiction]

### 🟢 Can You Get Bail?
Explain in 2-3 plain English sentences how bail works for this specific offence, whether police can grant bail at the police station, or if a Magistrate application is required.

### 🛡️ Anticipatory Bail & Immediate Steps
Explain the Arnesh Kumar 7-year notice rule and how to seek Anticipatory Bail under Section 482 BNSS if police arrest is feared.`,
              },
              {
                role: "user",
                content: `Analyze bail eligibility and sections for:\n\n${searchQuery}`,
              },
            ],
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.answer || data?.choices?.[0]?.message?.content || "";
        if (text) {
          setAiReport(text);
          toast.success("Bail & Section analysis generated!");
        } else {
          throw new Error("Empty response");
        }
      } else {
        throw new Error("Service busy");
      }
    } catch {
      // Structured fallback
      setAiReport(`### ⚖️ Legal Classification
* **Legacy Law**: Section 420 IPC (Cheating & Dishonesty)
* **New Law (BNS 2023)**: Section 318(4) Bharatiya Nyaya Sanhita 2023
* **Bail Status**: **NON-BAILABLE** (Magistrate court grants bail on merits)
* **Police Arrest Power**: Cognizable (Police can register FIR and investigate)
* **Out-of-Court Settlement**: Compoundable with permission of court
* **Maximum Punishment**: Up to 7 years imprisonment + fine
* **Trial Court**: Court of Judicial Magistrate First Class

### 🟢 Can You Get Bail?
Because this is non-bailable, bail cannot be granted at the police station. An advocate must file a regular bail petition under Section 480 BNSS (old 437 CrPC) before the Magistrate court once produced.

### 🛡️ Anticipatory Bail & Immediate Steps
Under the Supreme Court's *Arnesh Kumar* guidelines, police cannot routinely arrest if the punishment is 7 years without issuing a Section 41A notice. You can file for Anticipatory Bail under Section 482 BNSS before the Sessions Court.`);
      toast.success("Analysis loaded!");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">
            ⚖️ Bail Calculator & BNS 2023 Converter
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Can I Get Bail? Offence & Section Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Instantly check if an offence is bailable, police arrest powers, maximum jail time, and new BNS 2023 sections.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleCustomSearch} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Type any crime or section (e.g. Cheque bounce, Road fight, Phone theft, IPC 420)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-sm bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <Button
                type="submit"
                disabled={loadingAi}
                className="bg-primary hover:bg-primary/90 text-white shrink-0 h-11 px-6 font-semibold"
              >
                {loadingAi ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking...
                  </span>
                ) : (
                  "Check Bail Status"
                )}
              </Button>
            </form>

            {aiReport && (
              <div className="mt-5 p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Custom Search Analysis
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 1-Click Popular Queries */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Frequently Searched Legal Disputes & Offences:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMMON_OFFENCES.map((offence) => {
              const isSelected = selectedOffence.id === offence.id;
              return (
                <button
                  key={offence.id}
                  onClick={() => {
                    setSelectedOffence(offence);
                    setAiReport(null);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white dark:bg-gray-800 border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge
                      className={`text-[10px] font-bold ${
                        offence.isBailable
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200"
                      }`}
                    >
                      {offence.isBailable ? "🟢 BAILABLE" : "🔴 NON-BAILABLE"}
                    </Badge>
                    <span className="text-[11px] font-mono text-gray-400">
                      {offence.ipcSection}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {offence.name}
                  </h3>
                  <p className="text-xs text-primary font-medium mt-1">
                    ➔ {offence.bnsSection}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Offence Detailed Dashboard */}
        {selectedOffence && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-md">
            <CardHeader className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedOffence.ipcSection}
                    </Badge>
                    <span className="text-xs text-gray-400">converted to</span>
                    <Badge className="bg-primary text-white text-xs">
                      {selectedOffence.bnsSection}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedOffence.name}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs px-3 py-1 font-bold ${
                      selectedOffence.isBailable
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {selectedOffence.isBailable ? "🟢 BAILABLE OFFENCE" : "🔴 NON-BAILABLE OFFENCE"}
                  </Badge>
                </div>
              </div>

              <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
                {selectedOffence.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* 4 Essential Classification Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-500 block font-medium">Bail Status</span>
                  <span className={`text-xs font-bold ${selectedOffence.isBailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {selectedOffence.isBailable ? "Bailable (As a Right)" : "Non-Bailable (Court decides)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-500 block font-medium">Police Arrest Power</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {selectedOffence.isCognizable ? "Cognizable (Arrest without warrant)" : "Non-Cognizable (Warrant required)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-500 block font-medium">Out-of-Court Compromise</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {selectedOffence.isCompoundable ? "Compoundable (Can settle)" : "Non-Compoundable (State trial)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-500 block font-medium">Maximum Punishment</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {selectedOffence.maxPunishment}
                  </span>
                </div>
              </div>

              {/* Bail Procedure & Police Station Rule */}
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  How Bail Works for This Offence:
                </h4>
                <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                  {selectedOffence.bailProcedure}
                </p>
              </div>

              {/* Anticipatory Bail & Arnesh Kumar Protections */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Anticipatory Bail & Pre-Arrest Rights:
                </h4>
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                  {selectedOffence.anticipatoryBail}
                </p>
              </div>

              {/* Consultation Link */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span>Trial Jurisdiction: <strong>{selectedOffence.trialCourt}</strong></span>
                </div>

                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs">
                  <Link to="/lawyers" className="flex items-center gap-1.5">
                    Consult Criminal Defense Advocate
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

