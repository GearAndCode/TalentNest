import { Routes, Route } from "react-router-dom";

import Contact from "../pages/public/Contact";
import Home from "../pages/public/Home";
import Careers from "../pages/public/Careers";
import About from "../pages/public/About";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";

import HRLogin from "../pages/auth/HRLogin";
import CandidateLogin from "../pages/auth/CandidateLogin";
import CandidateRegister from "../pages/auth/CandidateRegister";

import HRDashboard from "../pages/hr/HRDashboard";
import Jobs from "../pages/hr/Jobs";
import Applications from "../pages/hr/Applications";
import Candidates from "../pages/hr/Candidates";
import Aianalysis from "../pages/hr/Aianalysis";
import AIRankings from "../pages/hr/AIRankings";

import CandidateDashboard from "../pages/candidate/CandidateDashboard.jsx";
import ApplyJob from "../pages/candidate/ApplyJob.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Authentication */}
      <Route path="/hr-login" element={<HRLogin />} />
      <Route path="/candidate-login" element={<CandidateLogin />} />
      <Route path="/candidate-register" element={<CandidateRegister />} />

      {/* HR Portal */}
      <Route path="/hr-dashboard" element={<HRDashboard />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/ai-analysis" element={<Aianalysis />} />
      <Route path="/ai-rankings" element={<AIRankings />} />

      {/* Candidate Portal */}
      <Route path="/dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate/apply/:jobId" element={<ApplyJob />} />
    </Routes>
  );
}
