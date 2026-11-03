import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AskQuestion from "./pages/AskQuestion";
import Navbar from "./components/ui/Navbar";
import MyQuestions from "./pages/MyQuestion";
import LawyerDashboard from "./pages/LawyerDashboard";
import AIAssistant from "./pages/AIAssistant";
import CourtNewsPage from "./pages/CourtNewsPage";
import CaseSearchPage from "./pages/CaseSearchPage";
import SavedNews from "./pages/SavedNews";
import LawyerDirectory from "./pages/LawyerDirectory";
import ChatWithLawyer from "./pages/ChatWithLawyer";
import LawyerChatInbox from "./pages/LawyerChatInbox";
import MyChats from "./pages/MyChats";
import EditProfile from "./pages/EditProfile"; // 👈 ADD THIS
import LegalNoticeGenerator from "./pages/LegalNoticeGenerator";
import CaseStrategyPlanner from "./pages/CaseStrategyPlanner";
import CostEstimator from "./pages/CostEstimator";
import LawyerRecommendation from "./pages/LawyerRecommendation";
import CitizenRights from "./pages/CitizenRights";
import BailChecker from "./pages/BailChecker";
import NyayaVoice from "./pages/NyayaVoice";
import NoticeDemystifier from "./pages/NoticeDemystifier";

import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-questions" element={<MyQuestions />} />
            <Route path="/ask-question" element={<AskQuestion />} />
            <Route path="/lawyer" element={<LawyerDashboard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/court-news" element={<CourtNewsPage />} />
            <Route path="/case-search" element={<CaseSearchPage />} />
            <Route path="/saved-news" element={<SavedNews />} />
            <Route path="/lawyers" element={<LawyerDirectory />} />
            <Route path="/chat/:lawyerId" element={<ChatWithLawyer />} />
            <Route path="/lawyer-chats" element={<LawyerChatInbox />} />
            <Route path="/my-chats" element={<MyChats />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/legal-notice" element={<LegalNoticeGenerator />} />
            <Route path="/case-strategy" element={<CaseStrategyPlanner />} />
            <Route path="/cost-estimator" element={<CostEstimator />} />
            <Route path="/lawyer-ai-match" element={<LawyerRecommendation />} />
            <Route path="/citizen-rights" element={<CitizenRights />} />
            <Route path="/bail-checker" element={<BailChecker />} />
            <Route path="/voice-advocate" element={<NyayaVoice />} />
            <Route path="/notice-demystifier" element={<NoticeDemystifier />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

createRoot(document.getElementById("root")!).render(<App />);
