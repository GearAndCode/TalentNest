import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  UserCircle,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  PieChart as PieChartIcon,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — Reused exactly from the existing Home page.
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
   API CLIENT
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

// Decode the JWT payload already stored by HRlogin.jsx (no extra endpoint needed)
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
   NAV ITEMS (shared by desktop + mobile sidebar)
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
export default function HRDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const [statsError, setStatsError] = useState(null);
  const [jobsError, setJobsError] = useState(null);
  const [candidatesError, setCandidatesError] = useState(null);
  const [applicationsError, setApplicationsError] = useState(null);

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

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      setStatsError("Unable to load dashboard statistics.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const res = await api.get("/jobs");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setJobsError("Unable to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    setCandidatesLoading(true);
    setCandidatesError(null);
    try {
      const res = await api.get("/candidates");
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCandidatesError("Unable to load candidates.");
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      const res = await api.get("/applications");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setApplicationsError("Unable to load applications.");
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchJobs();
    fetchCandidates();
    fetchApplications();
  }, [fetchStats, fetchJobs, fetchCandidates, fetchApplications]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("hr_email");
    navigate("/hr-login");
  }, [navigate]);

  const handleRefreshAll = useCallback(() => {
    fetchStats();
    fetchJobs();
    fetchCandidates();
    fetchApplications();
  }, [fetchStats, fetchJobs, fetchCandidates, fetchApplications]);

  /* ---------------- Derived, data-driven chart datasets ---------------- */

  const statusDistribution = useMemo(() => {
    if (!applications.length) return [];
    const counts = { Pending: 0, Accepted: 0, Rejected: 0 };
    applications.forEach((app) => {
      counts[classifyStatus(app.status)] += 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((entry) => entry.value > 0);
  }, [applications]);

  const hiringFunnelData = useMemo(() => {
    if (!applications.length) return [];
    const counts = {};
    applications.forEach((app) => {
      const label = app.status || "Unknown";
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [applications]);

  const matchDistributionData = useMemo(() => {
    const scored = applications.filter((a) => typeof a.match_score === "number");
    if (!scored.length) return [];
    const buckets = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];
    scored.forEach((app) => {
      const bucket = buckets.find((b) => app.match_score >= b.min && app.match_score <= b.max);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }, [applications]);

  // The applications endpoint does not currently return a timestamp field,
  // so a real weekly trend cannot be derived. We detect this rather than
  // fabricating dates.
  const hasApplicationDates = useMemo(
    () => applications.some((a) => a.applied_at || a.created_at),
    [applications]
  );

  const weeklyApplicationsData = useMemo(() => {
    if (!hasApplicationDates) return [];
    const buckets = {};
    applications.forEach((app) => {
      const raw = app.applied_at || app.created_at;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }, [applications, hasApplicationDates]);

  const jobApplicantCounts = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      map[app.job_id] = (map[app.job_id] || 0) + 1;
    });
    return map;
  }, [applications]);

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

  const recentJobs = useMemo(() => [...jobs].slice(-6).reverse(), [jobs]);
  const recentApplications = useMemo(() => [...applications].slice(-6).reverse(), [applications]);
  const recentCandidates = useMemo(() => [...candidates].slice(-6).reverse(), [candidates]);

  const derivedPendingCount = statusDistribution.find((s) => s.name === "Pending")?.value ?? 0;
  const derivedAcceptedCount = statusDistribution.find((s) => s.name === "Accepted")?.value ?? 0;
  const derivedRejectedCount = statusDistribution.find((s) => s.name === "Rejected")?.value ?? 0;

  const isActivePath = (path) => location.pathname === path;

  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF] flex">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  Recruitment Overview
                </h1>
                <p className="mt-1 text-sm sm:text-base text-[#475569]">
                  Live hiring metrics pulled directly from your TalentNest workspace.
                </p>
              </div>
              <button
                onClick={handleRefreshAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] w-fit"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>

            {/* Stat Cards */}
            <StatCardsSection
              stats={stats}
              loading={statsLoading}
              error={statsError}
              onRetry={fetchStats}
              pendingCount={derivedPendingCount}
              acceptedCount={derivedAcceptedCount}
              rejectedCount={derivedRejectedCount}
              hasApplications={applications.length > 0}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Hiring Funnel"
                subtitle="Applications grouped by current status"
                loading={applicationsLoading}
                error={applicationsError}
                onRetry={fetchApplications}
                isEmpty={hiringFunnelData.length === 0}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hiringFunnelData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="status" stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
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
                title="Candidate Status"
                subtitle="Share of applications by pipeline outcome"
                loading={applicationsLoading}
                error={applicationsError}
                onRetry={fetchApplications}
                isEmpty={statusDistribution.length === 0}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#0F766E"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#475569" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Match Distribution"
                subtitle="AI match-score spread across all applications"
                loading={applicationsLoading}
                error={applicationsError}
                onRetry={fetchApplications}
                isEmpty={matchDistributionData.length === 0}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={matchDistributionData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="range" stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "13px" }}
                    />
                    <Bar dataKey="count" fill="#14B8A6" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

            
            
            </div>

            {/* Recent Jobs */}
            <RecentJobsTable
              jobs={recentJobs}
              loading={jobsLoading}
              error={jobsError}
              onRetry={fetchJobs}
              jobApplicantCounts={jobApplicantCounts}
              onViewAll={() => navigate("/jobs")}
            />

            {/* Recent Applications */}
            <RecentApplicationsTable
              applications={recentApplications}
              loading={applicationsLoading}
              error={applicationsError}
              onRetry={fetchApplications}
              candidateLookup={candidateLookup}
              jobLookup={jobLookup}
              onViewAll={() => navigate("/applications")}
            />

            {/* Recent Candidates */}
            <RecentCandidatesSection
              candidates={recentCandidates}
              loading={candidatesLoading}
              error={candidatesError}
              onRetry={fetchCandidates}
              onViewAll={() => navigate("/candidates")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (Desktop, collapsible)
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
   SIDEBAR (Mobile drawer)
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
   TOP NAVIGATION
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
   STAT CARDS
   ============================================================ */
function StatCardsSection({ stats, loading, error, onRetry, pendingCount, acceptedCount, rejectedCount, hasApplications }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const cards = [
    { label: "Total Jobs", value: stats?.jobs ?? 0, icon: Briefcase },
    { label: "Total Candidates", value: stats?.candidates ?? 0, icon: Users },
    { label: "Applications", value: stats?.applications ?? 0, icon: FileText },
    {
      label: "Pending",
      value: pendingCount,
      icon: ArrowUpRight,
      hint: !hasApplications ? "No data available yet" : null,
    },
    {
      label: "Accepted",
      value: acceptedCount,
      icon: Award,
      hint: !hasApplications ? "No data available yet" : null,
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: X,
      hint: !hasApplications ? "No data available yet" : null,
    },
    { label: "Avg. Match Score", value: stats?.average_match_score ?? 0, icon: BrainCircuit, suffix: "%" },
    { label: "Open Positions", value: stats?.jobs ?? 0, icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <StatCard key={card.label} {...card} delay={idx * 0.04} />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, suffix = "", hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
      className="group bg-[#FFFFFF] p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
        <AnimatedCounter value={typeof value === "number" ? value : 0} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs sm:text-sm font-medium text-[#475569]">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-[#475569]/70">{hint}</p>}
    </motion.div>
  );
}

/* ============================================================
   CHART CARD WRAPPER
   ============================================================ */
function ChartCard({ title, subtitle, loading, error, onRetry, isEmpty, emptyMessage = "No data available yet", children }) {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
        <p className="text-xs text-[#475569] mt-0.5">{subtitle}</p>
      </div>

      {loading ? (
        <div className="h-[280px] rounded-xl bg-[#F8FAFC] animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} compact />
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
    <div className="h-[280px] flex flex-col items-center justify-center text-center gap-3 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <PieChartIcon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-[#475569]">{message}</p>
    </div>
  );
}

/* ============================================================
   RECENT JOBS TABLE
   ============================================================ */
function RecentJobsTable({ jobs, loading, error, onRetry, jobApplicantCounts, onViewAll }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Recent Jobs</h3>
          <p className="text-xs text-[#475569] mt-0.5">Latest open positions from your workspace</p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <div className="p-6">
          <ErrorState message={error} onRetry={onRetry} compact />
        </div>
      ) : jobs.length === 0 ? (
        <TableEmptyState message="No jobs available yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Employment Type</th>
                <th className="px-6 py-3">Applicants</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const applicantCount = jobApplicantCounts[job.id] || 0;
                return (
                  <tr key={job.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{job.title}</td>
                    <td className="px-6 py-4 text-[#475569]">{job.department || "—"}</td>
                    <td className="px-6 py-4 text-[#475569]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{job.employment_type || "—"}</td>
                    <td className="px-6 py-4 text-[#0F172A] font-medium">{applicantCount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          applicantCount > 0
                            ? "bg-[#0F766E]/10 text-[#0F766E]"
                            : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                        }`}
                      >
                        {applicantCount > 0 ? "Receiving Applicants" : "Awaiting Applicants"}
                      </span>
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

/* ============================================================
   RECENT APPLICATIONS TABLE
   ============================================================ */
function RecentApplicationsTable({ applications, loading, error, onRetry, candidateLookup, jobLookup, onViewAll }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Recent Applications</h3>
          <p className="text-xs text-[#475569] mt-0.5">Newest candidate applications and AI match scores</p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <div className="p-6">
          <ErrorState message={error} onRetry={onRetry} compact />
        </div>
      ) : applications.length === 0 ? (
        <TableEmptyState message="No applications available yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Job</th>
                <th className="px-6 py-3">Applied</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Match %</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const candidate = candidateLookup[app.candidate_id];
                const job = jobLookup[app.job_id];
                const category = classifyStatus(app.status);
                const appliedDate = app.applied_at || app.created_at;
                return (
                  <tr key={app.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">
                      {candidate?.full_name || `Candidate #${app.candidate_id}`}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{job?.title || `Job #${app.job_id}`}</td>
                    <td className="px-6 py-4 text-[#475569]">
                      {appliedDate ? new Date(appliedDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${STATUS_COLORS[category]}1A`,
                          color: STATUS_COLORS[category],
                        }}
                      >
                        {app.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">
                      {typeof app.match_score === "number" ? `${app.match_score}%` : "—"}
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

/* ============================================================
   RECENT CANDIDATES
   ============================================================ */
function RecentCandidatesSection({ candidates, loading, error, onRetry, onViewAll }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Recent Candidates</h3>
          <p className="text-xs text-[#475569] mt-0.5">Newest candidates added to your talent pool</p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : candidates.length === 0 ? (
        <TableEmptyState message="No candidates available yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((candidate, idx) => {
            const skills = Array.isArray(candidate.skills)
              ? candidate.skills
              : typeof candidate.parsed_skills === "string" && candidate.parsed_skills.length > 0
              ? candidate.parsed_skills.split(",").map((s) => s.trim()).filter(Boolean)
              : null;
            const experience = candidate.experience || null;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 transition-all duration-300 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold shrink-0">
                    {(candidate.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F172A] truncate">{candidate.full_name}</p>
                    <p className="text-xs text-[#475569] flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      {candidate.email}
                    </p>
                  </div>
                </div>

                {candidate.phone && (
                  <p className="text-xs text-[#475569] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {candidate.phone}
                  </p>
                )}

                <div className="pt-3 border-t border-[#E2E8F0]/80 space-y-2">
                  <div>
                    {skills && skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium text-[#0F766E] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#475569]/70 mt-1"></p>
                    )}
                  </div>
                 
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SHARED STATES
   ============================================================ */
function TableSkeleton({ rows = 4 }) {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-[#F8FAFC] animate-pulse" />
      ))}
    </div>
  );
}

function TableEmptyState({ message }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <FileText className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-[#475569]">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/20 ${
        compact ? "h-[280px]" : "py-10"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-[#EF4444]">{message}</p>
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
