import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BrainCircuit,
  Compass,
  UserCircle2,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
  Undo2,
  Route as RouteIcon,
  CheckCircle2,
  Circle,
  Clock,
  FileWarning,
  UserSearch,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — identical to Home.jsx / HRDashboard.jsx.
   ============================================================ */
const TalentNestLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    <path d="M9 17.5C9 15.5 10.3 14.5 12 14.5C13.7 14.5 15 15.5 15 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="10" r="2.5" fill="currentColor" />
    <path d="M17 16.5C17 14.5 18.3 13.5 20 13.5C21.7 13.5 23 14.5 23 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ============================================================
   API CLIENT
   Candidate requests carry the authenticated candidate JWT.
   The backend derives candidate identity from that token.
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("candidate_token") ||
    sessionStorage.getItem("candidate_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function splitSkills(value) {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function classifyStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("offer")) return "Offer";
  if (s.includes("hire") || s.includes("accept")) return "Accepted";
  if (s.includes("interview")) return "Interview";
  return "Pending";
}

const STATUS_TONE = {
  Rejected: { color: "#EF4444", bg: "#EF444414" },
  Offer: { color: "#065F46", bg: "#065F4614" },
  Accepted: { color: "#0F766E", bg: "#0F766E14" },
  Interview: { color: "#2563EB", bg: "#2563EB14" },
  Pending: { color: "#F59E0B", bg: "#F59E0B14" },
};

// The backend stores a single free-text status string, not discrete pipeline stages
// with timestamps. This maps that string onto the 5-stage timeline the product asked
// for, as a best-effort visualization — not literal stage-by-stage backend data.
const TIMELINE_STAGES = ["Applied", "AI Screening", "HR Review", "Interview", "Decision"];
function timelineStageIndex(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("reject") || s.includes("offer") || s.includes("hire") || s.includes("accept")) return 4;
  if (s.includes("interview")) return 3;
  if (s.includes("review") || s.includes("shortlist")) return 2;
  if (s === "applied" || s.includes("screen")) return 1;
  return 0;
}
const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Browse Jobs",
    icon: Compass,
    path: "/browse-jobs",
  },
  {
    label: "My Applications",
    icon: FileText,
    path: "/candidate/applications",
  },
  
  {
    label: "AI Resume Analysis",
    icon: BrainCircuit,
    path: "/candidate/ai-analysis",
  },
 
  {
    label: "Profile",
    icon: UserCircle2,
    path: "/candidate/profile",
  },
  
];

/* ============================================================
   ANIMATED COUNTER
   ============================================================ */
function AnimatedCounter({ value, duration = 900, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const numericValue = Number.isFinite(value) ? value : 0;

  useEffect(() => {
    let start = null;
    let frame;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numericValue));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function CandidateDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [candidateError, setCandidateError] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [trackApp, setTrackApp] = useState(null);
  const [viewApp, setViewApp] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [toast, setToast] = useState(null);

  const isActivePath = (path) => location.pathname === path;
  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );

  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ---------------- Load the authenticated candidate ---------------- */
  const fetchCandidate = useCallback(async () => {
    setCandidateLoading(true);
    setCandidateError(null);

    try {
      const res = await api.get("/candidates/me");
      setCandidate(res.data || null);
    } catch (err) {
      setCandidate(null);
      setCandidateError(
        err?.response?.status === 401
          ? "Your session has expired. Please log in again."
          : "Unable to load your profile."
      );
    } finally {
      setCandidateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  /* ---------------- Load jobs + applications once a candidate is selected ---------------- */
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [jobsRes, applicationsRes] = await Promise.all([api.get("/jobs"), api.get("/applications")]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setApplications(Array.isArray(applicationsRes.data) ? applicationsRes.data : []);
    } catch (err) {
      setDataError("Unable to load your applications right now.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (candidate) fetchData();
  }, [candidate, fetchData]);

  const jobLookup = useMemo(() => {
    const map = {};
    jobs.forEach((j) => (map[j.id] = j));
    return map;
  }, [jobs]);

  const myApplications = useMemo(() => {
    if (!candidate) return [];
    return applications.filter((a) => a.candidate_id === candidate.id);
  }, [applications, candidate]);

  const recentApplications = useMemo(() => [...myApplications].reverse().slice(0, 6), [myApplications]);

  const stats = useMemo(() => {
    const submitted = myApplications.length;
    const interviews = myApplications.filter((a) => classifyStatus(a.status) === "Interview").length;
    const offers = myApplications.filter((a) => ["Offer", "Accepted"].includes(classifyStatus(a.status))).length;
    const rejected = myApplications.filter((a) => classifyStatus(a.status) === "Rejected").length;
    const scored = myApplications.filter((a) => typeof a.match_score === "number");
    const avgMatch = scored.length ? Math.round(scored.reduce((sum, a) => sum + a.match_score, 0) / scored.length) : 0;
    return { submitted, interviews, offers, rejected, avgMatch };
  }, [myApplications]);

  const resumeUrl = candidate?.resume_path ? `${API_BASE_URL}/${candidate.resume_path}`.replace(/([^:])\/\/+/g, "$1/") : null;

  const handleLogout = () => {
    localStorage.removeItem("candidate_token");
    sessionStorage.removeItem("candidate_token");
    localStorage.removeItem("candidate");
    sessionStorage.removeItem("candidate");
    localStorage.removeItem("candidate_session_email");
    navigate("/candidate-login", { replace: true });
  };

  const handleWithdraw = async (app) => {
    if (!window.confirm("Withdraw this application? This cannot be undone.")) return;
    setWithdrawingId(app.id);
    try {
      await api.delete(`/applications/${app.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      showToast("Application withdrawn.");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Could not withdraw this application.", "error");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF] flex">
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

      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} isActivePath={isActivePath} handleNav={handleNav} onLogout={handleLogout} />
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} isActivePath={isActivePath} handleNav={handleNav} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar
          candidate={candidate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {candidateLoading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-[#0F766E] animate-spin" />
              </div>
            ) : candidateError ? (
              <ErrorState message={candidateError} onRetry={fetchCandidate} />
            ) : candidate ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Welcome back, {candidate.full_name.split(" ")[0]}</h1>
                    <p className="mt-1 text-sm sm:text-base text-[#475569]">Here's where your job search stands right now.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchData}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] w-fit"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {dataError ? (
                  <ErrorState message={dataError} onRetry={fetchData} />
                ) : (
                  <>
                    {/* Stat Cards */}
                    <StatCardsSection loading={dataLoading} candidate={candidate} stats={stats} resumeUrl={resumeUrl} />

                    {/* Recent Applications */}
                    <RecentApplicationsSection
                      loading={dataLoading}
                      rows={recentApplications}
                      total={myApplications.length}
                      jobLookup={jobLookup}
                      resumeUrl={resumeUrl}
                      withdrawingId={withdrawingId}
                      onView={setViewApp}
                      onTrack={setTrackApp}
                      onWithdraw={handleWithdraw}
                      onBrowseJobs={() =>
                        handleNav("/candidate/browse-jobs")
                      }
                    />
                  </>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>

      <ApplicationViewModal app={viewApp} job={viewApp ? jobLookup[viewApp.job_id] : null} onClose={() => setViewApp(null)} />
      <ApplicationTrackModal app={trackApp} job={trackApp ? jobLookup[trackApp.job_id] : null} onClose={() => setTrackApp(null)} />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[60] px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium text-[#FFFFFF] ${
              toast.tone === "error" ? "bg-[#EF4444]" : "bg-[#0F766E]"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   STAT CARDS
   ============================================================ */
function StatCardsSection({ loading, candidate, stats, resumeUrl }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Resume Status",
      icon: FileText,
      customValue: resumeUrl ? "Uploaded" : "Missing",
      customColor: resumeUrl ? "#0F766E" : "#F59E0B",
    },
    { label: "Applications Submitted", value: stats.submitted, icon: Briefcase },
    { label: "Interviews Scheduled", value: stats.interviews, icon: Clock },
    { label: "Offers Received", value: stats.offers, icon: CheckCircle2 },
    { label: "Rejected Applications", value: stats.rejected, icon: FileWarning },
    { label: "Avg. Resume Match Score", value: stats.avgMatch, icon: BrainCircuit, suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
          {card.customValue ? (
            <p className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: card.customColor }}>
              {card.customValue}
            </p>
          ) : (
            <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              <AnimatedCounter value={typeof card.value === "number" ? card.value : 0} suffix={card.suffix || ""} />
            </p>
          )}
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#475569]">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================
   RECENT APPLICATIONS
   ============================================================ */
function RecentApplicationsSection({ loading, rows, total, jobLookup, resumeUrl, withdrawingId, onView, onTrack, onWithdraw, onBrowseJobs }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Recent Applications</h3>
          <p className="text-xs text-[#475569] mt-0.5">{total} total application{total === 1 ? "" : "s"} submitted</p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#F8FAFC] animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
            <Briefcase className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-[#475569]">You haven't applied to any jobs yet.</p>
          <button
            onClick={onBrowseJobs}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="px-6 py-3">Job Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Match Score</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => {
                const job = jobLookup[app.job_id];
                const tone = STATUS_TONE[classifyStatus(app.status)];
                return (
                  <tr key={app.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A] whitespace-nowrap">{job?.title || `Job #${app.job_id}`}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: tone.bg, color: tone.color }}>
                        {app.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{typeof app.match_score === "number" ? `${app.match_score}%` : "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconAction label="View" onClick={() => onView(app)}>
                          <Eye className="w-4 h-4" />
                        </IconAction>
                        <IconAction label="Track" onClick={() => onTrack(app)}>
                          <RouteIcon className="w-4 h-4" />
                        </IconAction>
                        {resumeUrl && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download Resume"
                            aria-label="Download Resume"
                            className="p-2 rounded-lg border bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:text-[#0F766E] hover:border-[#0F766E] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <IconAction label="Withdraw" onClick={() => onWithdraw(app)} destructive disabled={withdrawingId === app.id}>
                          <Undo2 className="w-4 h-4" />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function IconAction({ label, onClick, children, destructive = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`p-2 rounded-lg border transition-colors disabled:opacity-50 ${
        destructive ? "bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:text-[#EF4444] hover:border-[#EF4444]" : "bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:text-[#0F766E] hover:border-[#0F766E]"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function Sidebar({ collapsed, setCollapsed, isActivePath, handleNav, onLogout }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-xl border-r border-[#E2E8F0] z-30 shadow-sm"
    >
      <SidebarInner collapsed={collapsed} setCollapsed={setCollapsed} isActivePath={isActivePath} handleNav={handleNav} onLogout={onLogout} />
    </motion.aside>
  );
}

function SidebarInner({ collapsed, setCollapsed, isActivePath, handleNav, onLogout, isMobile = false }) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
          <button onClick={() => handleNav("/candidate/dashboard")} className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] shadow-sm">
              <TalentNestLogo className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            {(!collapsed || isMobile) && <span className="text-xl font-bold text-[#0F172A] tracking-tight">TalentNest</span>}
          </button>
          {!isMobile && (
            <button onClick={() => setCollapsed((c) => !c)} className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors" aria-label="Toggle sidebar">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        <nav className="p-3 space-y-1 mt-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  active ? "bg-[#0F766E]/10 text-[#0F766E] font-semibold" : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={isMobile ? "candidateMobileSidebarActive" : "candidateSidebarActive"}
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0F766E] rounded-r-full"
                  />
                )}
                <Icon size={20} className={`shrink-0 transition-transform duration-200 ${active ? "text-[#0F766E]" : "group-hover:scale-105"}`} />
                {(!collapsed || isMobile) && <span className="text-sm tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#E2E8F0]">
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/5 font-medium transition-colors duration-200">
          <LogOut size={20} className="shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm tracking-wide">Logout</span>}
        </button>
      </div>
    </div>
  );
}

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
            <button onClick={onClose} className="p-2 rounded-xl text-[#475569] hover:bg-[#F8FAFC] transition-colors" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <SidebarInner collapsed={false} setCollapsed={() => {}} isActivePath={isActivePath} handleNav={handleNav} onLogout={onLogout} isMobile />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   TOP NAVIGATION
   ============================================================ */
function TopNavbar({ candidate, searchQuery, setSearchQuery, onMenuClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  return (
    <header className={`sticky top-0 z-20 transition-all duration-300 backdrop-blur-md border-b ${scrolled ? "bg-[#FFFFFF]/85 border-[#E2E8F0] shadow-sm" : "bg-[#FFFFFF]/70 border-[#E2E8F0]/60"}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors" aria-label="Open navigation menu">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, applications..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button className="relative p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>

            {candidate && (
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
                <div className="text-right leading-tight">
                  <p className="text-sm font-semibold text-[#0F172A]">{candidate.full_name}</p>
                  <p className="text-xs text-[#475569]">Candidate</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold">
                  {candidate.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

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
   MODAL SHELL
   ============================================================ */
function ModalShell({ open, onClose, title, icon: Icon, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-[#475569] hover:bg-[#F8FAFC] transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   APPLICATION VIEW MODAL
   ============================================================ */
function ApplicationViewModal({ app, job, onClose }) {
  const matched = splitSkills(app?.matched_skills);
  const missing = splitSkills(app?.missing_skills);

  return (
    <ModalShell open={!!app} onClose={onClose} title="Application Details" icon={Eye}>
      {app && (
        <>
          <div>
            <p className="text-lg font-bold text-[#0F172A]">{job?.title || `Job #${app.job_id}`}</p>
            <p className="text-sm text-[#475569] mt-0.5">{job?.department} • {job?.location}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">Status</p>
              <p className="text-sm font-medium text-[#0F172A] mt-0.5">{app.status || "Unknown"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">Match Score</p>
              <p className="text-sm font-medium text-[#0F172A] mt-0.5">{typeof app.match_score === "number" ? `${app.match_score}%` : "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Matched Skills</p>
            {matched.length ? (
              <div className="flex flex-wrap gap-1.5">
                {matched.map((s) => (
                  <span key={s} className="text-xs font-medium text-[#065F46] bg-[#065F46]/10 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]/70">None recorded</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Missing Skills</p>
            {missing.length ? (
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span key={s} className="text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]/70">None recorded</p>
            )}
          </div>
          {app.ai_summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">AI Summary</p>
              <p className="text-sm text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">{app.ai_summary}</p>
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}

/* ============================================================
   APPLICATION TRACK MODAL (timeline)
   ============================================================ */
function ApplicationTrackModal({ app, job, onClose }) {
  const currentIdx = timelineStageIndex(app?.status);

  return (
    <ModalShell open={!!app} onClose={onClose} title="Application Tracker" icon={RouteIcon}>
      {app && (
        <>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{job?.title || `Job #${app.job_id}`}</p>
            <p className="text-xs text-[#475569] mt-0.5">Current status: {app.status || "Unknown"}</p>
          </div>

          <div className="space-y-0">
            {TIMELINE_STAGES.map((stage, idx) => {
              const done = idx <= currentIdx;
              const isLast = idx === TIMELINE_STAGES.length - 1;
              return (
                <div key={stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#E2E8F0]" />
                    )}
                    {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${idx < currentIdx ? "bg-[#0F766E]" : "bg-[#E2E8F0]"}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${done ? "text-[#0F172A]" : "text-[#475569]"}`}>{stage}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#475569]/70 italic">
            The backend stores a single status value rather than timestamped pipeline stages, so this timeline is a best-effort mapping of your current status onto these steps.
          </p>
        </>
      )}
    </ModalShell>
  );
}

/* ============================================================
   ERROR STATE
   ============================================================ */
function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/20 ${compact ? "py-10" : "py-16"}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-[#EF4444]">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#EF4444] hover:bg-[#DC2626] rounded-xl transition-colors">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}


