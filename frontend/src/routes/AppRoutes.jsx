import { Routes, Route } from "react-router-dom";

// ==================== PUBLIC PAGES ====================
import Contact from "../pages/public/Contact";
import Home from "../pages/public/Home";
import Careers from "../pages/public/Careers";
import About from "../pages/public/About";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";

// ==================== AUTHENTICATION ====================
import HRLogin from "../pages/auth/HRLogin";
import CandidateLogin from "../pages/auth/CandidateLogin";
import CandidateRegister from "../pages/auth/CandidateRegister";

// ==================== HR PORTAL ====================
import HRDashboard from "../pages/hr/HRDashboard";
import Jobs from "../pages/hr/Jobs";
import Applications from "../pages/hr/Applications";
import Candidates from "../pages/hr/Candidates";
import Aianalysis from "../pages/hr/Aianalysis";
import AIRankings from "../pages/hr/AIRankings";

// ==================== CANDIDATE PORTAL ====================
import CandidateDashboard from "../pages/candidate/CandidateDashboard.jsx";
import BrowseJobs from "../pages/candidate/BrowseJobs.jsx";
import JobDetails from "../pages/candidate/JobDetails.jsx";
import MyApplications from "../pages/candidate/MyApplications.jsx";
import AIAnalysis from "../pages/candidate/AIAnalysis.jsx";
import Profile from "../pages/candidate/Profile.jsx";
import RequestHRAccess from "../pages/auth/RequestHrAccess.jsx";
import ApplyJob from "../pages/candidate/ApplyJob.jsx";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ==================== PUBLIC PAGES ==================== */}

      <Route path="/" element={<Home />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* ==================== AUTHENTICATION ==================== */}

      <Route path="/hr-login" element={<HRLogin />} />
      <Route path="/candidate-login" element={<CandidateLogin />} />
      <Route path="/candidate-register" element={<CandidateRegister />} />

      {/* ==================== HR PORTAL ==================== */}

      <Route path="/hr-dashboard" element={<HRDashboard />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/ai-analysis" element={<Aianalysis />} />
      <Route path="/ai-rankings" element={<AIRankings />} />

      {/* ==================== CANDIDATE PORTAL ==================== */}

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<CandidateDashboard />}
      />

      {/* Candidate Dashboard alternative URL */}
      <Route
        path="/candidate/dashboard"
        element={<CandidateDashboard />}
      />

      {/* Browse Jobs */}
      <Route
        path="/browse-jobs"
        element={<BrowseJobs />}
      />

      {/* Candidate Browse Jobs */}
      <Route
        path="/candidate/browse-jobs"
        element={<BrowseJobs />}
      />

      {/* Old Browse Jobs URL */}
      <Route
        path="/candidate/BrowseJobs"
        element={<BrowseJobs />}
      />

      {/* Job Details */}
      <Route
        path="/candidate/jobs/:jobId"
        element={<JobDetails />}
      />

      {/* My Applications */}
      <Route
        path="/candidate/applications"
        element={<MyApplications />}
      />

      {/* My Applications alternative URL */}
      <Route
        path="/candidate/my-applications"
        element={<MyApplications />}
      />
     {/* ==================== AI RESUME ANALYSIS ==================== */}

      <Route
        path="/candidate/ai-analysis"
        element={<AIAnalysis />}
      />
<Route
  path="/candidate/profile"
  element={<Profile />}
/>
<Route
  path="/request-hr-access"
  element={<RequestHRAccess />}
/>
<Route path="/candidate/apply/:jobId" element={<ApplyJob />} />

    </Routes>
  );
}