import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLawyer, setIsLawyer] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    specialization: "",
    experience: 0,
    education: "",
    bar_registration: "",
  });

  useEffect(() => {
  if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      async function loadProfile() {
        try {
          setLoading(true);
          // Pre-fill from user metadata immediately
          setProfile((prev) => ({
            ...prev,
            full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
            email: user?.email || "",
          }));

            let { data, error } = await supabase
              .from("profiles")
              .select(
                "full_name, role, bio, location, phone, specialization, experience, education, bar_registration",
              )
          .eq("id", user?.id)
            .maybeSingle();

            if (data) {
              setProfile({
                full_name: data.full_name || user?.user_metadata?.full_name || "",
                email: user?.email || "",
                bio: data.bio || "",
                location: data.location || "",
                phone: data.phone || "",
                specialization: data.specialization || "",
                experience: Number(data.experience) || 0,
                education: data.education || "",
                bar_registration: data.bar_registration || "",
              });
              setIsLawyer(data.role === "lawyer" || user?.user_metadata?.role === "lawyer");
            } else {
              setIsLawyer(user?.user_metadata?.role === "lawyer");
            }
          } catch (err: any) {
            console.warn("Notice loading profile:", err);
          } finally {
            setLoading(false);
          }
        }

        loadProfile();
      }, [user, authLoading]);

  async function handleSave() {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      const updateData: any = {
        full_name: profile.full_name,
        bio: profile.bio || null,
        location: profile.location || null,
        phone: profile.phone || null,
      };

      if (isLawyer) {
        updateData.specialization = profile.specialization || null;
        updateData.experience = profile.experience;
        updateData.education = profile.education || null;
        updateData.bar_registration = profile.bar_registration || null;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...updateData });

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
        return;
      }

      await refreshProfile();
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate(-1), 500);
    } catch (err: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Please log in or create an account to view and customize your
            advocate or client profile.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="bg-primary text-white w-full">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Log In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            ✏️ Edit Profile
          </h1>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="inline h-4 w-4 mr-2" />
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="City, State"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Lawyer-specific fields */}
            {isLawyer && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Professional Details
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Specialization
                  </label>
                  <select
                    value={profile.specialization}
                    onChange={(e) =>
                      setProfile({ ...profile, specialization: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Specialization</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Property Law">Property Law</option>
                    <option value="Labour Law">Labour Law</option>
                    <option value="Tax Law">Tax Law</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <GraduationCap className="inline h-4 w-4 mr-2" />
                    Education
                  </label>
                  <textarea
                    value={profile.education}
                    onChange={(e) =>
                      setProfile({ ...profile, education: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    placeholder="e.g., LLB from XYZ University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bar Registration Number
                  </label>
                  <input
                    type="text"
                    value={profile.bar_registration}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        bar_registration: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="BAR-123456"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
