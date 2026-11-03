import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Scale,
  ChevronDown,
  Wrench,
} from "lucide-react";

export default function Navbar() {
  const { user, role: userRole, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const primaryLinks = [
    { path: "/", label: "Home" },
    { path: "/lawyers", label: "Find Lawyers" },
    { path: "/case-search", label: "Case Law Search" },
    { path: "/court-news", label: "Court News" },
    { path: "/ai-assistant", label: "AI Assistant" },
  ];

  const toolLinks = [
    {
      path: "/voice-advocate",
      label: "🎙️ NyayaVoice (AI Advocate)",
      desc: "Speak & listen in Hindi or English",
    },
    {
      path: "/notice-demystifier",
      label: "📄 Notice & Summons Demystifier",
      desc: "Decode scary legal notices & draft replies",
    },
    {
      path: "/citizen-rights",
      label: "Police & Citizen Rights",
      desc: "Know what police can & cannot do",
    },
    {
      path: "/bail-checker",
      label: "Bail & Offence Checker",
      desc: "Check bailable status & IPC ↔ BNS",
    },
    {
      path: "/legal-notice",
      label: "Legal Notice Generator",
      desc: "Draft professional legal notices",
    },
    {
      path: "/case-strategy",
      label: "Case Strategy Planner",
      desc: "Roadmap, forms & legal sections",
    },
    {
      path: "/cost-estimator",
      label: "Court Cost Estimator",
      desc: "Estimated court and lawyer fees",
    },
    {
      path: "/lawyer-ai-match",
      label: "AI Lawyer Recommendation",
      desc: "Smart advocate matching",
    },
  ];

  const userLinks = [
    { path: "/my-questions", label: "My Questions" },
    { path: "/ask-question", label: "Ask Question" },
    { path: "/my-chats", label: "My Chats" },
    { path: "/saved-news", label: "Saved News" },
    { path: "/edit-profile", label: "Profile" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Primary Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                NyayaPath
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {primaryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActivePath(link.path)
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Legal AI Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  onBlur={() =>
                    setTimeout(() => setToolsDropdownOpen(false), 200)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${toolLinks.some((t) => isActivePath(t.path))
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>AI Tools</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${toolsDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50">
                    {toolLinks.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setToolsDropdownOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActivePath(tool.path)
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white text-xs">
                          {tool.label}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {tool.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct access to My Questions & My Chats */}
              <Link
                to="/my-questions"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActivePath("/my-questions")
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                My Questions
              </Link>

              <Link
                to="/my-chats"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActivePath("/my-chats")
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                My Chats
              </Link>
            </div>
          </div>

          {/* User Auth & Profile Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {userRole === "lawyer" && (
              <Link
                to="/lawyer"
                className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                Lawyer Dashboard
              </Link>
            )}

            {!user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/edit-profile"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="View / Edit Profile"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  {userRole && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {userRole}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Navigation
              </div>
              {primaryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActivePath(link.path)
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                AI Legal Tools
              </div>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActivePath(tool.path)
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tool.label}
                </Link>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                My Account
              </div>
              {userLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActivePath(link.path)
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {userRole === "lawyer" && (
                <Link
                  to="/lawyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50"
                >
                  Lawyer Dashboard
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              {!user ? (
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-sm font-semibold border rounded-lg hover:bg-gray-50"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
