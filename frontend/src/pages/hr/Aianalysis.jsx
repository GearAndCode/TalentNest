import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  BrainCircuit,
  Award,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCircle,
  RefreshCw,
  Eye,
  FileSearch,
  Trophy,
  Sparkles,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Briefcase as BriefcaseIcon,
  PieChart as PieChartIcon,
  ClipboardList,
  CheckCircle2,
  ShieldAlert,
  MessageSquareQuote,
  ExternalLink,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — reused exactly from HRDashboard.jsx / Jobs.jsx so
   this page visually matches the rest of the HR Dashboard.
   Do not modify. Do not create a second logo.
   ============================================================ */
const TalentNestLogo = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 18C4 23.5228 8.47715 28 14 28H18C23.5228 28 28 23.5228 28 18C28 15.5 27.1 13.2 25.5 11.5"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
    />
    <path
      d="M7 16C7 20.4183 10.5817 24 15 24H17C21.4183 24 25 20.4183 25 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.75"
    />
    <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    <path
      d="M9 17.5C9 15.5 10.3 14.5 12 14.5C13.7 14.5 15 15.5 15 17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="10" r="2.5" fill="currentColor" />
    <path
      d="M17 16.5C17 14.5 18.3 13.5 20 13.5C21.7 13.5 23 14.5 23 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ============================================================
   API CLIENT — same base URL + auth convention as HRDashboard.jsx
   (HRlogin.jsx stores the JWT under "access_token" / "hr_email",
   so this page reads those exact keys).
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ============================================================
   SMALL UTILITIES
   ============================================================ */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Maps an axios error to a user-facing message, honoring backend `detail`
// payloads and covering the status codes this page is expected to handle.
function mapErrorMessage(err, fallback) {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;
  const detailMsg =
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
      ? detail.map((d) => d?.msg || JSON.stringify(d)).join(", ")
      : null;

  if (status === 401) return detailMsg || "Your session has expired. Please log in again.";
  if (status === 403) return detailMsg || "You don't have permission to view this data.";
  if (status === 404) return detailMsg || "The requested resource could not be found.";
  if (status === 422) return detailMsg || "That request was invalid. Please check filters and try again.";
  if (status === 500) return detailMsg || "The server encountered an error. Please try again shortly.";
  if (err?.code === "ERR_NETWORK") return "Cannot reach the server. Check your backend connection.";
  return detailMsg || fallback || "Something went wrong. Please try again.";
}

// Splits the comma-separated skill strings stored on Application
// (matched_skills / missing_skills) into clean arrays.
function splitSkills(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// The AI recommendation stored on an application (`ai_recommendation`) is
// free-text advice generated by the LLM — there is no fixed enum for it in
// the backend. This buckets it for badge styling using the same
// substring-matching approach the backend itself uses for
// `recommended_for_interview` in routers/dashboard.py.
function classifyRecommendation(text) {
  const t = (text || "").toLowerCase().trim();
  if (!t) return { label: "Not Analyzed", tone: "neutral" };
  if (/(not suitable|not a good fit|do not proceed|reject|declin|poor match)/.test(t)) {
    return { label: "Not Suitable", tone: "negative" };
  }
  if (/(needs review|further review|caution|concern|borderline)/.test(t)) {
    return { label: "Needs Review", tone: "warning" };
  }
  if (/(recommend|excellent match|strong match|good match|proceed|move forward)/.test(t)) {
    return { label: "Recommended", tone: "positive" };
  }
  return { label: "Reviewed", tone: "neutral" };
}

const TONE_STYLES = {
  positive: { text: "#0F766E", bg: "rgba(15,118,110,0.10)", ring: "rgba(15,118,110,0.25)" },
  warning: { text: "#B45309", bg: "rgba(245,158,11,0.12)", ring: "rgba(245,158,11,0.25)" },
  negative: { text: "#B91C1C", bg: "rgba(239,68,68,0.10)", ring: "rgba(239,68,68,0.25)" },
  neutral: { text: "#475569", bg: "rgba(71,85,105,0.08)", ring: "rgba(71,85,105,0.2)" },
};

function classifyStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("accept") || s.includes("hire") || s.includes("offer")) return "Accepted";
  return "Pending";
}

const STATUS_COLORS = {
  Pending: "#F59E0B",
  Accepted: "#0F766E",
  Rejected: "#EF4444",
};

function scoreColor(score) {
  if (typeof score !== "number") return "#94A3B8";
  if (score >= 80) return "#0F766E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

const MATCH_BUCKETS = [
  { key: "81-100", label: "81–100%", min: 81, max: 100 },
  { key: "61-80", label: "61–80%", min: 61, max: 80 },
  { key: "41-60", label: "41–60%", min: 41, max: 60 },
  { key: "21-40", label: "21–40%", min: 21, max: 40 },
  { key: "0-20", label: "0–20%", min: 0, max: 20 },
];

/* ============================================================
   NAV ITEMS — identical set/order to HRDashboard.jsx & Jobs.jsx
   ============================================================ */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/hr-dashboard" },
  { label: "Jobs", icon: Briefcase, path: "/jobs" },
  { label: "Applications", icon: FileText, path: "/applications" },
  { label: "Candidates", icon: Users, path: "/candidates" },
  { label: "AI Analysis", icon: BrainCircuit, path: "/ai-analysis" },
  { label: "AI Rankings", icon: Award, path: "/ai-rankings" },

];

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function AIAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const hrIdentity = useMemo(() => {
    const token = localStorage.getItem("access_token");
    const payload = token ? decodeJwtPayload(token) : null;
    const email = payload?.email || localStorage.getItem("hr_email") || "";
    const namePart = email.includes("@") ? email.split("@")[0] : email;
    const displayName = namePart
      ? namePart
          .replace(/[._-]+/g, " ")
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "HR User";
    return { email, displayName, companyId: payload?.company_id ?? null };
  }, []);

  const isActivePath = (path) => location.pathname === path;

  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("hr_email");
    navigate("/hr-login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF] flex">
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { borderRadius: "1rem", background: "#0F172A", color: "#fff" } }}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isActivePath={isActivePath}
        handleNav={handleNav}
        onLogout={handleLogout}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isActivePath={isActivePath}
        handleNav={handleNav}
        onLogout={handleLogout}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar
          hrIdentity={hrIdentity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AIAnalysisContent />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (Desktop, collapsible) — copied exactly from HRDashboard.jsx
   ============================================================ */
function Sidebar({ collapsed, setCollapsed, isActivePath, handleNav, onLogout }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-xl border-r border-[#E2E8F0] z-30 shadow-sm"
    >
      <SidebarInner
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isActivePath={isActivePath}
        handleNav={handleNav}
        onLogout={onLogout}
      />
    </motion.aside>
  );
}

function SidebarInner({ collapsed, setCollapsed, isActivePath, handleNav, onLogout, isMobile = false }) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Branding */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
          <button
            onClick={() => handleNav("/hr-dashboard")}
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] shadow-sm">
              <TalentNestLogo className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="text-xl font-bold text-[#0F172A] tracking-tight">TalentNest</span>
            )}
          </button>
          {!isMobile && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 mt-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? "bg-[#0F766E]/10 text-[#0F766E] font-semibold"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={isMobile ? "mobileSidebarActiveIndicator" : "sidebarActiveIndicator"}
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0F766E] rounded-r-full"
                  />
                )}
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform duration-200 ${active ? "text-[#0F766E]" : "group-hover:scale-105"}`}
                />
                {(!collapsed || isMobile) && <span className="text-sm tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#E2E8F0]">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/5 font-medium transition-colors duration-200"
        >
          <LogOut size={20} className="shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm tracking-wide">Logout</span>}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (Mobile drawer) — copied exactly from HRDashboard.jsx
   ============================================================ */
function MobileSidebar({ open, onClose, isActivePath, handleNav, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -288 }}
          animate={{ x: 0 }}
          exit={{ x: -288 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed top-0 left-0 h-screen w-72 bg-[#FFFFFF] border-r border-[#E2E8F0] z-50 lg:hidden shadow-xl flex flex-col"
        >
          <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] shadow-sm">
                <TalentNestLogo className="w-6 h-6 text-[#FFFFFF]" />
              </div>
              <span className="text-xl font-bold text-[#0F172A] tracking-tight">TalentNest</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <SidebarInner
            collapsed={false}
            setCollapsed={() => {}}
            isActivePath={isActivePath}
            handleNav={handleNav}
            onLogout={onLogout}
            isMobile
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   TOP NAVIGATION — copied exactly from HRDashboard.jsx
   ============================================================ */
function TopNavbar({ hrIdentity, searchQuery, setSearchQuery, onMenuClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 backdrop-blur-md border-b ${
        scrolled ? "bg-[#FFFFFF]/85 border-[#E2E8F0] shadow-sm" : "bg-[#FFFFFF]/70 border-[#E2E8F0]/60"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, candidates, applications..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button
              className="relative p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-[#0F172A]">{hrIdentity.displayName}</p>
                <p className="text-xs text-[#475569]">TalentNest</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>

            <button
              onClick={onLogout}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   PAGE CONTENT
   ============================================================ */
function AIAnalysisContent() {
  // ---------------- Raw backend data ----------------
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [matchDistributionRaw, setMatchDistributionRaw] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- Search / filters / sort ----------------
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [matchRangeFilter, setMatchRangeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // ---------------- Drawer / modal state ----------------
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rankingJob, setRankingJob] = useState(null);

  /* ---------------- FETCH ALL AI-RELEVANT DATA ----------------
     Endpoints used (from backend/app/routers):
       GET /applications/                        (AI match + recruiter analysis per application)
       GET /applications/match-distribution       (raw match-score list for analytics)
       GET /candidates/                           (candidate identity, resume_path)
       GET /jobs/                                 (job title/department/experience)
       GET /dashboard/stats                       (aggregate AI stats)
     No endpoint is invented — this mirrors exactly what HRDashboard.jsx
     already fetches from this backend, plus /applications/match-distribution. */
  const fetchAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [appsRes, candidatesRes, jobsRes, statsRes, matchDistRes] = await Promise.allSettled([
        api.get("/applications"),
        api.get("/candidates"),
        api.get("/jobs"),
        api.get("/dashboard/stats"),
        api.get("/applications/match-distribution"),
      ]);

      if (appsRes.status === "fulfilled") {
        setApplications(Array.isArray(appsRes.value.data) ? appsRes.value.data : []);
      } else {
        throw appsRes.reason;
      }

      setCandidates(candidatesRes.status === "fulfilled" && Array.isArray(candidatesRes.value.data) ? candidatesRes.value.data : []);
      setJobs(jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data) ? jobsRes.value.data : []);
      setDashboardStats(statsRes.status === "fulfilled" ? statsRes.value.data : null);
      setMatchDistributionRaw(
        matchDistRes.status === "fulfilled" && Array.isArray(matchDistRes.value.data) ? matchDistRes.value.data : []
      );

      if (candidatesRes.status === "rejected") {
        toast.error(mapErrorMessage(candidatesRes.reason, "Unable to load candidate details."));
      }
      if (jobsRes.status === "rejected") {
        toast.error(mapErrorMessage(jobsRes.reason, "Unable to load job details."));
      }
      if (statsRes.status === "rejected") {
        toast.error(mapErrorMessage(statsRes.reason, "Unable to load AI summary stats."));
      }
      if (matchDistRes.status === "rejected") {
        toast.error(mapErrorMessage(matchDistRes.reason, "Unable to load match distribution."));
      }
    } catch (err) {
      setError(mapErrorMessage(err, "Failed to load AI resume analyses."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = useCallback(() => {
    fetchAll(true);
  }, [fetchAll]);

  // ---------------- Lookups ----------------
  const candidateLookup = useMemo(() => {
    const map = {};
    candidates.forEach((c) => (map[c.id] = c));
    return map;
  }, [candidates]);

  const jobLookup = useMemo(() => {
    const map = {};
    jobs.forEach((j) => (map[j.id] = j));
    return map;
  }, [jobs]);

  // ---------------- Join applications with candidate + job ----------------
  const enrichedApplications = useMemo(() => {
    return applications.map((app) => ({
      ...app,
      candidate: candidateLookup[app.candidate_id] || null,
      job: jobLookup[app.job_id] || null,
      matchedSkillsList: splitSkills(app.matched_skills),
      missingSkillsList: splitSkills(app.missing_skills),
      recommendationInfo: classifyRecommendation(app.ai_recommendation),
    }));
  }, [applications, candidateLookup, jobLookup]);

  // ---------------- Derived filter option lists (from real, loaded data) ----------------
  const statusOptions = useMemo(
    () => [...new Set(applications.map((a) => a.status).filter(Boolean))],
    [applications]
  );
  const departmentOptions = useMemo(
    () => [...new Set(jobs.map((j) => j.department).filter(Boolean))],
    [jobs]
  );
  const jobOptions = useMemo(
    () => jobs.map((j) => ({ value: String(j.id), label: j.title })),
    [jobs]
  );
  const experienceOptions = useMemo(
    () => [...new Set(jobs.map((j) => j.experience).filter(Boolean))],
    [jobs]
  );

  // ---------------- Search + filter + sort ----------------
  const visibleApplications = useMemo(() => {
    let list = [...enrichedApplications];

    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((app) => {
        const name = app.candidate?.full_name?.toLowerCase() || "";
        const email = app.candidate?.email?.toLowerCase() || "";
        const title = app.job?.title?.toLowerCase() || "";
        return name.includes(kw) || email.includes(kw) || title.includes(kw);
      });
    }

    if (statusFilter) list = list.filter((app) => app.status === statusFilter);
    if (departmentFilter) list = list.filter((app) => app.job?.department === departmentFilter);
    if (jobFilter) list = list.filter((app) => String(app.job_id) === jobFilter);
    if (experienceFilter) list = list.filter((app) => app.job?.experience === experienceFilter);

    if (matchRangeFilter) {
      const bucket = MATCH_BUCKETS.find((b) => b.key === matchRangeFilter);
      if (bucket) {
        list = list.filter(
          (app) => typeof app.match_score === "number" && app.match_score >= bucket.min && app.match_score <= bucket.max
        );
      }
    }

    switch (sortBy) {
      case "highest":
        list.sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1));
        break;
      case "lowest":
        list.sort((a, b) => (a.match_score ?? 101) - (b.match_score ?? 101));
        break;
      case "newest":
      default:
        // The applications endpoint does not return a timestamp
        // (ApplicationResponse has no applied_at/created_at field), so a
        // higher primary key is used as a faithful proxy for recency.
        list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
    }

    return list;
  }, [enrichedApplications, keyword, statusFilter, departmentFilter, jobFilter, experienceFilter, matchRangeFilter, sortBy]);

  // ---------------- Score cards (derived purely from real fields) ----------------
  const summary = useMemo(() => {
    const scored = applications.filter((a) => typeof a.match_score === "number");
    const highMatch = scored.filter((a) => a.match_score >= 75).length;
    const needsReview = enrichedApplications.filter((a) => a.recommendationInfo.label === "Needs Review").length;
    const notSuitable = enrichedApplications.filter((a) => a.recommendationInfo.label === "Not Suitable").length;
    return { highMatch, needsReview, notSuitable, scoredCount: scored.length };
  }, [applications, enrichedApplications]);

  // ---------------- Chart data ----------------
  const matchDistributionData = useMemo(() => {
    const source = matchDistributionRaw.length
      ? matchDistributionRaw.map((d) => d.score)
      : applications.map((a) => a.match_score);
    const scores = source.filter((s) => typeof s === "number");
    if (!scores.length) return [];
    return MATCH_BUCKETS.slice()
      .reverse()
      .map((b) => ({
        range: b.label,
        count: scores.filter((s) => s >= b.min && s <= b.max).length,
      }));
  }, [matchDistributionRaw, applications]);

  const skillGapData = useMemo(() => {
    const freq = {};
    enrichedApplications.forEach((app) => {
      app.missingSkillsList.forEach((skill) => {
        freq[skill] = (freq[skill] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));
  }, [enrichedApplications]);

  const recommendationBreakdown = useMemo(() => {
    const counts = { Recommended: 0, "Needs Review": 0, "Not Suitable": 0, Reviewed: 0, "Not Analyzed": 0 };
    enrichedApplications.forEach((app) => {
      const label = app.recommendationInfo.label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((entry) => entry.value > 0);
  }, [enrichedApplications]);

  const experienceDistribution = useMemo(() => {
    const counts = {};
    enrichedApplications.forEach((app) => {
      const level = app.job?.experience;
      if (!level) return;
      counts[level] = (counts[level] || 0) + 1;
    });
    return Object.entries(counts).map(([level, count]) => ({ level, count }));
  }, [enrichedApplications]);

  const REC_COLORS = {
    Recommended: "#0F766E",
    "Needs Review": "#F59E0B",
    "Not Suitable": "#EF4444",
    Reviewed: "#64748B",
    "Not Analyzed": "#94A3B8",
  };

  // ---------------- Resume handling (no static file endpoint exists) ----------------
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const handleViewResume = useCallback((candidate) => {
  if (!candidate?.resume_path) {
    toast.error("No resume uploaded.");
    return;
  }

  let resumeUrl = "";

  if (candidate.resume_path.startsWith("http")) {
    resumeUrl = candidate.resume_path;
  } else {
    resumeUrl = `${API_BASE_URL}/${candidate.resume_path.replace(/^\/+/, "")}`;
  }

  window.open(resumeUrl, "_blank");
}, []);

  const hasActiveFilters =
    keyword || statusFilter || departmentFilter || jobFilter || experienceFilter || matchRangeFilter;

  const clearFilters = () => {
    setKeyword("");
    setStatusFilter("");
    setDepartmentFilter("");
    setJobFilter("");
    setExperienceFilter("");
    setMatchRangeFilter("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-8">
      {/* ---------------- Page Header ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </span>
            AI Resume Analysis
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#475569] max-w-2xl">
            Analyze resumes, identify strengths, weaknesses, missing skills, and AI recommendations for every candidate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm">
            <span className="text-lg font-extrabold text-[#0F172A]">{applications.length}</span>
            <span className="text-[11px] font-medium text-[#475569] uppercase tracking-wider">Analyses</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#FFFFFF] bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:shadow-lg rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] disabled:opacity-60 disabled:cursor-not-allowed w-fit"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Analysis"}
          </button>
        </div>
      </div>

      {/* ---------------- Top-level error (applications failed to load) ---------------- */}
      {error ? (
        <ErrorState message={error} onRetry={() => fetchAll()} />
      ) : (
        <>
          {/* ---------------- Score Cards ---------------- */}
          <ScoreCardsSection loading={loading} dashboardStats={dashboardStats} summary={summary} />

          {/* ---------------- Charts ---------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Match Distribution"
              subtitle="AI match-score spread across analyzed applications"
              loading={loading}
              isEmpty={matchDistributionData.length === 0}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={matchDistributionData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="range" stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }}
                  />
                  <Bar dataKey="count" fill="#0F766E" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Recommendation Breakdown"
              subtitle="How the AI recruiter has assessed each application"
              loading={loading}
              isEmpty={recommendationBreakdown.length === 0}
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={recommendationBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {recommendationBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={REC_COLORS[entry.name] || "#0F766E"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Skill Gap Distribution"
              subtitle="Most frequently missing skills across candidates"
              loading={loading}
              isEmpty={skillGapData.length === 0}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={skillGapData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="skill" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} width={110} />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }}
                  />
                  <Bar dataKey="count" fill="#EF4444" radius={[0, 8, 8, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Experience Level Distribution"
              subtitle="Applications grouped by the applied job's required experience"
              loading={loading}
              isEmpty={experienceDistribution.length === 0}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={experienceDistribution} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="level" stroke="#475569" fontSize={11} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }}
                  />
                  <Bar dataKey="count" fill="#14B8A6" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="lg:col-span-2">
            
            </div>
          </div>

          {/* ---------------- Search + Filters ---------------- */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by candidate name, email, or job title..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
                />
              </div>
              <FilterSelect value={matchRangeFilter} onChange={setMatchRangeFilter} placeholder="All Match %" options={MATCH_BUCKETS.map((b) => ({ value: b.key, label: b.label }))} raw />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" options={statusOptions} />
              <FilterSelect value={departmentFilter} onChange={setDepartmentFilter} placeholder="All Departments" options={departmentOptions} />
            </div>
            <div className="flex flex-col lg:flex-row gap-3">
              <FilterSelect value={jobFilter} onChange={setJobFilter} placeholder="All Jobs" options={jobOptions} raw />
              <FilterSelect value={experienceFilter} onChange={setExperienceFilter} placeholder="All Experience Levels" options={experienceOptions} />
              <div className="relative w-full lg:w-52" title="Not available — the backend does not return candidate education data">
                <select
                  disabled
                  className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#475569]/60 cursor-not-allowed"
                >
                  <option>Education (unavailable)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#475569]/40 pointer-events-none" />
              </div>
              <FilterSelect
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort By"
                raw
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "highest", label: "Highest Match" },
                  { value: "lowest", label: "Lowest Match" },
                ]}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] rounded-xl transition-colors w-fit"
                >
                  <X size={13} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* ---------------- Main Table ---------------- */}
          {loading ? (
            <SkeletonTable />
          ) : applications.length === 0 ? (
            <AnalysisEmptyState />
          ) : visibleApplications.length === 0 ? (
            <NoResultsState onClear={clearFilters} />
          ) : (
            <AnalysisTable
              rows={visibleApplications}
              onViewAnalysis={setSelectedApplication}
              onViewResume={handleViewResume}
              onViewRanking={(app) => setRankingJob({ id: app.job_id, title: app.job?.title || `Job #${app.job_id}` })}
            />
          )}
        </>
      )}

      {/* ---------------- View Analysis Drawer ---------------- */}
      <AnimatePresence>
        {selectedApplication && (
          <AnalysisDrawer
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onViewResume={handleViewResume}
          />
        )}
      </AnimatePresence>

      {/* ---------------- View Ranking Modal ---------------- */}
      <AnimatePresence>
        {rankingJob && <RankingModal job={rankingJob} onClose={() => setRankingJob(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   FILTER SELECT — pattern reused from Jobs.jsx
   ============================================================ */
function FilterSelect({ value, onChange, options, placeholder, raw }) {
  return (
    <div className="relative w-full lg:w-52">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition cursor-pointer"
      >
        {!raw && <option value="">{placeholder}</option>}
        {raw
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#475569] pointer-events-none" />
    </div>
  );
}

/* ============================================================
   SCORE CARDS
   ============================================================ */
function ScoreCardsSection({ loading, dashboardStats, summary }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Average Match Score",
      value: dashboardStats?.average_match_score ?? 0,
      suffix: "%",
      icon: BrainCircuit,
    },
    {
      label: "High Match Candidates",
      value: summary.highMatch,
      hint: "Match score ≥ 75%",
      icon: Trophy,
    },
    {
      label: "Candidates Requiring Review",
      value: summary.needsReview,
      hint: "Flagged by AI recommendation",
      icon: ShieldAlert,
    },
    {
      label: "Rejected by AI",
      value: summary.notSuitable,
      hint: "Marked not suitable",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          whileHover={{ y: -3 }}
          className="group bg-[#FFFFFF] p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 transition-all duration-300"
        >
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300 w-fit">
            <card.icon className="w-5 h-5" />
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {typeof card.value === "number" ? card.value : 0}
            {card.suffix || ""}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#475569]">{card.label}</p>
          {card.hint && <p className="mt-1 text-[11px] text-[#475569]/70">{card.hint}</p>}
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================
   CHART CARD WRAPPER
   ============================================================ */
function ChartCard({ title, subtitle, loading, isEmpty, emptyMessage = "No data available yet", children }) {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
        <p className="text-xs text-[#475569] mt-0.5">{subtitle}</p>
      </div>
      {loading ? (
        <div className="h-[260px] rounded-xl bg-[#F8FAFC] animate-pulse" />
      ) : isEmpty ? (
        <ChartEmptyState message={emptyMessage} />
      ) : (
        children
      )}
    </div>
  );
}

function ChartEmptyState({ message }) {
  return (
    <div className="h-[260px] flex flex-col items-center justify-center text-center gap-3 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] px-6">
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <PieChartIcon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-[#475569]">{message}</p>
    </div>
  );
}

/* ============================================================
   MATCH SCORE RING (circular progress, no external chart lib needed)
   ============================================================ */
function MatchScoreRing({ score, size = 44, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (pct / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
        {typeof score === "number" && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-[#0F172A]" style={{ fontSize: size * 0.26 }}>
          {typeof score === "number" ? `${score}%` : "—"}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   RECOMMENDATION BADGE
   ============================================================ */
function RecommendationBadge({ info }) {
  const style = TONE_STYLES[info.tone] || TONE_STYLES.neutral;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {info.label}
    </span>
  );
}

/* ============================================================
   MAIN TABLE
   ============================================================ */
function AnalysisTable({ rows, onViewAnalysis, onViewResume, onViewRanking }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              <th className="py-4 px-6">Candidate</th>
              <th className="py-4 px-6">Applied Job</th>
              <th className="py-4 px-6">Overall Match</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Resume</th>
              <th className="py-4 px-6">Analysis Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-sm">
            {rows.map((app, idx) => {
              const category = classifyStatus(app.status);
              const analysisDate = app.applied_at || app.created_at || null;
              return (
                <tr key={app.id} className={`hover:bg-[#F8FAFC]/70 transition-colors ${idx % 2 === 1 ? "bg-[#F8FAFC]/30" : ""}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold shrink-0 text-xs">
                        {(app.candidate?.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {app.candidate?.full_name || `Candidate #${app.candidate_id}`}
                        </p>
                        <p className="text-xs text-[#475569] truncate">{app.candidate?.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#475569]">{app.job?.title || `Job #${app.job_id}`}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <MatchScoreRing score={typeof app.match_score === "number" ? app.match_score : null} size={38} strokeWidth={4} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${STATUS_COLORS[category]}1A`, color: STATUS_COLORS[category] }}
                    >
                      {app.status || "Unknown"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {app.candidate?.resume_path ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E]">
                        <CheckCircle2 size={13} /> Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569]/70">
                        <XCircle size={13} /> Not Uploaded
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-[#475569]">
                    {analysisDate ? new Date(analysisDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewAnalysis(app)}
                        title="View Analysis"
                        aria-label="View Analysis"
                        className="p-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] bg-[#FFFFFF] hover:text-[#0F766E] hover:bg-[#0F766E]/5 hover:border-[#0F766E]/30 active:scale-95 shadow-sm transition-all duration-150"
                      >
                        <Eye size={16} strokeWidth={2.25} />
                      </button>
                      <button
                        onClick={() => onViewResume(app.candidate)}
                        title="View Resume"
                        aria-label="View Resume"
                        className="p-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] bg-[#FFFFFF] hover:text-[#0F766E] hover:bg-[#0F766E]/5 hover:border-[#0F766E]/30 active:scale-95 shadow-sm transition-all duration-150"
                      >
                        <FileSearch size={16} strokeWidth={2.25} />
                      </button>
                      <button
                        onClick={() => onViewRanking(app)}
                        title="View Ranking"
                        aria-label="View Ranking"
                        className="p-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] bg-[#FFFFFF] hover:text-[#0F766E] hover:bg-[#0F766E]/5 hover:border-[#0F766E]/30 active:scale-95 shadow-sm transition-all duration-150"
                      >
                        <Trophy size={16} strokeWidth={2.25} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW ANALYSIS DRAWER
   ============================================================ */
function AnalysisDrawer({ application, onClose, onViewResume }) {
  const app = application;
  const candidate = app.candidate;
  const job = app.job;

  // These fields are not part of ApplicationResponse today (the backend's
  // ollama_service can generate them, but routers/application.py never
  // persists or returns strengths/weaknesses/education_analysis/
  // experience_analysis/explanation on the Application record). They are
  // rendered only if the backend response ever actually includes them —
  // nothing here is fabricated.
  const strengths = Array.isArray(app.strengths) ? app.strengths : [];
  const weaknesses = Array.isArray(app.weaknesses) ? app.weaknesses : [];
  const educationAnalysis = app.education_analysis && typeof app.education_analysis === "object" ? app.education_analysis : null;
  const experienceAnalysis = app.experience_analysis && typeof app.experience_analysis === "object" ? app.experience_analysis : null;
  const explanation = typeof app.explanation === "string" ? app.explanation : "";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0F172A]/30 backdrop-blur-sm flex justify-end">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-xl bg-[#FFFFFF] h-full shadow-2xl overflow-y-auto border-l border-[#E2E8F0]"
      >
        <div className="flex justify-between items-center border-b border-[#E2E8F0] px-6 py-4 sticky top-0 bg-[#FFFFFF] z-10">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#0F766E]" /> AI Analysis
          </span>
          <button onClick={onClose} className="text-[#475569] hover:text-[#0F172A]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-7">
          {/* Candidate Information */}
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">{candidate?.full_name || `Candidate #${app.candidate_id}`}</h2>
            <p className="text-sm text-[#475569] mt-1">{candidate?.email || "—"}</p>
            <p className="text-sm text-[#475569]">Applied for: <span className="font-semibold text-[#0F172A]">{job?.title || `Job #${app.job_id}`}</span></p>
          </div>

          {/* Match Score */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <MatchScoreRing score={typeof app.match_score === "number" ? app.match_score : null} size={80} strokeWidth={7} />
            <div>
              <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Overall Match Score</p>
              <div className="mt-1.5">
                <RecommendationBadge info={app.recommendationInfo} />
              </div>
            </div>
          </div>

          {/* Resume Summary */}
          <DrawerSection icon={ClipboardList} title="Resume Summary">
            <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap bg-[#F8FAFC] p-4 rounded-2xl">
              {app.ai_summary || "No AI summary has been generated for this application yet."}
            </p>
          </DrawerSection>

          {/* Skills Found */}
          <DrawerSection icon={CheckCircle2} title="Skills Found">
            {app.matchedSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {app.matchedSkillsList.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#475569]/70">No matched skills returned.</p>
            )}
          </DrawerSection>

          {/* Missing Skills */}
          <DrawerSection icon={AlertTriangle} title="Missing Skills">
            {app.missingSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {app.missingSkillsList.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-[#EF4444]/10 text-[#B91C1C] text-xs font-bold border border-[#EF4444]/20">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#475569]/70">No missing skills returned.</p>
            )}
          </DrawerSection>

          {/* Strengths — only rendered if the backend ever returns this field */}
          {strengths.length > 0 && (
            <DrawerSection icon={CheckCircle2} title="Strengths" tone="positive">
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[#0F766E] bg-[#0F766E]/5 px-3 py-2 rounded-xl">
                    {s}
                  </li>
                ))}
              </ul>
            </DrawerSection>
          )}

          {/* Weaknesses — only rendered if the backend ever returns this field */}
          {weaknesses.length > 0 && (
            <DrawerSection icon={AlertTriangle} title="Weaknesses" tone="negative">
              <ul className="space-y-1.5">
                {weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-[#B45309] bg-[#F59E0B]/10 px-3 py-2 rounded-xl">
                    {w}
                  </li>
                ))}
              </ul>
            </DrawerSection>
          )}

          {/* Education Analysis — only rendered if the backend ever returns this field */}
          {educationAnalysis && (
            <DrawerSection icon={GraduationCap} title="Education Analysis">
              <div className="text-sm text-[#475569] bg-[#F8FAFC] p-4 rounded-2xl space-y-1">
                {Object.entries(educationAnalysis).map(([k, v]) => (
                  <p key={k}>
                    <span className="font-semibold text-[#0F172A]">{k.replace(/_/g, " ")}:</span>{" "}
                    {Array.isArray(v) ? v.join(", ") : String(v)}
                  </p>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Experience Analysis — only rendered if the backend ever returns this field */}
          {experienceAnalysis && (
            <DrawerSection icon={BriefcaseIcon} title="Experience Analysis">
              <div className="text-sm text-[#475569] bg-[#F8FAFC] p-4 rounded-2xl space-y-1">
                {Object.entries(experienceAnalysis).map(([k, v]) => (
                  <p key={k}>
                    <span className="font-semibold text-[#0F172A]">{k.replace(/_/g, " ")}:</span>{" "}
                    {Array.isArray(v) ? v.join(", ") : String(v)}
                  </p>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Recommendation */}
          <DrawerSection icon={Award} title="Recommendation">
            <p className="text-sm text-[#0F172A] font-medium bg-[#F8FAFC] p-4 rounded-2xl whitespace-pre-wrap">
              {app.ai_recommendation || "No AI recommendation has been generated for this application yet."}
            </p>
          </DrawerSection>

          {/* Interview Questions */}
          {Array.isArray(app.interview_questions) && app.interview_questions.length > 0 && (
            <DrawerSection icon={MessageSquareQuote} title="Suggested Interview Questions">
              <ol className="space-y-1.5 list-decimal list-inside text-sm text-[#475569]">
                {app.interview_questions.map((q, i) => (
                  <li key={i} className="bg-[#F8FAFC] px-3 py-2 rounded-xl">
                    {q}
                  </li>
                ))}
              </ol>
            </DrawerSection>
          )}

          {/* Explanation — only rendered if the backend ever returns this field */}
          {explanation && (
            <DrawerSection icon={Sparkles} title="Explanation">
              <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap bg-[#F8FAFC] p-4 rounded-2xl">
                {explanation}
              </p>
            </DrawerSection>
          )}

          {/* Resume */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => onViewResume(candidate)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F766E] bg-[#0F766E]/5 hover:bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-xl transition-colors"
            >
              <ExternalLink size={15} />
              View Resume
            </button>
            {candidate?.resume_path && (
              <p className="text-[11px] text-[#475569]/70 mt-2 break-all">File on record: {candidate.resume_path}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DrawerSection({ icon: Icon, title, tone, children }) {
  const toneColor = tone === "positive" ? "#0F766E" : tone === "negative" ? "#EF4444" : "#0F766E";
  return (
    <div>
      <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: tone ? toneColor : undefined }}>
        <Icon size={13} /> {title}
      </h4>
      {children}
    </div>
  );
}

/* ============================================================
   VIEW RANKING MODAL
   GET /applications/jobs/{job_id}/ranked-candidates
   ============================================================ */
function RankingModal({ job, onClose }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/applications/jobs/${job.id}/ranked-candidates`);
      setRanking(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(mapErrorMessage(err, "Failed to load candidate ranking for this job."));
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-[#E2E8F0] px-6 py-4 sticky top-0 bg-[#FFFFFF] rounded-t-3xl z-10">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Trophy size={18} className="text-[#0F766E]" /> AI Ranking
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-[#0F172A] p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F8FAFC] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchRanking} compact />
          ) : ranking.length === 0 ? (
            <div className="text-center py-10">
              <Trophy className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#475569]">No ranked candidates for this job yet.</p>
            </div>
          ) : (
            <ol className="space-y-2.5">
              {ranking.map((r, i) => (
                <li
                  key={r.candidate_id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{r.candidate_name}</p>
                      <p className="text-xs text-[#475569] truncate">{r.recommendation}</p>
                    </div>
                  </div>
                  <MatchScoreRing score={r.match_score} size={38} strokeWidth={4} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SHARED STATES
   ============================================================ */
function SkeletonTable() {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] p-6 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-[#F8FAFC] animate-pulse" />
      ))}
    </div>
  );
}

function AnalysisEmptyState() {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] p-12 text-center max-w-md mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mx-auto">
        <BrainCircuit size={26} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#0F172A]">No Resume Analyses Available</h3>
        <p className="text-sm text-[#475569] mt-1">AI analyses will appear here once resumes are processed.</p>
      </div>
    </div>
  );
}

function NoResultsState({ onClear }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] p-12 text-center max-w-md mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] flex items-center justify-center mx-auto">
        <Search size={24} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#0F172A]">No matching analyses</h3>
        <p className="text-sm text-[#475569] mt-1">Try adjusting your search or filters.</p>
      </div>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm transition"
      >
        Clear Filters
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 rounded-2xl bg-[#EF4444]/5 border border-[#EF4444]/20 ${
        compact ? "py-8" : "py-14"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#B91C1C]">Couldn't Load AI Analysis</h3>
        <p className="text-xs text-[#B91C1C]/80 mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#EF4444] hover:bg-[#DC2626] rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
