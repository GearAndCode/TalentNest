import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BrainCircuit,
  ListChecks,
  UserCircle,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Inbox,
  Clock,
  Eye,
  DollarSign,
  Repeat2,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — TalentNest logo, identical everywhere in the app.
   ============================================================ */
const TalentNestLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 18C4 23.5228 8.47715 28 14 28H18C23.5228 28 28 23.5228 28 18C28 15.5 27.1 13.2 25.5 11.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" />
    <path d="M7 16C7 20.4183 10.5817 24 15 24H17C21.4183 24 25 20.4183 25 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
    <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    <path d="M9 17.5C9 15.5 10.3 14.5 12 14.5C13.7 14.5 15 15.5 15 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="10" r="2.5" fill="currentColor" />
    <path d="M17 16.5C17 14.5 18.3 13.5 20 13.5C21.7 13.5 23 14.5 23 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ============================================================
   API CLIENT — same shape as BrowseJobs.jsx uses.
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Every candidate request must carry the authenticated candidate JWT.
// The backend uses this token to determine which candidate is making the request.
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("candidate_token") ||
    sessionStorage.getItem("candidate_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("candidate_token");
      sessionStorage.removeItem("candidate_token");
      localStorage.removeItem("candidate");
      sessionStorage.removeItem("candidate");
      localStorage.removeItem("candidate_session_email");
      sessionStorage.removeItem("candidate_session_email");
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   NAV ITEMS
   ============================================================ */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse Jobs", icon: Briefcase, path: "/candidate/browse-jobs" },
  { label: "My Applications", icon: FileText, path: "/candidate/applications" },
  { label: "AI Resume Analysis", icon: BrainCircuit, path: "/candidate/ai-analysis" },
  { label: "Profile", icon: UserCircle, path: "/candidate/profile" },
];

/* ============================================================
   STATUS MAPPING
   ============================================================ */
function classifyStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("offer")) return "Offered";
  if (s.includes("interview")) return "Interview";
  if (s.includes("shortlist")) return "Shortlisted";
  if (s.includes("review")) return "Under Review";
  return "Pending";
}

const STATUS_STYLES = {
  Pending: "bg-teal-50 text-[#0F766E] border border-teal-100",
  "Under Review": "bg-blue-50 text-blue-700 border border-blue-100",
  Shortlisted: "bg-purple-50 text-purple-700 border border-purple-100",
  Interview: "bg-orange-50 text-orange-700 border border-orange-100",
  Offered: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Rejected: "bg-red-50 text-red-700 border border-red-100",
};

function StatusBadge({ status }) {
  const label = classifyStatus(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[label]}`}>
      {label}
    </span>
  );
}

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function MyApplications() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidateId, setCandidateId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const [detailApp, setDetailApp] = useState(null);

  const candidateEmail = useMemo(
    () =>
      localStorage.getItem("candidate_session_email") ||
      sessionStorage.getItem("candidate_session_email") ||
      "",
    []
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The backend identifies the candidate from the JWT.
      // Never load all candidates and select one by email.
      const [meRes, applicationsRes, jobsRes] = await Promise.all([
        api.get("/candidates/me"),
        api.get("/applications/"),
        api.get("/jobs/"),
      ]);

      const me = meRes.data || null;
      const myApplications = Array.isArray(applicationsRes.data)
        ? applicationsRes.data
        : [];
      const allJobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];

      setCandidateId(me?.id ?? null);
      setJobs(allJobs);
      setApplications(myApplications);
    } catch (err) {
      setError("Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  }, [candidateEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const jobLookup = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);

  const enriched = useMemo(
    () =>
      applications.map((app) => ({
        ...app,
        job: jobLookup[app.job_id] || null,
        appliedDate: app.applied_at || app.created_at || null,
      })),
    [applications, jobLookup]
  );

  const stats = useMemo(() => {
    const counts = { total: enriched.length, pending: 0, interviews: 0, offers: 0, rejected: 0 };
    enriched.forEach((app) => {
      const label = classifyStatus(app.status);
      if (label === "Pending" || label === "Under Review" || label === "Shortlisted") counts.pending += 1;
      if (label === "Interview") counts.interviews += 1;
      if (label === "Offered") counts.offers += 1;
      if (label === "Rejected") counts.rejected += 1;
    });
    return counts;
  }, [enriched]);

  const filtered = useMemo(() => {
    let list = enriched.filter((app) => {
      const title = app.job?.title || "";
      const dept = app.job?.department || "";
      const q = search.toLowerCase();
      const matchesSearch = !q || title.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || classifyStatus(app.status) === statusFilter;
      const matchesType = typeFilter === "All" || app.job?.employment_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    list = [...list].sort((a, b) => {
      const aId = a.id || 0;
      const bId = b.id || 0;
      return sortOrder === "newest" ? bId - aId : aId - bId;
    });

    return list;
  }, [enriched, search, statusFilter, typeFilter, sortOrder]);

  const filtersActive = search || statusFilter !== "All" || typeFilter !== "All" || sortOrder !== "newest";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortOrder("newest");
  };

  const isActivePath = (path) => location.pathname === path;
  const handleNav = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };
  const handleLogout = () => {
    // Clear both storage locations because "Remember me" may use either one.
    localStorage.removeItem("candidate_token");
    sessionStorage.removeItem("candidate_token");
    localStorage.removeItem("candidate");
    sessionStorage.removeItem("candidate");
    localStorage.removeItem("candidate_session_email");
    sessionStorage.removeItem("candidate_session_email");

    // Prevent Back from reopening the authenticated page.
    navigate("/candidate-login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased flex">
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

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar onMenuClick={() => setMobileSidebarOpen(true)} candidateEmail={candidateEmail} navigate={navigate} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">My Applications</h1>
                <p className="mt-1 text-sm sm:text-base text-[#475569]">
                  Track all your job applications and stay updated on your application progress.
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-sm transition-all duration-200 w-fit"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <StatsRow stats={stats} loading={loading} />

            <FiltersPanel
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              filtersActive={filtersActive}
              clearFilters={clearFilters}
            />

            {loading ? (
              <ApplicationListSkeleton />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchData} />
            ) : filtered.length === 0 ? (
              <EmptyApplicationsState hasAny={enriched.length > 0} onBrowse={() => navigate("/candidate/browse-jobs")} />
            ) : (
              <div className="space-y-4">
                {filtered.map((app, idx) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    index={idx}
                    onViewJob={() => app.job && navigate(`/candidate/jobs/${app.job.id}`)}
                    onViewApplication={() => setDetailApp(app)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ApplicationDetailModal app={detailApp} onClose={() => setDetailApp(null)} />
    </div>
  );
}

/* ============================================================
   SIDEBAR (Desktop)
   ============================================================ */
function Sidebar({ collapsed, setCollapsed, isActivePath, handleNav, onLogout }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r border-[#E2E8F0] z-30 shadow-sm"
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
          <button onClick={() => handleNav("/dashboard")} className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
              <TalentNestLogo className="w-6 h-6 text-white" />
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
                    layoutId={isMobile ? "mobileCandidateActive" : "candidateActive"}
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
          className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-[#E2E8F0] z-50 lg:hidden shadow-xl flex flex-col"
        >
          <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
                <TalentNestLogo className="w-6 h-6 text-white" />
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
   TOP NAVBAR
   ============================================================ */
function TopNavbar({ onMenuClick, candidateEmail, navigate }) {
  const namePart = candidateEmail.includes("@") ? candidateEmail.split("@")[0] : candidateEmail;
  const displayName = namePart
    ? namePart.replace(/[._-]+/g, " ").split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Candidate";

  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-[#E2E8F0]/60">
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
                placeholder="Search jobs, applications..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button className="relative p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-[#0F172A]">{displayName}</p>
                <p className="text-xs text-[#475569]">Candidate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   STAT CARDS
   ============================================================ */
function StatsRow({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Applications", value: stats.total, icon: FileText },
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Interviews", value: stats.interviews, icon: Calendar },
    { label: "Offers", value: stats.offers, icon: Briefcase },
    { label: "Rejected", value: stats.rejected, icon: X },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="p-2.5 w-fit rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E]">
            <card.icon className="w-5 h-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-[#0F172A] tracking-tight">{card.value}</p>
          <p className="mt-1 text-xs font-medium text-[#475569]">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================
   FILTERS PANEL
   ============================================================ */
function FiltersPanel({ search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, sortOrder, setSortOrder, filtersActive, clearFilters }) {
  return (
    <div className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applications by job title or company..."
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            {["All", "Pending", "Under Review", "Shortlisted", "Interview", "Offered", "Rejected"].map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
            {["All", "Full Time", "Part Time", "Internship", "Contract"].map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Job Types" : t}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={selectCls}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {filtersActive && (
          <button onClick={clearFilters} className="text-xs font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors whitespace-nowrap">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

const selectCls =
  "px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all";

/* ============================================================
   APPLICATION CARD
   ============================================================ */
function ApplicationCard({ app, index, onViewJob, onViewApplication }) {
  const job = app.job;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold text-lg shrink-0">
          {(job?.title || "?").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">{job?.title || `Job #${app.job_id}`}</h3>
              <p className="text-sm text-[#475569] mt-0.5">{job?.department || "TalentNest Company"}</p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-[#475569]">
            {job?.location && (
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            )}
            {job?.employment_type && (
              <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.employment_type}</span>
            )}
            {typeof job?.salary === "number" && job.salary > 0 && (
              <span className="inline-flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />${job.salary.toLocaleString()}</span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Applied {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </span>
          </div>

          {job?.description && <p className="mt-3 text-sm text-[#475569] line-clamp-2 leading-relaxed">{job.description}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={onViewJob}
              disabled={!job}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              View Job
            </button>
            <button
              onClick={onViewApplication}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              View Application
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   DETAIL MODAL
   ============================================================ */
function ApplicationDetailModal({ app, onClose }) {
  return (
    <AnimatePresence>
      {app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[20px] shadow-2xl border border-[#E2E8F0] w-full max-w-lg max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#E2E8F0] sticky top-0 bg-white rounded-t-[20px]">
              <h2 className="text-lg font-bold text-[#0F172A]">Application Details</h2>
              <button onClick={onClose} className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">{app.job?.title || `Job #${app.job_id}`}</h3>
                  <p className="text-sm text-[#475569] mt-0.5">{app.job?.department || "TalentNest Company"}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <DetailRow label="Location" value={app.job?.location || "—"} />
                <DetailRow label="Employment Type" value={app.job?.employment_type || "—"} />
                <DetailRow
                  label="Date Applied"
                  value={app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                />
                <DetailRow label="Application ID" value={`#${app.id}`} />
              </div>

              {app.job?.description && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-1">Job Description</p>
                  <p className="text-sm text-[#475569] leading-relaxed">{app.job.description}</p>
                </div>
              )}

              {Array.isArray(app.job?.skills) && app.job.skills.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.job.skills.map((skill) => (
                      <span key={skill} className="text-xs font-medium text-[#0F766E] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-sm transition-all">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">{label}</p>
      <p className="text-sm text-[#0F172A] font-medium mt-0.5">{value}</p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
function EmptyApplicationsState({ hasAny, onBrowse }) {
  return (
    <div className="bg-white rounded-[20px] border border-dashed border-[#E2E8F0] p-14 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <Inbox className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">{hasAny ? "No applications match your filters" : "No applications yet"}</h3>
        <p className="text-sm text-[#475569] mt-1 max-w-sm">
          {hasAny
            ? "Try adjusting your search or filters to see more results."
            : "Start exploring opportunities and apply to jobs that match your skills and career goals."}
        </p>
      </div>
      {!hasAny && (
        <button
          onClick={onBrowse}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Briefcase className="w-4 h-4" />
          Browse Jobs
        </button>
      )}
    </div>
  );
}

/* ============================================================
   ERROR STATE
   ============================================================ */
function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[20px] py-12 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#EF4444]">Unable to load your applications</p>
        <p className="text-xs text-[#475569] mt-1">Please make sure the TalentNest backend is running and try again.</p>
      </div>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl transition-colors">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
   ============================================================ */
function ApplicationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 rounded-[20px] bg-[#E2E8F0]/50 animate-pulse" />
      ))}
    </div>
  );
}
