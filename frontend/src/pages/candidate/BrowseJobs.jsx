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
  MapPin,
  Clock3,
  Layers,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — identical to CandidateDashboard.jsx
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
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });

// Forward-compatible only: nothing in this backend currently issues or checks a
// candidate JWT (no candidate password field, no candidate login endpoint), so this
// will be null today. If real candidate auth is added later using this same
// storage key, requests will start authenticating automatically with no code change.
function getCandidateToken() {
  return localStorage.getItem("candidate_token") || sessionStorage.getItem("candidate_token") || null;
}

api.interceptors.request.use((config) => {
  const token = getCandidateToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function splitSkills(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse Jobs", icon: Compass, path: "/candidate/browse-jobs" },
  { label: "My Applications", icon: FileText, path: "/candidate/applications" },
  { label: "AI Resume Analysis", icon: BrainCircuit, path: "/candidate/ai-analysis" },
  { label: "Profile", icon: UserCircle2, path: "/candidate/profile" },
];

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function BrowseJobs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const [candidate, setCandidate] = useState(null);
  const [myApplications, setMyApplications] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");

  const isActivePath = (path) => location.pathname === path;
  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );
  const handleLogout = useCallback(() => {
    localStorage.removeItem("candidate_token");
    sessionStorage.removeItem("candidate_token");
    localStorage.removeItem("candidate");
    sessionStorage.removeItem("candidate");
    localStorage.removeItem("candidate_session_email");
    navigate("/candidate-login", { replace: true });
  }, [navigate]);

  /* ---------------- Load the authenticated candidate (JWT-derived) + their applications (for "Already Applied") ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("candidate_token") || sessionStorage.getItem("candidate_token");
    if (!token) return;
    (async () => {
      try {
        const [meRes, applicationsRes] = await Promise.all([api.get("/candidates/me"), api.get("/applications")]);
        setCandidate(meRes.data || null);
        setMyApplications(applicationsRes.data || []);
      } catch {
        // Non-fatal: job browsing still works without a resolved candidate.
      }
    })();
  }, []);

  const appliedJobIds = useMemo(() => new Set(myApplications.map((a) => a.job_id)), [myApplications]);

  /* ---------------- Fetch jobs (all, or via search) ---------------- */
  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearchError(null);
    try {
      const res = await api.get("/jobs/");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Unable to load jobs. Please make sure the TalentNest backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (keyword) => {
    setLoading(true);
    setSearchError(null);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      const res = await api.get("/jobs/search", { params });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSearchError("Search failed. Showing your last results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = searchInput.trim();
    setActiveKeyword(trimmed);
    if (trimmed) runSearch(trimmed);
    else fetchAllJobs();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveKeyword("");
    fetchAllJobs();
  };

  const handleClearFilters = () => {
    setLocationFilter("All");
    setDepartmentFilter("All");
    setTypeFilter("All");
    setExperienceFilter("All");
  };

  /* ---------------- Filter option lists (built from real returned data) ---------------- */
  const locations = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)))], [jobs]);
  const departments = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)))], [jobs]);
  const employmentTypes = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.employment_type).filter(Boolean)))], [jobs]);
  const experienceLevels = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.experience).filter(Boolean)))], [jobs]);

  /* ---------------- Client-side filters on top of the fetched/search results ---------------- */
  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        (locationFilter === "All" || j.location === locationFilter) &&
        (departmentFilter === "All" || j.department === departmentFilter) &&
        (typeFilter === "All" || j.employment_type === typeFilter) &&
        (experienceFilter === "All" || j.experience === experienceFilter)
    );
  }, [jobs, locationFilter, departmentFilter, typeFilter, experienceFilter]);

  const filtersActive = locationFilter !== "All" || departmentFilter !== "All" || typeFilter !== "All" || experienceFilter !== "All" || !!activeKeyword;

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
        <TopNavbar candidate={candidate} searchQuery={headerSearchQuery} setSearchQuery={setHeaderSearchQuery} onMenuClick={() => setMobileSidebarOpen(true)} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Browse Jobs</h1>
                <p className="mt-1 text-sm sm:text-base text-[#475569]">Discover opportunities that match your skills, experience, and career goals.</p>
              </div>
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] w-fit"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Search + Filters */}
            <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-5">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search jobs by title, skill, or keyword..."
                    className="w-full pl-10 pr-4 py-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm transition-all duration-200 whitespace-nowrap"
                  >
                    Search
                  </button>
                  {activeKeyword && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-4 py-3 text-sm font-medium text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#EF4444]/40 hover:text-[#EF4444] rounded-xl transition-all duration-200 whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {searchError && <p className="text-xs font-medium text-[#EF4444]">{searchError}</p>}

              <div className="h-px bg-[#E2E8F0]" />

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterSelect label="Location" value={locationFilter} onChange={setLocationFilter}>
                  {locations.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Department" value={departmentFilter} onChange={setDepartmentFilter}>
                  {departments.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Job Type" value={typeFilter} onChange={setTypeFilter}>
                  {employmentTypes.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Experience Level" value={experienceFilter} onChange={setExperienceFilter}>
                  {experienceLevels.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </FilterSelect>
              </div>

              {filtersActive && (
                <button
                  onClick={() => {
                    handleClearFilters();
                    handleClearSearch();
                  }}
                  className="text-xs font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Job Count */}
            <p className="text-sm font-medium text-[#475569]">
              {loading ? "Finding opportunities..." : `${filteredJobs.length} job${filteredJobs.length === 1 ? "" : "s"} found`}
            </p>

            {/* Results */}
            {error ? (
              <ErrorState message={error} onRetry={fetchAllJobs} />
            ) : loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-14 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">No opportunities found</h3>
                <p className="text-sm text-[#475569] max-w-sm">Try a different keyword or clear your filters to explore more jobs.</p>
                <button
                  onClick={() => {
                    handleClearFilters();
                    handleClearSearch();
                  }}
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} alreadyApplied={appliedJobIds.has(job.id)} onView={() => navigate(`/candidate/jobs/${job.id}`)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER SELECT
   ============================================================ */
function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
      </div>
    </div>
  );
}

/* ============================================================
   JOB CARD
   ============================================================ */
function JobCard({ job, alreadyApplied, onView }) {
  const skills = splitSkills(job.skills);
  const posted = timeAgo(job.created_at);
  const initials = (job.department || job.title || "JB").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-sm shrink-0">{initials}</div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#0F172A] leading-tight truncate">{job.title}</h3>
          <p className="text-xs text-[#475569] mt-0.5">{job.department}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#475569]">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E]" /> {job.location}
          </span>
        )}
        {job.employment_type && (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5 text-[#0F766E]" /> {job.employment_type}
          </span>
        )}
        {job.experience && (
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#0F766E]" /> {job.experience}
          </span>
        )}
        {typeof job.salary === "number" && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#0F766E]" /> {job.salary.toLocaleString()}
          </span>
        )}
      </div>

      {job.description && <p className="mt-3 text-sm text-[#475569] leading-relaxed line-clamp-2">{job.description}</p>}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((skill) => (
            <span key={skill} className="text-[11px] font-medium text-[#0F766E] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
        <span className="text-xs text-[#475569] inline-flex items-center gap-1">
          {posted && (
            <>
              <CalendarDays className="w-3.5 h-3.5" /> {posted}
            </>
          )}
        </span>
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm transition-all duration-200"
        >
          {alreadyApplied && <CheckCircle2 className="w-3.5 h-3.5" />}
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#E2E8F0]/60 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-[#E2E8F0]/60 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-[#E2E8F0]/60 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 h-3 w-3/4 rounded bg-[#E2E8F0]/60 animate-pulse" />
      <div className="mt-3 h-3 w-full rounded bg-[#E2E8F0]/60 animate-pulse" />
      <div className="mt-2 h-3 w-5/6 rounded bg-[#E2E8F0]/60 animate-pulse" />
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-[#E2E8F0]/60 animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-[#E2E8F0]/60 animate-pulse" />
      </div>
      <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex justify-end">
        <div className="h-8 w-28 rounded-xl bg-[#E2E8F0]/60 animate-pulse" />
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (identical structure/classes to CandidateDashboard.jsx)
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
   TOP NAVIGATION (identical structure/classes to CandidateDashboard.jsx)
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
   ERROR STATE
   ============================================================ */
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 rounded-[20px] bg-[#EF4444]/5 border border-[#EF4444]/20 py-16">
      <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <p className="text-sm font-medium text-[#EF4444]">Unable to load jobs</p>
      <p className="text-xs text-[#475569] max-w-sm">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#EF4444] hover:bg-[#DC2626] rounded-xl transition-colors">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}
