import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Star, MapPin, Phone, Mail } from "lucide-react";

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  location: string;
  email: string;
  phone: string;
  rating: number;
  reviews: number;
  experience: number;
  bio: string;
  profileImage?: string;
}

const DEFAULT_LAWYERS = [
  {
    id: "lawyer-1-demo",
    name: "Adv. Rajesh Sharma",
    specialization: "Corporate Law",
    location: "New Delhi, Delhi",
    email: "rajesh.sharma@example.com",
    phone: "+91 98110 12345",
    rating: 4.9,
    reviews: 38,
    experience: 14,
    bio: "Specializing in corporate restructuring, mergers, contract law, and commercial litigation with over 14 years of High Court experience.",
    profileImage: undefined,
  },
  {
    id: "lawyer-2-demo",
    name: "Adv. Priya Deshmukh",
    specialization: "Family Law",
    location: "Mumbai, Maharashtra",
    email: "priya.deshmukh@example.com",
    phone: "+91 98200 54321",
    rating: 4.8,
    reviews: 52,
    experience: 11,
    bio: "Dedicated advocate specializing in family mediation, divorce proceedings, child custody, and domestic disputes.",
    profileImage: undefined,
  },
  {
    id: "lawyer-3-demo",
    name: "Adv. Vikram Sethi",
    specialization: "Criminal Law",
    location: "Bengaluru, Karnataka",
    email: "vikram.sethi@example.com",
    phone: "+91 98450 67890",
    rating: 4.9,
    reviews: 64,
    experience: 18,
    bio: "Senior criminal defense counsel handling trials, bail applications, financial frauds, and cyber crime cases across Karnataka.",
    profileImage: undefined,
  },
  {
    id: "lawyer-4-demo",
    name: "Adv. Ananya Roy",
    specialization: "Property Law",
    location: "Kolkata, West Bengal",
    email: "ananya.roy@example.com",
    phone: "+91 98310 98765",
    rating: 4.7,
    reviews: 29,
    experience: 9,
    bio: "Expertise in property verification, real estate disputes, land acquisition, tenant law, and RERA compliance.",
    profileImage: undefined,
  },
  {
    id: "lawyer-5-demo",
    name: "Adv. Amit Verma",
    specialization: "Labour Law",
    location: "Hyderabad, Telangana",
    email: "amit.verma@example.com",
    phone: "+91 98490 11223",
    rating: 4.8,
    reviews: 41,
    experience: 12,
    bio: "Representing employers and employees in workplace harassment, wrongful termination, gratuity, and industrial dispute matters.",
    profileImage: undefined,
  },
  {
    id: "lawyer-6-demo",
    name: "Adv. Meenakshi Sundaram",
    specialization: "Tax Law",
    location: "Chennai, Tamil Nadu",
    email: "meenakshi.s@example.com",
    phone: "+91 98400 33445",
    rating: 4.9,
    reviews: 47,
    experience: 16,
    bio: "Direct & Indirect Tax specialist handling GST litigation, income tax appeals, transfer pricing, and corporate tax structuring.",
    profileImage: undefined,
  },
];

export default function LawyerDirectory() {
  const [lawyers, setLawyers] = useState<Lawyer[]>(DEFAULT_LAWYERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpec, setFilterSpec] = useState("all");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{
    [lawyerId: string]: string;
  }>({});

  useEffect(() => {
    fetchCurrentUser();
    fetchLawyers();
  }, []);

  async function fetchCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setCurrentUserRole(data?.role || user.user_metadata?.role || null);
    }
  }

  async function fetchLawyers() {
    try {
      setLoading(true);
      let combinedRaw: any[] = [];

      // 1. Fetch from public.lawyer_directory
      try {
        const { data: dirLawyers } = await supabase
          .from("lawyer_directory")
          .select("*");
        if (dirLawyers && dirLawyers.length > 0) {
          combinedRaw.push(...dirLawyers);
        }
      } catch (dErr) {
        console.warn("Notice checking lawyer_directory:", dErr);
      }

      // 2. Fetch from public.profiles where role = 'lawyer'
      try {
        const { data: profileLawyers, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "lawyer");
        if (!profError && profileLawyers && profileLawyers.length > 0) {
          profileLawyers.forEach((pl: any) => {
            if (!combinedRaw.some(c => c.id === pl.id || (c.full_name && pl.full_name && c.full_name.toLowerCase() === pl.full_name.toLowerCase()))) {
              combinedRaw.push(pl);
            }
          });
        }
      } catch (pErr) {
        console.warn("Notice checking profiles:", pErr);
      }

      if (combinedRaw.length > 0) {
        // Fetch all reviews in one go
        let reviewMap: Record<string, { total: number; count: number }> = {};
        try {
          const { data: reviews } = await supabase
            .from("lawyer_reviews")
            .select("lawyer_id, rating");
          if (reviews && reviews.length > 0) {
            reviews.forEach((r: any) => {
              if (!reviewMap[r.lawyer_id]) {
                reviewMap[r.lawyer_id] = { total: 0, count: 0 };
              }
              reviewMap[r.lawyer_id].total += r.rating;
              reviewMap[r.lawyer_id].count += 1;
            });
          }
        } catch (rErr) {
          console.warn("Reviews load notice:", rErr);
        }

        const dbLawyers: Lawyer[] = combinedRaw.map((lawyer: any) => {
          const rev = reviewMap[lawyer.id];
          const avgRating = rev && rev.count > 0 ? parseFloat((rev.total / rev.count).toFixed(1)) : 4.9;
          return {
            id: lawyer.id,
            name: lawyer.full_name || lawyer.name || "Advocate",
            specialization: lawyer.specialization || "Corporate & Civil Law",
            location: lawyer.location || "New Delhi / High Court",
            email: lawyer.email || "counsel@nyayapath.in",
            phone: lawyer.phone || "+91 98110 00000",
            rating: avgRating,
            reviews: rev ? rev.count : 12,
            experience: Number(lawyer.experience) || 8,
            bio: lawyer.bio || "Dedicated advocate advising individuals and enterprises on litigation, dispute resolution, and regulatory compliance.",
            profileImage: lawyer.profile_image_url,
          };
        });

        setLawyers(dbLawyers);
      } else {
        setLawyers(DEFAULT_LAWYERS);
      }
    } catch (err) {
      console.error("Error fetching lawyers:", err);
      setLawyers(DEFAULT_LAWYERS);
    } finally {
      setLoading(false);
    }
  }

  async function bookConsultation(lawyerId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login first");
      return;
    }
    const bookingTime = bookingSlot[lawyerId];
    if (!bookingTime) {
      alert("Please pick a slot!");
      return;
    }
    const { error } = await supabase
      .from("bookings")
      .insert([
        { user_id: user.id, lawyer_id: lawyerId, booking_time: bookingTime },
      ]);
    if (error) {
      alert("Booking failed: " + error.message);
    } else {
      alert("Booking requested! Wait for confirmation.");
      setBookingSlot({ ...bookingSlot, [lawyerId]: "" });
    }
  }

  const filteredLawyers = lawyers.filter(
    (lawyer) =>
      (lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lawyer.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterSpec === "all" || lawyer.specialization === filterSpec),
  );

  const specializations = [
    "all",
    "Criminal Law",
    "Family Law",
    "Corporate Law",
    "Property Law",
    "Labour Law",
    "Tax Law",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              👨‍⚖️ Find Trusted Lawyers
            </h1>
            {loading && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-full animate-pulse">
                Syncing database...
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Connect with experienced legal professionals in your area
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search by name, specialization, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpec(spec)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterSpec === spec
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300"
                }`}
              >
                {spec === "all" ? "All" : spec}
              </button>
            ))}
          </div>
        </div>

        {filteredLawyers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No lawyers found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{lawyer.name}</h3>
                  <p className="text-sm opacity-90 mb-3">
                    {lawyer.specialization}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold">
                        {lawyer.rating > 0 ? lawyer.rating : "New"}
                      </span>
                      <span className="text-xs opacity-75">
                        ({lawyer.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{lawyer.phone || "Available on chat"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="truncate text-xs">{lawyer.email}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {lawyer.bio}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      📚 {lawyer.experience}+ years experience
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {currentUserRole === "lawyer" ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium text-sm cursor-not-allowed"
                      >
                        💬 Chat Disabled
                      </button>
                    ) : (
                      <Link
                        to={`/chat/${lawyer.id}`}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm transition-colors text-center block"
                      >
                        💬 Chat
                      </Link>
                    )}
                    <button className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium text-sm transition-colors">
                      ℹ️ Info
                    </button>
                  </div>

                  {/* -------- Booking UI Here -------- */}
                  <div className="flex flex-col gap-2 pt-4">
                    <label className="text-xs text-gray-500 mb-0.5">
                      Pick time:
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingSlot[lawyer.id] || ""}
                      onChange={(e) =>
                        setBookingSlot({
                          ...bookingSlot,
                          [lawyer.id]: e.target.value,
                        })
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                    />
                    <button
                      onClick={() => bookConsultation(lawyer.id)}
                      className="w-full mt-1 px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm transition-colors"
                    >
                      📅 Book Consultation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
