import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Scale, Eye, EyeOff, Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const getRedirectURL = () => window.location.origin;

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !role) {
      toast.error("Please fill your name and role");
      return;
    }

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    if (emailError || passwordError) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            organization,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        toast.error(error.message);
      } else {
        if (data?.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              full_name: fullName,
              role: role,
              organization: organization || "",
            });
          } catch (profileErr) {
            console.warn("Profile sync deferred:", profileErr);
          }
        }
        setMessage("✅ Registered successfully. Please check your email.");
        toast.success("Registered successfully!");
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      }
    } catch {
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectURL(),
      },
    });
    if (error) toast.error(error.message || "Google signup failed");
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getRedirectURL(),
      },
    });
    if (error) toast.error(error.message || "GitHub signup failed");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Animated Gradient Left Panel */}
        <motion.div
          className="hidden md:flex flex-col items-center justify-center w-2/3 p-16 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 rounded-tr-3xl rounded-br-3xl relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Floating shapes */}
          <motion.div
            className="absolute top-10 left-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full filter blur-3xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-16 w-64 h-64 bg-blue-300 opacity-30 rounded-full filter blur-2xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Logo with interaction */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="relative z-10 text-center"
          >
            <Scale className="w-20 h-20 text-white drop-shadow-lg mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-2">
              NyayaPath
            </h1>
            <p className="text-xl italic text-white drop-shadow-lg max-w-md mx-auto">
              Justice. Transparency. Trust.
            </p>
          </motion.div>
        </motion.div>

        {/* Glassmorphic Signup Form */}
        <motion.div
          className="flex flex-col items-center justify-center w-full md:w-1/3 p-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-tl-3xl rounded-bl-3xl shadow-xl relative z-10"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          aria-label="Signup form"
        >
          <form
            onSubmit={handleSignup}
            className="space-y-6 w-full max-w-sm text-white"
            noValidate
          >
            <h2 className="text-3xl font-serif font-bold tracking-wide mb-4 text-blue-300 text-center drop-shadow-md">
              Sign Up
            </h2>

            {/* Full name */}
            <div className="relative">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                required
                disabled={loading}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3 rounded-lg bg-gray-800 placeholder-blue-400 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Role select */}
            <div className="relative">
              <select
                value={role}
                required
                disabled={loading}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-3 rounded-lg bg-gray-800 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="" disabled>
                  I am a...
                </option>
                <option value="lawyer">Lawyer</option>
                <option value="client">Client</option>
                <option value="paralegal">Paralegal</option>
              </select>
            </div>

            {/* Organization (optional) */}
            <div className="relative">
              <input
                type="text"
                placeholder="Organization / Firm (optional)"
                value={organization}
                disabled={loading}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-5 py-3 rounded-lg bg-gray-800 placeholder-blue-400 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Work email"
                value={email}
                required
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby="email-error"
                className={`w-full px-5 py-3 rounded-lg bg-gray-800 placeholder-blue-400 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  emailError
                    ? "border border-red-500"
                    : "border border-transparent"
                }`}
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                aria-invalid={passwordError ? "true" : "false"}
                aria-describedby="password-error"
                className={`w-full px-5 py-3 rounded-lg bg-gray-800 placeholder-blue-400 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  passwordError
                    ? "border border-red-500"
                    : "border border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-blue-400 hover:text-blue-500 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-400 font-semibold rounded-lg text-white shadow-lg flex justify-center items-center"
              aria-busy={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Social Login Buttons */}
            <div className="flex gap-4 justify-center mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center bg-white text-gray-900 rounded-lg px-4 py-2 shadow hover:bg-gray-100 transition"
                aria-label="Sign up with Google"
              >
                <FcGoogle className="mr-2 w-5 h-5" /> Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center bg-gray-800 text-white rounded-lg px-4 py-2 shadow hover:bg-gray-700 transition"
                aria-label="Sign up with GitHub"
              >
                <Github className="mr-2 w-5 h-5" /> GitHub
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 text-center font-semibold ${
                  message.includes("successfully")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
                role="alert"
                aria-live="assertive"
              >
                {message}
              </div>
            )}

            <div className="mt-8 text-center text-blue-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline hover:text-blue-500 transition"
              >
                Log In
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
}
