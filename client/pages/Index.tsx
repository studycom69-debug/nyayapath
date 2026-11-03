import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Scale,
  Users,
  Award,
  Check,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Linkedin,
  Briefcase,
  FileText,
  Calculator,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Mic,
  FileSearch,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

// Custom styles for testimonials
import "./styles/testimonials.css";

// Smooth scroll implementation
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

export default function Index() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone))
      newErrors.phone = "Phone is invalid";

    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (!formData.service.trim()) newErrors.service = "Please select a service";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 1500)); // Simulated delay

    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", phone: "", service: "", message: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const testimonials = [
    {
      text: "NyayaPath's AI assistant provided me with instant legal guidance that saved me thousands in consultation fees. The contract analysis feature helped me avoid potential legal pitfalls.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Priya Sharma",
      role: "Startup Founder",
    },
    {
      text: "The case strategy planner gave me a clear roadmap for my property dispute. Every step was well-defined with timelines and cost estimates. Highly recommended for anyone navigating legal challenges!",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Rahul Verma",
      role: "Property Developer",
    },
    {
      text: "Drafting legal notices through NyayaPath saved me significant legal fees. The AI-powered documents were professional and court-ready. Excellent service!",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Anjali Mehta",
      role: "Business Owner",
    },
    {
      text: "The cost estimator provided accurate fee breakdowns for my divorce proceedings. No hidden charges, complete transparency. This tool helped me budget effectively!",
      image:
        "https://images.unsplash.com/photo-15075254273-94ef694bbf71f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Karan Singh",
      role: "Marketing Professional",
    },
    {
      text: "AI lawyer matching connected me with the perfect advocate for my criminal case. The lawyer's expertise matched exactly what I needed. Case resolved successfully!",
      image:
        "https://images.unsplash.com/photo-1472099643789-5d5942e0d6b736f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Sunita Choudhary",
      role: "Software Engineer",
    },
    {
      text: "Court news updates kept me informed about landmark judgments that affected my business. The AI summaries saved me hours of research time. Invaluable service!",
      image:
        "https://images.unsplash.com/photo-1573497039929-b768f64f56534171?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Deepak Kumar",
      role: "Business Analyst",
    },
    {
      text: "Legal notice generator helped me resolve a business dispute professionally. The document was court-compliant and saved me thousands in legal fees. Outstanding platform!",
      image:
        "https://images.unsplash.com/photo-150761658469-94def694bbf71f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Meera Reddy",
      role: "Restaurant Owner",
    },
    {
      text: "The chat with lawyer feature provided seamless communication with my advocate. Document sharing and real-time updates made the process smooth. Highly recommend!",
      image:
        "https://images.unsplash.com/photo-15075254273-94ef694bbf71f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Amit Patel",
      role: "Doctor",
    },
    {
      text: "WhatsApp bot integration provided instant legal assistance when I needed it most. Quick responses and professional advice. Game-changer for legal support!",
      image:
        "https://images.unsplash.com/photo-15075254273-94ef694bbf71f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Neha Gupta",
      role: "Freelancer",
    },
    {
      text: "Lawyer directory helped me find the perfect specialist for my startup. Detailed profiles and reviews made selection easy. Found excellent legal support!",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Vikram Joshi",
      role: "Entrepreneur",
    },
    {
      text: "Document review feature helped me ensure my business contracts were airtight. The AI analysis caught clauses I would have missed. Essential service!",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Kavita Nair",
      role: "Law Firm Partner",
    },
    {
      text: "Case strategy planner provided comprehensive roadmap for my litigation. Timeline and cost estimates were accurate. Helped me make informed decisions!",
      image:
        "https://images.unsplash.com/photo-15075254273-94ef694bbf71f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Rajesh Kumar",
      role: "Manufacturing Head",
    },
    {
      text: "Legal notice generator helped me resolve tenancy issues quickly. Professional documents that stood up in court. Saved me time and money!",
      image:
        "https://images.unsplash.com/photo-1472099643789-5d5942e0d6b736f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Shweta Singh",
      role: "Property Manager",
    },
    {
      text: "AI legal assistant provided instant answers for my family law queries. Accurate information saved me multiple consultation fees. Invaluable resource!",
      image:
        "https://images.unsplash.com/photo-1573497039929-b768f64f56534171?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Pooja Sharma",
      role: "Homemaker",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex items-center min-h-[90vh]">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0 L100 100 M100 0 L0 100"
              stroke="currentColor"
              strokeWidth="0.1"
              fill="none"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/20">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Legal Intelligence</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-8">
                Your Digital Path to{" "}
                <span className="text-primary italic">Justice.</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
                Empowering every citizen with AI-driven legal tools and direct
                access to top-tier legal experts. Fast, transparent, and
                professional.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  <Link to="/ai-assistant" className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Consult AI Now
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <Link to="/lawyers" className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Find a Lawyer
                  </Link>
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 overflow-hidden"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="user"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white">
                    5,000+
                  </span>{" "}
                  cases handled this month
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      NP
                    </div>
                    <div>
                      <div className="text-sm font-bold">NyayaPath AI</div>
                      <div className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        READY TO HELP
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm text-sm border border-gray-100 dark:border-gray-700 max-w-[80%]">
                      Hello! How can I assist you with Indian law today?
                    </div>
                    <div className="bg-primary text-white p-3 rounded-xl rounded-tr-none shadow-sm text-sm self-end ml-auto max-w-[80%]">
                      I need a legal strategy for a property dispute in
                      Bangalore.
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm text-sm border border-gray-100 dark:border-gray-700 max-w-[90%]">
                      I can help with that. Analyzing RERA guidelines for
                      Karnataka...
                    </div>
                  </div>
                  <div className="h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
                    <span className="text-xs text-gray-400">
                      Type your legal query...
                    </span>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Questions Resolved", value: "25k+" },
              { label: "Verified Lawyers", value: "1,200+" },
              { label: "User Satisfaction", value: "98%" },
              { label: "Success Rate", value: "85%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              Our Ecosystem
            </h2>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Legal Support at Your Fingertips
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              From AI analysis to human expertise, we provide everything you
              need to navigate the legal landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="h-8 w-8 text-rose-600" />,
                title: "🎙️ NyayaVoice (Voice Advocate)",
                description:
                  "Speak your legal problem naturally in Hindi, Hinglish, or English. Get instant advocate advice and natural spoken audio playback.",
                link: "/voice-advocate",
                color: "bg-rose-50 dark:bg-rose-900/20",
              },
              {
                icon: <FileSearch className="h-8 w-8 text-indigo-600" />,
                title: "📄 Notice & Summons Demystifier",
                description:
                  "Decode scary cheque bounce notices, loan recovery threats, and court letters. Expose bluff tactics and generate 1-click advocate replies.",
                link: "/notice-demystifier",
                color: "bg-indigo-50 dark:bg-indigo-900/20",
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
                title: "Police & Citizen Rights",
                description:
                  "Know what police can and cannot do during searches, night arrests, traffic stops, and FIR disputes.",
                link: "/citizen-rights",
                color: "bg-blue-50 dark:bg-blue-900/20",
              },
              {
                icon: <Scale className="h-8 w-8 text-amber-600" />,
                title: "Bail & Offence Checker",
                description:
                  "Instantly check if an offence is bailable, police arrest powers, jail terms, and new BNS 2023 sections.",
                link: "/bail-checker",
                color: "bg-amber-50 dark:bg-amber-900/20",
              },
              {
                icon: <Scale className="h-8 w-8 text-indigo-600" />,
                title: "AI Legal Assistant",
                description:
                  "Get instant answers to your legal queries based on the latest Indian laws and judgments.",
                link: "/ai-assistant",
                color: "bg-indigo-50 dark:bg-indigo-900/20",
              },
              {
                icon: <Briefcase className="h-8 w-8 text-emerald-600" />,
                title: "Strategy Planner",
                description:
                  "Generate a step-by-step roadmap for your legal case including costs and timelines.",
                link: "/case-strategy",
                color: "bg-emerald-50 dark:bg-emerald-900/20",
              },
              {
                icon: <FileText className="h-8 w-8 text-amber-600" />,
                title: "Legal Notice Generator",
                description:
                  "Draft professional legal notices in minutes with our automated legal document builder.",
                link: "/legal-notice",
                color: "bg-amber-50 dark:bg-amber-900/20",
              },
              {
                icon: <Calculator className="h-8 w-8 text-blue-600" />,
                title: "Cost Estimator",
                description:
                  "Know your expenses before you start. Get realistic estimates of lawyer fees and court costs.",
                link: "/cost-estimator",
                color: "bg-blue-50 dark:bg-blue-900/20",
              },
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                title: "Expert Matching",
                description:
                  "Our AI matches you with the top 3 specialized lawyers in your city for your specific case.",
                link: "/lawyer-ai-match",
                color: "bg-purple-50 dark:bg-purple-900/20",
              },
              {
                icon: <Clock className="h-8 w-8 text-rose-600" />,
                title: "Latest Court News",
                description:
                  "Stay informed with daily updates on landmark judgments and legal news across India.",
                link: "/court-news",
                color: "bg-rose-50 dark:bg-rose-900/20",
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all"
              >
                <div
                  className={`${service.color} h-16 w-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {service.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {service.description}
                </p>
                <Link
                  to={service.link}
                  className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                  Explore Feature <Clock className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              Testimonials
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by Thousands
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Hear what our clients have to say about their experience with
              NyayaPath.
            </p>
          </div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn
              testimonials={testimonials.slice(0, 6)}
              duration={15}
            />
            <TestimonialsColumn
              testimonials={testimonials.slice(6, 12)}
              className="hidden md:block"
              duration={17}
            />
            <TestimonialsColumn
              testimonials={testimonials.slice(12, 18)}
              className="hidden lg:block"
              duration={19}
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 md:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              About Us
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Making Justice Accessible to Every Indian
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto">
              NyayaPath is India's most advanced legal technology platform,
              combining cutting-edge AI with verified legal expertise to
              democratize access to justice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To make legal services affordable, accessible, and transparent
                for every citizen through technology innovation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To become India's trusted legal companion, bridging the gap
                between citizens and quality legal assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Values
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Transparency, affordability, and excellence in legal service
                delivery through continuous innovation.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose NyayaPath?
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      AI-Powered Legal Assistance
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get instant legal guidance from our advanced AI assistant,
                      available 24/7.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Verified Legal Experts
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      Connect with experienced lawyers vetted through our
                      rigorous verification process.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Transparent Pricing
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      No hidden fees. Know exactly what you'll pay with our cost
                      estimator.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Complete Legal Solutions
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      From legal notices to case strategy, we've got you
                      covered.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    50,000+
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Happy Clients Served
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        1000+
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Verified Lawyers
                      </p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        98%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Success Rate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              Contact
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Have questions about our legal services? We're here to help you
              navigate your legal journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Send us a Message
              </h4>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="ai-assistant">AI Legal Assistant</option>
                    <option value="case-strategy">
                      Case Strategy Planning
                    </option>
                    <option value="legal-notice">Legal Notice Generator</option>
                    <option value="cost-estimator">Cost Estimation</option>
                    <option value="lawyer-matching">Lawyer Matching</option>
                    <option value="document-review">Document Review</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.service && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.service}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us about your legal needs..."
                    required
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Contact Information
              </h4>
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Email Us
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300">
                        support@nyayapath.in
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Call Us
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300">
                        +91 1800 200 300
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Available Monday to Saturday, 9 AM to 7 PM IST.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FaWhatsapp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        WhatsApp Support
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300">
                        Instant Chat Available
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      window.open(
                        "https://wa.me/14155238886?text=👋%20Hello!%20I%27m%20interested%20in%20NyayaPath%27s%20legal%20services.%20Can%20you%20help%20me%20with%3A%0A%0A1.%20Legal%20consultation%0A2.%20Document%20review%0A3.%20Case%20assessment%0A4.%20Lawyer%20matching%0A%0APlease%20provide%20available%20options.",
                        "_blank",
                      )
                    }
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Start WhatsApp Chat
                  </Button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Office Location
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300">
                        Mumbai, India
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visit us for in-person consultations (by appointment only).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Scale className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">NyayaPath</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                The most advanced legal technology platform in India, designed
                to make justice accessible to every citizen.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <FaXTwitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    window.open(
                      "https://wa.me/14155238886?text=👋%20Hello!%20I%27m%20interested%20in%20NyayaPath%27s%20legal%20services.%20Can%20you%20help%20me%20with%3A%0A%0A1.%20Legal%20consultation%0A2.%20Document%20review%0A3.%20Case%20assessment%0A4.%20Lawyer%20matching%0A%0APlease%20provide%20available%20options.",
                      "_blank",
                    )
                  }
                >
                  <FaWhatsapp className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-bold mb-6">Legal Services</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <Link
                    to="/ai-assistant"
                    className="hover:text-primary transition-colors"
                  >
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link
                    to="/case-strategy"
                    className="hover:text-primary transition-colors"
                  >
                    Strategy Planner
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal-notice"
                    className="hover:text-primary transition-colors"
                  >
                    Notice Generator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cost-estimator"
                    className="hover:text-primary transition-colors"
                  >
                    Cost Estimator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="hover:text-primary transition-colors text-left w-full"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-primary transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="hover:text-primary transition-colors text-left w-full"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link
                    to="/lawyers"
                    className="hover:text-primary transition-colors"
                  >
                    Verified Lawyers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6">Support</h5>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@nyayapath.in</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+91 1800 200 300</span>
                </div>
                <div className="mt-6">
                  <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest">
                    Get our mobile app
                  </p>
                  <div className="flex gap-2">
                    <div className="h-10 w-28 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold border border-gray-700">
                      App Store
                    </div>
                    <div className="h-10 w-28 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold border border-gray-700">
                      Play Store
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center pt-10 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            © 2026 NyayaPath Legal Tech Pvt Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
