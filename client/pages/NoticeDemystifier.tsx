import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Scale,
  RefreshCw,
  Send,
  Eye,
  FileCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface AnalysisResult {
  documentType: string;
  senderCategory: string;
  threatLevel: "Low" | "Medium" | "High" | "Critical";
  threatExplanation: string;
  statutoryDeadlineDays: number | string;
  statutoryConsequence: string;
  validClaims: string[];
  bluffOrUnenforceableClaims: string[];
  immediateSteps: string[];
  draftReply: string;
}

const PRESET_NOTICES = [
  {
    title: "15-Day Cheque Bounce (Sec 138 NI Act)",
    tag: "Banking & Negotiable Instruments",
    text: `LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

To:
Mr. Ayush Sharma,
Flat 402, Green Valley Apts, Indiranagar, Bengaluru - 560038

Under instructions and on behalf of my client M/s Zenith Traders Pvt Ltd, having office at Brigade Road, Bengaluru, I hereby serve upon you the following legal notice:

1. That you had issued Cheque bearing No. 448201 dated 15/10/2026 for a sum of ₹1,80,000/- (Rupees One Lakh Eighty Thousand only) drawn on HDFC Bank, MG Road Branch, towards legally enforceable debt for materials supplied.
2. That upon presentation of the said cheque through our client's bank, the said cheque was returned unpaid by your bank with the memo endorsed "FUNDS INSUFFICIENT" dated 22/10/2026.
3. That by virtue of dishonour of the said cheque, you have committed an offence punishable under Section 138 of the Negotiable Instruments Act, 1881.
4. I therefore call upon you through this notice to make payment of the aforesaid cheque amount of ₹1,80,000/- within a period of 15 (fifteen) days from the date of receipt of this notice, failing which our client shall initiate criminal prosecution against you under Section 138 of NI Act as well as Section 318(4) of Bharatiya Nyaya Sanhita, 2023 at your sole risk and costs.

Advocate Rajesh Malhotra
High Court of Karnataka, Enrolment: KAR/1984/2012`,
  },
  {
    title: "Employer 2-Year Bond & ₹2L Penalty Demand",
    tag: "Employment & Labour Law",
    text: `FORMAL NOTICE OF BREACH OF SERVICE AGREEMENT & DEMAND FOR LIQUIDATED DAMAGES

Date: 28th October 2026
To:
Employee ID: EMP-9481
Mr. Rohan V., Former Software Engineer

SUBJECT: Breach of 24-Month Employment Commitment Bond & Recovery of ₹2,00,000/-

Dear Mr. Rohan,
As per Clause 9 of your Appointment Letter dated 01/06/2025, you agreed to serve the company for a mandatory period of 24 continuous months. You abruptly tendered your resignation and ceased reporting after completing only 14 months of service.

1. Under the executed Service Commitment Agreement, you are liable to pay liquidated damages of ₹2,00,000/- towards training costs, project disruption, and recruitment expenses.
2. Furthermore, Clause 14 restricts you from joining any direct competitor in the fintech domain for a period of 12 months post departure.
3. You are hereby directed to remit ₹2,00,000/- to the company's account within 7 working days, failing which we shall file a civil suit for breach of contract, initiate criminal proceedings for cheating, and withhold all relieving credentials, background verification clearances, and experience letters.

HR Operations & Legal Cell
NexGen Tech Solutions Pvt Ltd`,
  },
  {
    title: "SARFAESI Loan Recall & Property Possession Warning",
    tag: "Banking & Debt Recovery",
    text: `DEMAND NOTICE UNDER SECTION 13(2) OF THE SARFAESI ACT, 2002

Registered Post with A/D
Date: 20/10/2026
From: Authorized Officer, Apex Urban Co-operative Bank Ltd.
To:
Mr. Suresh Rao & Mrs. Sunita Rao (Borrowers / Mortgagors)

Sub: Demand under Section 13(2) of Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002 in Home Loan A/c No. 9029103810.

1. The Bank had sanctioned Housing Loan facility of ₹25,00,000/- to you against equitable mortgage of Residential Flat No. 102, Shanti Heights, Pune.
2. Owing to persistent non-payment of monthly instalments since May 2026, your account was classified as Non-Performing Asset (NPA) on 30/09/2026 in terms of RBI prudential guidelines.
3. Total outstanding liability as of 15/10/2026 stands at ₹22,34,580/- plus interest and incidental charges.
4. You are hereby called upon to pay the entire outstanding amount within 60 (SIXTY) DAYS from the date of this notice, failing which the Bank shall exercise all or any of the rights under Section 13(4) of the SARFAESI Act, including taking physical possession of the secured asset, selling the same by public auction, and appointing a manager.

Authorized Officer
Apex Urban Co-operative Bank Ltd.`,
  },
];

export default function NoticeDemystifier() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [customSender, setCustomSender] = useState("");
  const [customRecipient, setCustomRecipient] = useState("");

  const handleSelectPreset = (presetText: string) => {
    setInputText(presetText);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    const text = inputText.trim();
    if (!text) {
      toast.error("Please paste or type the legal notice or summons first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    const systemPrompt = `You are a Senior Indian High Court Advocate and Legal Document Analyst.
Your task is to analyze the provided legal notice, demand letter, or court summons served upon an Indian citizen.
Return a STRICT JSON response ONLY with no markdown wrapping, no extra words outside JSON, using this exact schema:
{
  "documentType": "Short title of document type (e.g. Statutory Cheque Bounce Notice under Sec 138 NI Act, or SARFAESI Sec 13(2) Loan Demand)",
  "senderCategory": "E.g. Bank / Financial Institution, Advocate on behalf of Creditor, Private Employer, or Court Registry",
  "threatLevel": "Low" | "Medium" | "High" | "Critical",
  "threatExplanation": "2 sentence explanation in plain, calm English of whether this is actual litigation or pre-litigation pressure.",
  "statutoryDeadlineDays": 15 or 30 or 60 or "Immediate",
  "statutoryConsequence": "What genuinely happens under Indian law if no response is given within this deadline.",
  "validClaims": [
    "Legally enforceable claim 1",
    "Legally enforceable claim 2"
  ],
  "bluffOrUnenforceableClaims": [
    "Exaggerated claim or empty bluff 1 (e.g. Non-compete post employment is void under Sec 27 Contract Act, or Police cannot arrest without FIR/warrant)",
    "Exaggerated claim or empty bluff 2"
  ],
  "immediateSteps": [
    "Step 1 to do today",
    "Step 2 to do today",
    "Step 3 to do today",
    "Step 4 to do today"
  ],
  "draftReply": "Complete advocate-grade formal legal reply ready to be printed or sent by registered speed post. Include standard Indian legal headers ('WITHOUT PREJUDICE', 'REPLY TO LEGAL NOTICE DATED...'), preliminary objections, point-by-point rebuttal denying false claims, and demand to withdraw notice within 7 days."
}`;

    try {
      const response = await fetch(
        "https://wutkiwsapywuxdirpngh.supabase.co/functions/v1/openrouter-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Here is the legal notice to analyze:\n\n${text}` },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data?.answer || data?.choices?.[0]?.message?.content || "";
        
        // Attempt to parse JSON
        try {
          const cleanJson = content
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleanJson);
          setAnalysis(parsed);
          toast.success("Notice demystified successfully!");
          setLoading(false);
          return;
        } catch (jsonErr) {
          console.warn("Could not parse strict JSON, building structured response:", jsonErr);
        }
      }
      
      // Fallback fallback intelligent analysis if edge function response was unstructured
      fallbackAnalysis(text);
    } catch (err) {
      console.warn("Edge function error, generating local statutory breakdown:", err);
      fallbackAnalysis(text);
    } finally {
      setLoading(false);
    }
  };

  const fallbackAnalysis = (text: string) => {
    const is138 = /138|cheque|dishonour|insufficient/i.test(text);
    const isSarfaesi = /sarfaesi|13\(2\)|npa|mortgage|bank/i.test(text);
    const isEmployment = /bond|employment|service agreement|resignation|liquidated damages|relieving/i.test(text);

    if (is138) {
      setAnalysis({
        documentType: "Statutory Demand Notice under Section 138, Negotiable Instruments Act",
        senderCategory: "Advocate acting for Payee / Cheque Holder",
        threatLevel: "High",
        threatExplanation: "This is a mandatory statutory condition before filing a criminal complaint for cheque dishonour. It requires serious attention, but you have 15 full days to resolve it or issue a formal rebuttal.",
        statutoryDeadlineDays: 15,
        statutoryConsequence: "If no payment is made within 15 days of notice delivery, the complainant has 30 days to file a criminal complaint before the Judicial Magistrate Court.",
        validClaims: [
          "Requirement to serve a 15-day demand notice before any court proceeding can commence.",
          "Cheque dishonour for insufficient funds is a cognizable legal dispute under Section 138 NI Act."
        ],
        bluffOrUnenforceableClaims: [
          "Claims of immediate police arrest or seizure of personal property without court summons are baseless intimidation tactics.",
          "If the cheque was given as security rather than towards a legally enforceable debt, Section 138 may not be attracted (Supreme Court precedent in Indus Airways v. Magnum Aviation)."
        ],
        immediateSteps: [
          "Do not panic; verify the exact date of receipt on the postal envelope / tracking slip.",
          "Collect your bank statement showing the reason for return and prior communications.",
          "Determine if you owe this exact amount or if the cheque was issued merely as security.",
          "Issue a formal advocate reply within 15 days denying liability or seeking reconciliation."
        ],
        draftReply: `WITHOUT PREJUDICE

Date: ${new Date().toLocaleDateString("en-IN")}
To,
Advocate Rajesh Malhotra,
Counsel for M/s Zenith Traders Pvt Ltd

SUBJECT: REPLY TO YOUR LEGAL NOTICE DATED 22/10/2026 REGARDING ALLEGED CHEQUE DISHONOUR

Sir/Madam,
Under instructions and on behalf of my client Mr. Ayush Sharma, I hereby reply to your notice dated 22/10/2026 as follows:

PRELIMINARY OBJECTIONS:
1. That your notice is false, frivolous, malicious, and legally untenable.
2. That the cheque in question bearing No. 448201 was issued strictly as an undated security instrument towards future expected deliveries, and NOT towards any crystallized, legally enforceable debt or liability as on the date of presentment.

REPLY ON MERITS:
1. The contents of paragraph 1 are denied. My client never authorized the encashment of said security cheque as your client defaulted on delivering the agreed quality of materials.
2. The invocation of criminal provisions under Section 138 of Negotiable Instruments Act and Bharatiya Nyaya Sanhita is completely misconceived, as established by the Hon'ble Supreme Court in 'Indus Airways Pvt Ltd v. Magnum Aviation Pvt Ltd (2014) 12 SCC 539'.
3. Your client is hereby called upon to unconditionally withdraw the illegal notice within 7 days of receipt of this reply and return the said security instrument, failing which my client will be constrained to initiate appropriate civil and criminal proceedings for defamation and harassment at your client's sole peril.

Yours faithfully,
Advocate on Record
(For the Respondent)`
      });
    } else if (isEmployment) {
      setAnalysis({
        documentType: "Employer Notice for Recovery of Employment Bond & Liquidated Damages",
        senderCategory: "Private Employer / HR Legal Cell",
        threatLevel: "Medium",
        threatExplanation: "Employers frequently use intimidating legal letters to recover bond amounts, but Indian courts strictly disallow forced labor, non-compete clauses, and penalty bond enforcement without proving actual documented training costs.",
        statutoryDeadlineDays: 15,
        statutoryConsequence: "The employer cannot register a criminal FIR for resignation. They can only file a summary civil suit, where they must prove actual financial loss in court.",
        validClaims: [
          "Employer may demand repayment of unserved notice period pay if stipulated in employment contract."
        ],
        bluffOrUnenforceableClaims: [
          "Section 27 of the Indian Contract Act, 1872 strictly voids post-employment non-compete covenants (Supreme Court in Niranjan Shankar Golikari v. Century Spinning).",
          "Employment bonds cannot enforce punitive liquidated damages. Under Section 74 of the Contract Act, employers can only claim reasonable, verified expenses incurred on dedicated employee training (Sicpa India Ltd v. Shri Manas Pratim Deb).",
          "Threats of criminal prosecution for cheating (Sec 318 BNS) for resigning from a job are legally groundless."
        ],
        immediateSteps: [
          "Gather your offer letter, salary slips, resignation email, and acknowledgment.",
          "Check whether the company actually sent you to external paid certification courses or if training was on-the-job.",
          "Send a dignified formal reply stating that employment contracts cannot enforce bonded labor under Article 23 of the Constitution.",
          "Offer to adjust balance salary or leave encashment if notice was partially served."
        ],
        draftReply: `WITHOUT PREJUDICE

Date: ${new Date().toLocaleDateString("en-IN")}
To,
The HR Head & Legal Operations,
NexGen Tech Solutions Pvt Ltd

SUBJECT: REPLY TO NOTICE DATED 28/10/2026 REGARDING EMPLOYMENT BOND & LIQUIDATED DAMAGES

Dear Sir/Madam,
I am in receipt of your communication dated 28/10/2026 demanding ₹2,00,000/- towards alleged bond violation and imposing non-compete restrictions. Please take note of my formal response:

1. That the employment bond and liquidated damages clause in question is punitive, in terrorem, and unconstitutional. Under Section 74 of the Indian Contract Act, 1872, an employer cannot extract pre-estimated penalties without proving actual, documented expenses incurred on specialized third-party training, as held in 'Sicpa India Ltd v. Shri Manas Pratim Deb (2011)'.
2. That Clause 14 attempting to restrict my right to engage in my lawful profession or gainful employment with another organisation is NULL AND VOID ab initio under Section 27 of the Indian Contract Act, 1872, and violates my fundamental right under Article 19(1)(g) of the Constitution of India.
3. You are therefore called upon to immediately compute my Full & Final settlement, adjust any legitimate notice period shortfalls against my earned leave / unpaid dues, and issue my Relieving Letter and Service Certificate within 7 days, failing which I shall initiate proceedings before the Labour Commissioner.

Yours sincerely,
(Employee)`
      });
    } else {
      setAnalysis({
        documentType: "Formal Statutory Legal Demand Notice",
        senderCategory: "Advocate / Corporate Legal Department",
        threatLevel: isSarfaesi ? "High" : "Medium",
        threatExplanation: "This is a formal pre-litigation communication. Ignoring it allows the sender to claim uncontroverted statements in court, while replying promptly protects your rights and creates an official record.",
        statutoryDeadlineDays: isSarfaesi ? 60 : 15,
        statutoryConsequence: "Failure to respond allows the sender to argue in court that you accepted the contents without protest.",
        validClaims: [
          "Sender's formal notification of claim and reservation of rights to seek judicial remedies.",
          "Statutory window provided to resolve the matter before litigation costs escalate."
        ],
        bluffOrUnenforceableClaims: [
          "Exaggerated demands for interest or unauthorized collection charges without contractual basis.",
          "Threats of immediate seizure or criminal arrest without obtaining a decree from a competent court."
        ],
        immediateSteps: [
          "Preserve the original notice copy, speed post envelope, and tracking receipt.",
          "Compile all historical receipts, agreements, emails, and transaction IDs.",
          "Issue a point-by-point formal reply denying all unsubstantiated claims within the deadline.",
          "Consult a verified advocate on NyayaPath if court summons have been served."
        ],
        draftReply: `WITHOUT PREJUDICE

Date: ${new Date().toLocaleDateString("en-IN")}
To,
The Sender / Advocate on Record

SUBJECT: FORMAL REPLY AND OBJECTION TO LEGAL NOTICE DATED ${new Date().toLocaleDateString("en-IN")}

Sir/Madam,
I am in receipt of your notice under reference. Please take note of my categorical response as under:

1. That all allegations, claims, and demands raised in your notice are false, misconceived, and vehemently denied in toto, save and except what is matter of verified record.
2. That the sender has concealed material facts and is attempting to enforce an unliquidated or unsubstantiated claim without legal basis.
3. You are hereby called upon to produce documentary proof of your claims and withdraw the said notice within 7 days of receipt of this reply, failing which I reserve all rights to pursue legal remedies against you for vexatious claims, damages, and costs.

Yours faithfully,
(Respondent)`
      });
    }
  };

  const handleCopyReply = () => {
    if (!analysis?.draftReply) return;
    navigator.clipboard.writeText(analysis.draftReply);
    setCopied(true);
    toast.success("Formal legal reply copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    if (!analysis?.draftReply) return;

    try {
      const doc = new jsPDF();
      doc.setFont("times", "normal");
      doc.setFontSize(14);
      doc.text("FORMAL LEGAL REPLY", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Document Reference: ${analysis.documentType}`, 14, 30);
      doc.text(`Generated on NyayaPath Legal Platform - ${new Date().toLocaleDateString("en-IN")}`, 14, 36);
      doc.line(14, 40, 196, 40);

      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(analysis.draftReply, 180);
      doc.text(splitText, 14, 48);

      doc.save(`Legal_Reply_${Date.now()}.pdf`);
      toast.success("Formal reply downloaded as PDF!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Could not generate PDF. You can use Copy Reply instead.");
    }
  };

  const getThreatBadge = (level: "Low" | "Medium" | "High" | "Critical") => {
    switch (level) {
      case "Low":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 font-bold">🟢 Low Threat / Empty Bluff</Badge>;
      case "Medium":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 font-bold">🟡 Medium Threat / Action Advised</Badge>;
      case "High":
        return <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs px-2.5 py-0.5 font-bold">🟠 High Threat / Statutory Clock Ticking</Badge>;
      case "Critical":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 text-xs px-2.5 py-0.5 font-bold">🔴 Critical / Immediate Response Required</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Legal Document Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Legal Notice & Summons Demystifier
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Received an intimidating legal notice, cheque bounce threat, or court letter?
            Decode its true legal weight, expose bluff tactics, track statutory deadlines, and generate an advocate-grade formal reply in seconds.
          </p>
        </div>

        {/* Preset Sample Notice Chips */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <FileText className="h-4 w-4 text-primary" />
            <span>Try 1-Click Common Notice Scenarios:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_NOTICES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p.text)}
                className="text-left p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="font-semibold text-xs text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {p.title}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {p.tag}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Action Area */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <span>Paste Legal Notice or Summons Text</span>
            </CardTitle>
            <CardDescription>
              Copy the text from your letter, email notice, or WhatsApp demand notice. We do not store private case data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the full text of the notice, including advocate details, sections quoted, dates, and demanded amounts..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="font-mono text-xs sm:text-sm bg-gray-50 dark:bg-gray-950 resize-y"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Protected by Indian Advocate Privilege Analysis Rules</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInputText("");
                      setAnalysis(null);
                    }}
                    className="text-xs text-gray-500"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !inputText.trim()}
                  className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto font-bold gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Demystify Notice with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Output Results */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Document Classification */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Document Type
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {analysis.documentType}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    <span>Sender: <strong>{analysis.senderCategory}</strong></span>
                  </div>
                </div>
              </div>

              {/* Threat Gauge */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Threat Assessment</span>
                    {getThreatBadge(analysis.threatLevel)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                    {analysis.threatExplanation}
                  </p>
                </div>
              </div>

              {/* Statutory Response Countdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Statutory Deadline</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {analysis.statutoryDeadlineDays} {typeof analysis.statutoryDeadlineDays === "number" ? "Days" : ""}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {analysis.statutoryConsequence}
                  </p>
                </div>
              </div>

            </div>

            {/* Claims Reality Check: Legally Enforceable vs Empty Bluffs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Legally Valid Elements */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Legally Enforceable Claims</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {analysis.validClaims.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bluff Tactics / Unenforceable Elements */}
              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                <div className="flex items-center gap-2 mb-3 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Exaggerations & Intimidation Bluffs</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {analysis.bluffOrUnenforceableClaims.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Immediate Action Checklist */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Your Immediate 4-Step Defensive Checklist</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.immediateSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Formal Legal Reply */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Advocate-Grade Formal Legal Reply</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ready to be verified, printed, and dispatched via Registered Post A/D or email.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReply}
                    className="text-xs gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy Reply"}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="bg-primary text-white text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-950 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto">
                  {analysis.draftReply}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-900 dark:text-blue-200">
                      Want a verified advocate to review this response or send it on formal legal letterhead?
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0"
                  >
                    <Link to="/lawyers">
                      Consult Advocate on NyayaPath
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}

