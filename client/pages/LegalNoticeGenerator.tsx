import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { Loader2, Download, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function LegalNoticeGenerator() {
  const [formData, setFormData] = useState({
    yourName: "",
    opponentName: "",
    issueType: "",
    date: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateNotice = async () => {
    setLoading(true);
    setGeneratedNotice(null);
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
                content: `You are an expert Indian Legal Advocate. Your task is to generate a highly professional, formal, and structured Legal Notice. 
                
Guidelines:
1. Use formal legal language (e.g., "Under instructions from my client", "Constrained to initiate", "Without prejudice").
2. DO NOT use placeholders like [Your Address] or [Date]. Use the provided details directly. 
3. If an address is not provided, use a formal generic placeholder like "Resident of [Location Provided]" or omit the specific line.
4. Structure: 
   - Top Right: Date and Place.
   - To: Recipient Name and Location.
   - Subject: Clear and Bold.
   - Body: Numbered paragraphs (1. Facts, 2. Grievance, 3. Legal Demand, 4. Notice Period, 5. Consequences).
   - Closing: "Yours faithfully" followed by the sender's name as the client.
5. Tone: Authoritative, firm, and legally sound.
6. Format: Use Markdown for bolding headers if appropriate, but keep the text suitable for a formal letter.`,
              },
              {
                role: "user",
                content: `
Generate a formal Legal Notice with these details:
Sender Name: ${formData.yourName}
Opponent Name: ${formData.opponentName}
Issue Type: ${formData.issueType}
Incident Date: ${formData.date}
Location: ${formData.location}

Description of Grievance:
${formData.description}

IMPORTANT: Ensure the notice is complete and ready to print. No empty brackets.`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      console.log("AI Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "AI Service Error");
      }

      // The openrouter-chat function returns { answer: "..." }
      // We check for 'answer' (from our edge function) or 'content' (standard AI response)
      const result =
        data?.answer || data?.content || data?.choices?.[0]?.message?.content;

      if (result) {
        setGeneratedNotice(result);
        toast.success("Legal notice generated successfully!");
      } else {
        console.error("No content found in AI response:", data);
        throw new Error("AI returned an empty response. Please try again.");
      }
    } catch (error: any) {
      console.error("AI Generation Failed:", error);

      // FALLBACK: If AI fails, use the professional template
      const lowerIssue = formData.issueType.toLowerCase();
      let legalProvisions = "Section 80 of the Code of Civil Procedure, 1908";
      let legalGrievance = `That my client, ${formData.yourName}, has a valid claim against you regarding ${formData.issueType}.`;

      if (lowerIssue.includes("rent") || lowerIssue.includes("tenant")) {
        legalProvisions = "Section 106 of the Transfer of Property Act, 1882";
        legalGrievance = `That you are a tenant in the premises located at ${formData.location} and have failed to comply with the terms of the lease agreement. Specifically, ${formData.description}.`;
      } else if (
        lowerIssue.includes("contract") ||
        lowerIssue.includes("agreement")
      ) {
        legalProvisions = "The Indian Contract Act, 1872";
        legalGrievance = `That you have committed a material breach of the agreement entered into on ${formData.date}. The details of the breach are: ${formData.description}.`;
      } else if (
        lowerIssue.includes("defamation") ||
        lowerIssue.includes("libel") ||
        lowerIssue.includes("slander")
      ) {
        legalProvisions = "Section 499 and 500 of the Indian Penal Code (IPC)";
        legalGrievance = `That you have made false and malicious statements against my client, ${formData.yourName}, which have caused significant damage to their reputation. Description of incident: ${formData.description}.`;
      }

      const fallbackNotice = `
LEGAL NOTICE
(FORMAL AND FINAL NOTICE)

Date: ${new Date().toLocaleDateString()}
Place: ${formData.location || "N/A"}

To,
${formData.opponentName || "[Opponent Name]"}

SUBJECT: LEGAL NOTICE UNDER ${legalProvisions.toUpperCase()} REGARDING ${formData.issueType.toUpperCase()}

Dear Sir/Madam,

Under instructions from and on behalf of my client, ${formData.yourName || "[Your Name]"}, I hereby serve you with the following legal notice:

1. STATEMENT OF FACTS:
That the facts leading to this notice are that on ${formData.date || "[Date]"} at ${formData.location || "[Location]"}, the following incident occurred:
${formData.description || "[Description]"}

2. LEGAL GRIEVANCE:
${legalGrievance}

3. LEGAL PROVISIONS:
Take notice that your actions are in direct violation of ${legalProvisions} and other applicable laws of India. My client has suffered significant loss/damage due to your conduct.

4. DEMAND FOR ACTION:
You are hereby called upon to settle this matter or provide a satisfactory response within 15 (fifteen) days from the date of receipt of this notice.

5. CONSEQUENCES:
Please be advised that if you fail to comply with this notice, my client will be constrained to initiate appropriate legal proceedings against you, including but not limited to civil and criminal litigation, at your own risk as to costs and consequences.

This is without prejudice to any other legal rights and remedies available to my client.

Yours faithfully,

(Advocate for ${formData.yourName || "[Your Name]"})
[FOR DEMO PURPOSES ONLY]
      `.trim();

      setGeneratedNotice(fallbackNotice);

      // If the error explicitly mentions API key, show it. Otherwise, show a general warning.
      if (
        error.message.toLowerCase().includes("api_key") ||
        error.message.toLowerCase().includes("unauthorized")
      ) {
        toast.error("AI Error: OpenAI API Key issues. Check Supabase Secrets.");
      } else {
        toast.warning(
          "AI is currently unavailable. Using professional template.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedNotice) return;

    // Simple function to strip markdown for PDF output
    const cleanText = generatedNotice
      .replace(/[#*]/g, "") // Remove # and *
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();

    const doc = new jsPDF();
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(cleanText, 180);
    doc.text(splitText, 15, 20);
    doc.save(`Legal_Notice_${formData.opponentName.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF downloaded!");
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6 border border-amber-200 dark:border-amber-800"
        >
          <FileText className="h-4 w-4" />
          <span>Automated Drafting</span>
        </motion.div>
        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Draft Professional{" "}
          <span className="text-amber-600">Legal Notices.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Fill in the details, and our AI will generate a legally-sound notice
          tailored to your specific issue.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <Card className="lg:col-span-5 shadow-2xl border-none bg-white dark:bg-gray-800 h-fit rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-amber-600/5 pb-8 pt-10 px-10">
            <CardTitle className="text-2xl font-black text-amber-600 tracking-tight flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Notice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Your Full Name
                </Label>
                <Input
                  name="yourName"
                  placeholder="John Doe"
                  value={formData.yourName}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900 border-none h-12 rounded-xl focus-visible:ring-amber-500 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Opponent Name
                </Label>
                <Input
                  name="opponentName"
                  placeholder="Jane Smith"
                  value={formData.opponentName}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900 border-none h-12 rounded-xl focus-visible:ring-amber-500 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Issue Type
              </Label>
              <Input
                name="issueType"
                placeholder="e.g. Non-payment, Property Dispute"
                value={formData.issueType}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900 border-none h-12 rounded-xl focus-visible:ring-amber-500 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Detailed Description
              </Label>
              <Textarea
                name="description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={handleChange}
                className="min-h-[150px] bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 focus-visible:ring-amber-500 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Notice Date
                </Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900 border-none h-12 rounded-xl focus-visible:ring-amber-500 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Filing Location
                </Label>
                <Input
                  name="location"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900 border-none h-12 rounded-xl focus-visible:ring-amber-500 shadow-inner"
                />
              </div>
            </div>

            <Button
              onClick={generateNotice}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-16 text-xl font-bold shadow-xl shadow-amber-500/20 rounded-xl transition-all hover:scale-[1.02] mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Drafting Notice...
                </>
              ) : (
                "Generate Legal Notice"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 shadow-2xl border-none bg-white dark:bg-gray-800 flex flex-col min-h-[600px] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-amber-600/5 pb-8 pt-10 px-10 border-b border-amber-600/10">
            <CardTitle className="flex items-center gap-3 text-amber-600 text-2xl font-black">
              <FileText className="h-8 w-8" />
              Generated Output
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {generatedNotice ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-white dark:bg-gray-900 p-10 font-serif text-sm overflow-y-auto max-h-[650px] leading-relaxed text-gray-800 dark:text-gray-200">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-sm dark:prose-invert max-w-none 
                      prose-h1:text-3xl prose-h1:font-black prose-h1:mb-6 prose-h1:border-b prose-h1:pb-4
                      prose-h2:text-xl prose-h2:font-black prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-amber-600
                      prose-p:mb-4 prose-li:mb-2 prose-strong:text-amber-700 dark:prose-strong:text-amber-400"
                  >
                    <ReactMarkdown>{generatedNotice}</ReactMarkdown>
                  </motion.div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={downloadPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-16 text-xl font-bold rounded-xl shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02]"
                  >
                    <Download className="h-6 w-6 mr-2" />
                    Download Official PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 bg-gray-50/30 dark:bg-gray-900/30">
                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <FileText className="h-12 w-12 opacity-10" />
                </div>
                <p className="text-center px-10 text-xl font-medium max-w-sm">
                  Complete the form to generate your professional legal notice.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-amber-800 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
          ⚠️ Legal Disclaimer
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          The Legal Notice Generator provides general information based on the
          details provided. It does not constitute formal legal advice and does
          not create an attorney-client relationship. Laws vary by jurisdiction
          and are subject to interpretation. Always consult with a qualified
          legal professional before sending any formal legal notice.
        </p>
      </div>
    </div>
  );
}
