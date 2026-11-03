import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Calculator,
  IndianRupee,
  Clock,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function CostEstimator() {
  const [caseType, setCaseType] = useState("");
  const [city, setCity] = useState("");
  const [complexity, setComplexity] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const estimateCost = async () => {
    if (!caseType || !city || !complexity) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setResult("");

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
                content: `
You are a professional legal consultant in India. 
Estimate realistic legal costs and duration based on case type, city, and complexity. 
Provide structured output in INR using clean Markdown.

# LEGAL COST & TIME ESTIMATE

## 1. Estimated Filing Fees
Break down typical court fees for this case type and claim value.

## 2. Lawyer Fee Range (INR)
Estimate consultation and retainership fees based on the city provided (tier-1 vs tier-2).

## 3. Estimated Duration
Provide a realistic timeline for different stages of the case.

## 4. Possible Hidden Costs
Mention expenses like stamp duty, typing, process server fees, or expert witness costs.

## 5. Settlement vs Litigation Recommendation
Provide a strategic suggestion on whether to pursue out-of-court settlement.

Be realistic and transparent. Use bold headers for each section.`,
              },
              {
                role: "user",
                content: `
Case Type: ${caseType} 
City: ${city} 
Complexity: ${complexity} 
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
        setResult(content);
        toast.success("Estimate generated!");
      } else {
        throw new Error("Using realistic fee estimator fallback.");
      }
    } catch (error) {
      console.warn("Using cost estimate fallback:", error);
      const isTier1 = [
        "delhi",
        "mumbai",
        "bengaluru",
        "bangalore",
        "chennai",
        "hyderabad",
        "kolkata",
        "pune",
      ].some((c) => city.toLowerCase().includes(c));

      const courtFee =
        complexity === "High"
          ? "₹2,500 – ₹10,000"
          : complexity === "Medium"
            ? "₹1,000 – ₹3,500"
            : "₹500 – ₹1,500";
      const lawyerFee = isTier1
        ? complexity === "High"
          ? "₹45,000 – ₹1,50,000"
          : complexity === "Medium"
            ? "₹25,000 – ₹60,000"
            : "₹15,000 – ₹30,000"
        : complexity === "High"
          ? "₹25,000 – ₹70,000"
          : complexity === "Medium"
            ? "₹15,000 – ₹35,000"
            : "₹8,000 – ₹20,000";
      const duration =
        complexity === "High"
          ? "12 – 24 Months"
          : complexity === "Medium"
            ? "6 – 12 Months"
            : "2 – 6 Months";

      const fallbackEstimate = `
# LEGAL COST & DURATION ESTIMATE

**Case Type:** ${caseType}  
**Jurisdiction:** ${city} (${isTier1 ? "Tier-1 Metro City" : "Tier-2 / Regional Jurisdiction"})  
**Complexity:** ${complexity}

---

## 1. Estimated Court & Stamp Fees
- **Filing & Process Fees:** ${courtFee}
- **Vakalatnama & Court Stamps:** ₹150 – ₹500
- **Typing, Affidavits & Notary:** ₹500 – ₹1,500

## 2. Lawyer Retainership & Appearance Fees
- **Estimated Counsel Range:** ${lawyerFee}
- **Initial Legal Notice & Drafting:** ₹3,000 – ₹8,000
- **Per-Hearing Appearance:** ₹2,500 – ₹10,000 (Tier adjusted)

## 3. Projected Case Duration
- **Notice & Response Window:** 15 – 30 Days
- **First Appearance & Pleadings:** 45 – 90 Days
- **Total Resolution Horizon:** **${duration}**

## 4. Alternate Dispute Resolution (ADR)
Given the litigation timeline, pursuing **Pre-Institution Mediation** (under the Mediation Act, 2023 or Lok Adalat) is strongly advised to resolve the dispute in under 90 days at a fraction of the cost.
      `.trim();

      setResult(fallbackEstimate);
      toast.success("Cost & timeline estimate generated!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Legal Cost & Time Estimator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get transparent, AI-powered estimates for legal expenses and timelines
          in India.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-2xl border-none bg-white dark:bg-gray-800 h-fit rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 pt-10 px-10">
            <CardTitle className="flex items-center gap-3 text-primary text-2xl font-black">
              <Calculator className="h-8 w-8" />
              Case Details
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium">
              Help us understand your situation for a precise estimate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-10">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Case Type
              </label>
              <Input
                placeholder="e.g. Divorce, Rent Dispute, Property Theft"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-none h-14 text-lg rounded-xl focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-400">
                City
              </label>
              <Input
                placeholder="e.g. Mumbai, Delhi, Lucknow"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-none h-14 text-lg rounded-xl focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Complexity Level
              </label>
              <Select onValueChange={setComplexity} value={complexity}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-none h-14 text-lg rounded-xl focus:ring-primary">
                  <SelectValue placeholder="Select Complexity" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="Low">
                    Low (Simple filing/agreement)
                  </SelectItem>
                  <SelectItem value="Medium">
                    Medium (Disputed/Standard litigation)
                  </SelectItem>
                  <SelectItem value="High">
                    High (Multi-party/Complex evidence)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={estimateCost}
              disabled={loading}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-white h-16 text-xl font-bold shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Generate Estimate"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none bg-white dark:bg-gray-800 flex flex-col min-h-[550px] rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-green-500/5 pb-8 pt-10 px-10 border-b border-green-500/10">
            <CardTitle className="flex items-center gap-3 text-green-600 text-2xl font-black">
              <IndianRupee className="h-8 w-8" />
              Transparency Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {result ? (
              <div className="flex-1 bg-white dark:bg-gray-900 p-10 font-sans text-sm overflow-y-auto max-h-[600px] leading-relaxed text-gray-800 dark:text-gray-200">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm dark:prose-invert max-w-none 
                    prose-h1:text-3xl prose-h1:font-black prose-h1:mb-6 prose-h1:border-b prose-h1:pb-4
                    prose-h2:text-xl prose-h2:font-black prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-primary
                    prose-p:mb-4 prose-li:mb-2 prose-strong:text-primary dark:prose-strong:text-primary"
                >
                  <ReactMarkdown>{result}</ReactMarkdown>
                </motion.div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 bg-gray-50/30 dark:bg-gray-900/30">
                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-12 w-12 opacity-20" />
                </div>
                <p className="text-center px-6 text-lg font-medium max-w-xs">
                  Fill in the case details to see a realistic cost and time
                  breakdown.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-amber-800 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Important Disclaimer
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          The Legal Cost & Time Estimator provides automated approximations
          based on market averages and AI analysis. These are not guaranteed
          figures. Actual lawyer fees, court costs, and timelines may vary
          significantly based on individual case specifics, judicial discretion,
          and market fluctuations.
        </p>
      </div>
    </div>
  );
}
