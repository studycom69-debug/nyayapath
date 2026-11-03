import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  UserCheck,
  MapPin,
  Star,
  Briefcase,
  IndianRupee,
  MessageSquare,
  Sparkles,
  Scale,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Lawyer {
  id: string;
  full_name: string;
  specialization: string;
  location: string;
  experience: number;
  consultation_fee?: number;
  rating?: number;
  reviews?: number;
}

const DEFAULT_RECOMMENDATION_LAWYERS: Lawyer[] = [
  {
    id: "lawyer-1-demo",
    full_name: "Adv. Rajesh Sharma",
    specialization: "Corporate Law",
    location: "New Delhi",
    experience: 14,
    consultation_fee: 1500,
    rating: 4.9,
    reviews: 38,
  },
  {
    id: "lawyer-2-demo",
    full_name: "Adv. Priya Deshmukh",
    specialization: "Family Law",
    location: "Mumbai",
    experience: 11,
    consultation_fee: 1000,
    rating: 4.8,
    reviews: 52,
  },
  {
    id: "lawyer-3-demo",
    full_name: "Adv. Vikram Sethi",
    specialization: "Criminal Law",
    location: "Bengaluru",
    experience: 18,
    consultation_fee: 2000,
    rating: 4.9,
    reviews: 64,
  },
  {
    id: "lawyer-4-demo",
    full_name: "Adv. Ananya Roy",
    specialization: "Property Law",
    location: "Kolkata",
    experience: 9,
    consultation_fee: 1200,
    rating: 4.7,
    reviews: 29,
  },
  {
    id: "lawyer-5-demo",
    full_name: "Adv. Amit Verma",
    specialization: "Labour Law",
    location: "Hyderabad",
    experience: 12,
    consultation_fee: 900,
    rating: 4.8,
    reviews: 41,
  },
  {
    id: "lawyer-6-demo",
    full_name: "Adv. Meenakshi Sundaram",
    specialization: "Tax Law",
    location: "Chennai",
    experience: 16,
    consultation_fee: 2500,
    rating: 4.9,
    reviews: 47,
  },
];

export default function LawyerRecommendation() {
  const [issue, setIssue] = useState("");
  const [city, setCity] = useState("");
  const [recommendedType, setRecommendedType] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);

  const detectCaseType = async () => {
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
                content:
                  "Classify the legal issue into one category only: Criminal Law, Civil Law, Family Law, Corporate Law, Cyber Law, Property Law, Labour Law, Tax Law. Return ONLY the category name.",
              },
              {
                role: "user",
                content: issue,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      return (
        data?.answer ||
        data?.content ||
        data?.choices?.[0]?.message?.content?.trim() ||
        "General Practice"
      );
    } catch (error) {
      console.error("AI Classification Error:", error);
      return "General Practice";
    }
  };

  const fetchLawyerWithRating = async (lawyerId: string) => {
    const { data: reviews } = await supabase
      .from("lawyer_reviews")
      .select("rating")
      .eq("lawyer_id", lawyerId);

    if (reviews && reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length,
      };
    }
    return { rating: 0, reviewCount: 0 };
  };

  const recommendLawyers = async () => {
    if (!issue.trim() || !city.trim()) {
      toast.error("Please describe your issue and enter your city.");
      return;
    }

    setLoading(true);
    setLawyers([]);
    setRecommendedType("");

    try {
      const type = await detectCaseType();
      setRecommendedType(type);

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "lawyer")
        .ilike("specialization", `%${type}%`)
        .ilike("location", `%${city}%`)
        .limit(3);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const lawyersWithRatings = await Promise.all(
          profiles.map(async (lawyer: any) => {
            const ratingData = await fetchLawyerWithRating(lawyer.id);
            return {
              id: lawyer.id,
              full_name: lawyer.full_name || "Unknown Lawyer",
              specialization: lawyer.specialization || type,
              location: lawyer.location || city,
              experience: lawyer.experience || 0,
              consultation_fee: lawyer.consultation_fee || 500, // Default if missing
              rating: ratingData.rating,
              reviews: ratingData.reviewCount,
            };
          }),
        );
        setLawyers(lawyersWithRatings);
        toast.success(`Matched with top ${type} experts!`);
      } else {
        const fallbackMatches = DEFAULT_RECOMMENDATION_LAWYERS.filter(
          (l) =>
            l.specialization.toLowerCase().includes(type.toLowerCase()) ||
            type.toLowerCase().includes(l.specialization.toLowerCase()),
        );
        const results =
          fallbackMatches.length > 0
            ? fallbackMatches
            : DEFAULT_RECOMMENDATION_LAWYERS.slice(0, 3);
        setLawyers(results);
        toast.success(
          `Matched with recommended ${type || "legal"} specialists!`,
        );
      }
    } catch (error) {
      console.error(error);
      setLawyers(DEFAULT_RECOMMENDATION_LAWYERS.slice(0, 3));
      toast.success("Showing top recommended lawyers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest mb-6 border border-purple-200 dark:border-purple-800"
        >
          <Sparkles className="h-4 w-4" />
          <span>Intelligent Matching</span>
        </motion.div>
        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Find Your Perfect{" "}
          <span className="text-purple-600">Legal Expert.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Describe your legal challenge, and our AI will hand-pick the top
          specialized lawyers in your city.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <Card className="lg:col-span-4 shadow-2xl border-none bg-white dark:bg-gray-800 h-fit rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-purple-600/5 pb-8 pt-10 px-10">
            <CardTitle className="text-2xl font-black text-purple-600 tracking-tight">
              Smart Match
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium">
              We analyze your case and filter our verified directory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-10">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Describe your issue
              </label>
              <Textarea
                placeholder="e.g. My landlord is refusing to return my security deposit in Bangalore..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="min-h-[180px] bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-5 text-lg focus-visible:ring-purple-500 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Your City
              </label>
              <Input
                placeholder="e.g. Bangalore, Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-none h-14 text-lg rounded-2xl focus-visible:ring-purple-500 shadow-inner"
              />
            </div>
            <Button
              onClick={recommendLawyers}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-16 text-xl font-bold shadow-xl shadow-purple-500/20 rounded-2xl transition-all hover:scale-[1.02] mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Analyzing Case...
                </>
              ) : (
                "Find Best Lawyers"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-8 space-y-8">
          {recommendedType && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-purple-600 text-white p-6 rounded-[1.5rem] shadow-xl shadow-purple-500/10 flex items-center justify-between overflow-hidden relative"
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                    AI Classification
                  </div>
                  <div className="text-2xl font-black">{recommendedType}</div>
                </div>
              </div>
              <Sparkles className="h-20 w-20 absolute -right-4 -bottom-4 opacity-20" />
            </motion.div>
          )}

          {lawyers.length > 0 ? (
            <div className="grid gap-6">
              {lawyers.map((lawyer, idx) => (
                <motion.div
                  key={lawyer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] group">
                    <div className="flex flex-col sm:flex-row">
                      <div className="bg-purple-600 p-8 flex flex-col items-center justify-center text-white sm:w-56 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform">
                          <Scale className="h-10 w-10" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-black shadow-lg relative z-10">
                          <Star className="h-4 w-4 fill-purple-600" />
                          {lawyer.rating || "New"}
                        </div>
                      </div>
                      <CardContent className="p-10 flex-1">
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {lawyer.full_name}
                              </h3>
                              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm mt-2 uppercase tracking-widest">
                                <Briefcase className="h-4 w-4" />
                                {lawyer.specialization}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-end">
                                <IndianRupee className="h-5 w-5" />
                                {lawyer.consultation_fee || 500}
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                Fee / Session
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium">
                              <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                              {lawyer.location}
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium">
                              <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-gray-400" />
                              </div>
                              {lawyer.experience}+ Years Exp.
                            </div>
                          </div>

                          <div className="mt-auto flex gap-4">
                            <Button
                              asChild
                              className="flex-1 bg-purple-600 hover:bg-purple-700 h-14 rounded-xl shadow-lg shadow-purple-500/20 text-lg font-bold"
                            >
                              <Link to={`/chat/${lawyer.id}`}>
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Consult Now
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="flex-1 border-2 border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 h-14 rounded-xl text-lg font-bold transition-all"
                            >
                              <Link to="/lawyers">Full Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <div className="h-24 w-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <Scale className="h-12 w-12 opacity-10" />
                </div>
                <p className="text-center px-10 text-xl font-medium max-w-md leading-relaxed">
                  {recommendedType
                    ? `Our specialists in ${city} are currently busy. Try broadening your city or search our directory.`
                    : "Your personalized expert matches will appear here once you describe your case."}
                </p>
                {!recommendedType && (
                  <Button
                    asChild
                    variant="link"
                    className="mt-6 text-purple-600 text-lg font-bold"
                  >
                    <Link to="/lawyers">Browse Full Directory</Link>
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
