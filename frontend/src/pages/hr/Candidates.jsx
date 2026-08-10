import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search, RefreshCw, Eye, FileText, X, ChevronDown, ChevronRight, ChevronLeft,
  Briefcase, Users, Award, BarChart3, Settings, LogOut, Bell,
  Menu, UserCircle, BrainCircuit, LayoutDashboard, Building2, Mail, Phone,
  Calendar, TrendingUp, FileWarning, CheckCircle2, Circle, ArrowUpDown,
  Download, ClipboardList, MailX, Inbox,
} from 'lucide-react';

/* ============================================================
   BRAND ASSET — reused exactly from HRDashboard.jsx / Jobs.jsx /
   Applications.jsx. Do not modify. Do not create a second logo.
   ============================================================ */
const TalentNestLogo = ({ className = 'w-6 h-6' }) => (
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
   API CLIENT — same base URL + auth pattern as HRDashboard.jsx
   (matches what HRlogin.jsx actually stores: "access_token").
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getErrorMessage(err, fallback) {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;
  if (detail && typeof detail === 'string') return detail;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return 'That candidate could not be found.';
  if (status === 422) return 'The server rejected that request — please check the details.';
  if (status === 500) return 'Something went wrong on the server. Please try again.';
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your backend connection.';
  return fallback;
}

/* ============================================================
   NAV ITEMS — identical set/order to HRDashboard.jsx / Jobs.jsx /
   Applications.jsx.
   ============================================================ */
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/hr-dashboard' },
  { label: 'Jobs', icon: Briefcase, path: '/jobs' },
  { label: 'Applications', icon: FileText, path: '/applications' },
  { label: 'Candidates', icon: Users, path: '/candidates' },
  { label: 'AI Analysis', icon: BrainCircuit, path: '/ai-analysis' },
  { label: 'AI Rankings', icon: Award, path: '/ai-rankings' },
  
];

/* ============================================================
   STATUS STYLES — same palette used on the Applications page,
   applied here to each candidate's application statuses.
   ============================================================ */
const STATUS_STYLES = {
  Applied: { bg: '#64748B1A', text: '#475569', dot: '#64748B' },
  'Under Review': { bg: '#F59E0B1A', text: '#B45309', dot: '#F59E0B' },
  Shortlisted: { bg: '#6366F11A', text: '#4338CA', dot: '#6366F1' },
  'Interview Scheduled': { bg: '#0EA5E91A', text: '#0369A1', dot: '#0EA5E9' },
  'Interview Completed': { bg: '#8B5CF61A', text: '#6D28D9', dot: '#8B5CF6' },
  Accepted: { bg: '#0F766E1A', text: '#0F766E', dot: '#0F766E' },
  Hired: { bg: '#16A34A1A', text: '#15803D', dot: '#16A34A' },
  Rejected: { bg: '#EF44441A', text: '#DC2626', dot: '#EF4444' },
};

function statusStyle(status) {
  return STATUS_STYLES[status] || { bg: '#94A3B81A', text: '#475569', dot: '#94A3B8' };
}

function StatusBadge({ status }) {
  const s = statusStyle(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
}

function matchScoreColor(score) {
  if (typeof score !== 'number') return '#94A3B8';
  if (score >= 75) return '#0F766E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function splitSkills(value) {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function initialsOf(name) {
  return (name || '?').charAt(0).toUpperCase();
}

/* ============================================================
   ROOT COMPONENT — page shell (Sidebar + TopNavbar) reused
   exactly as in HRDashboard.jsx / Jobs.jsx / Applications.jsx.
   ============================================================ */
export default function Candidates() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hrIdentity = useMemo(() => {
    const token = localStorage.getItem('access_token');
    const payload = token ? decodeJwtPayload(token) : null;
    const email = payload?.email || localStorage.getItem('hr_email') || '';
    const namePart = email.includes('@') ? email.split('@')[0] : email;
    const displayName = namePart
      ? namePart
          .replace(/[._-]+/g, ' ')
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'HR User';
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('hr_email');
    navigate('/hr-login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF] flex">
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' } }}
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
            <CandidatesContent />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (Desktop, collapsible) — copied exactly from
   HRDashboard.jsx / Jobs.jsx / Applications.jsx.
   ============================================================ */
function Sidebar({ collapsed, setCollapsed, isActivePath, handleNav, onLogout }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
            onClick={() => handleNav('/hr-dashboard')}
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
                    ? 'bg-[#0F766E]/10 text-[#0F766E] font-semibold'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={isMobile ? 'mobileSidebarActiveIndicator' : 'sidebarActiveIndicator'}
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0F766E] rounded-r-full"
                  />
                )}
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform duration-200 ${active ? 'text-[#0F766E]' : 'group-hover:scale-105'}`}
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
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
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
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 backdrop-blur-md border-b ${
        scrolled ? 'bg-[#FFFFFF]/85 border-[#E2E8F0] shadow-sm' : 'bg-[#FFFFFF]/70 border-[#E2E8F0]/60'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

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
   CANDIDATES CONTENT — the actual page
   ============================================================ */
function CandidatesContent() {
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [resumeFilter, setResumeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [matchFilter, setMatchFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-az');

  const [viewingCandidate, setViewingCandidate] = useState(null);

  /* ---------------- FETCH ----------------
     CandidateResponse only returns id, full_name, email, phone,
     resume_path — parsed_skills / experience / education / etc.
     exist on the Candidate model but are NOT exposed by
     GET /candidates, so they can't be shown here without
     inventing data. Match scores and AI analysis live on
     Application records instead, so applications + jobs are
     fetched too and joined by candidate_id, same as the
     Applications page does. */
  const fetchAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [candidatesRes, appsRes, jobsRes] = await Promise.all([
        api.get('/candidates/'),
        api.get('/applications/'),
        api.get('/jobs/'),
      ]);
      setCandidates(Array.isArray(candidatesRes.data) ? candidatesRes.data : []);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load candidates.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const jobLookup = useMemo(() => {
    const map = {};
    jobs.forEach((j) => (map[j.id] = j));
    return map;
  }, [jobs]);

  const applicationsByCandidate = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      if (!map[app.candidate_id]) map[app.candidate_id] = [];
      map[app.candidate_id].push({ ...app, job: jobLookup[app.job_id] || null });
    });
    return map;
  }, [applications, jobLookup]);

  /* ---------------- ENRICH ---------------- */
  const enriched = useMemo(
    () =>
      candidates.map((c) => {
        const apps = applicationsByCandidate[c.id] || [];
        const scores = apps.filter((a) => typeof a.match_score === 'number').map((a) => a.match_score);
        const bestMatchScore = scores.length ? Math.max(...scores) : null;
        const latestApp = apps.length
          ? [...apps].sort((a, b) => new Date(b.applied_at || 0) - new Date(a.applied_at || 0))[0]
          : null;
        return {
          ...c,
          applications: apps,
          applicationsCount: apps.length,
          bestMatchScore,
          latestStatus: latestApp?.status || null,
        };
      }),
    [candidates, applicationsByCandidate]
  );

  /* ---------------- FILTER OPTIONS (derived from real data) ---------------- */
  const statusOptions = useMemo(
    () => Array.from(new Set(applications.map((a) => a.status).filter(Boolean))),
    [applications]
  );

  /* ---------------- FILTER + SORT ---------------- */
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    let list = enriched.filter((c) => {
      if (kw) {
        const name = (c.full_name || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        if (!name.includes(kw) && !email.includes(kw) && !phone.includes(kw)) return false;
      }
      if (resumeFilter === 'yes' && !c.resume_path) return false;
      if (resumeFilter === 'no' && c.resume_path) return false;
      if (statusFilter && c.latestStatus !== statusFilter) return false;

      if (matchFilter) {
        const score = typeof c.bestMatchScore === 'number' ? c.bestMatchScore : -1;
        if (matchFilter === '80+' && score < 80) return false;
        if (matchFilter === '60-79' && (score < 60 || score > 79)) return false;
        if (matchFilter === '40-59' && (score < 40 || score > 59)) return false;
        if (matchFilter === '<40' && (score < 0 || score >= 40)) return false;
        if (matchFilter === 'none' && score !== -1) return false;
      }

      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name-za') return (b.full_name || '').localeCompare(a.full_name || '');
      if (sortBy === 'most-applications') return b.applicationsCount - a.applicationsCount;
      if (sortBy === 'highest-match') return (b.bestMatchScore ?? -1) - (a.bestMatchScore ?? -1);
      return (a.full_name || '').localeCompare(b.full_name || ''); // name-az
    });

    return list;
  }, [enriched, keyword, resumeFilter, statusFilter, matchFilter, sortBy]);

  const clearFilters = () => {
    setKeyword('');
    setResumeFilter('');
    setStatusFilter('');
    setMatchFilter('');
    setSortBy('name-az');
  };

  const hasActiveFilters = keyword || resumeFilter || statusFilter || matchFilter || sortBy !== 'name-az';

  const handleOpenResume = (candidate) => {
    if (!candidate?.resume_path) {
        toast.error("No resume uploaded.");
        return;
    }

    const resumeUrl = `${API_BASE_URL}/${candidate.resume_path.replace(/^\/+/, "")}`;

    window.open(resumeUrl, "_blank");
};

  const handleEmailCandidate = () => {
    toast(
      "Emailing candidates isn't available yet — the backend has no email-sending endpoint.",
      { icon: '✉️', duration: 4000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Candidates</h1>
          <p className="mt-1 text-sm sm:text-base text-[#475569]">
            Manage and review every candidate registered in TalentNest.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-medium text-[#475569]">Total Candidates</span>
            <span className="text-lg font-bold text-[#0F172A]">{candidates.length}</span>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] disabled:opacity-60 w-fit"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
            />
          </div>
          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort By"
            icon={ArrowUpDown}
            raw
            options={[
              { value: 'name-az', label: 'Name (A–Z)' },
              { value: 'name-za', label: 'Name (Z–A)' },
              { value: 'most-applications', label: 'Most Applications' },
              { value: 'highest-match', label: 'Highest Match Score' },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterSelect
            value={resumeFilter}
            onChange={setResumeFilter}
            placeholder="Resume: Any"
            raw
            options={[
              { value: 'yes', label: 'Resume Uploaded' },
              { value: 'no', label: 'No Resume' },
            ]}
          />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Application Statuses" />
          <FilterSelect
            value={matchFilter}
            onChange={setMatchFilter}
            placeholder="Match Score"
            raw
            options={[
              { value: '80+', label: '80% and above' },
              { value: '60-79', label: '60% – 79%' },
              { value: '40-59', label: '40% – 59%' },
              { value: '<40', label: 'Below 40%' },
              { value: 'none', label: 'No score yet' },
            ]}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/5 rounded-xl transition-colors"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table / States */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAll()} />
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
      ) : (
        <CandidatesTable
          candidates={filtered}
          onView={setViewingCandidate}
          onOpenResume={handleOpenResume}
          onEmail={handleEmailCandidate}
        />
      )}

      {/* View Drawer */}
      <AnimatePresence>
        {viewingCandidate && (
          <CandidateDrawer
            candidate={viewingCandidate}
            onClose={() => setViewingCandidate(null)}
            onOpenResume={handleOpenResume}
            onEmail={handleEmailCandidate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   FILTER SELECT — same visual pattern as Jobs.jsx / Applications.jsx
   ============================================================ */
function FilterSelect({ value, onChange, options, placeholder, raw, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition cursor-pointer ${
          Icon ? 'pl-9' : 'pl-4'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) =>
          raw ? (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
    </div>
  );
}

/* ============================================================
   CANDIDATES TABLE
   ============================================================ */
function CandidatesTable({ candidates, onView, onOpenResume, onEmail }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]">
              <th className="px-6 py-3.5">Candidate</th>
              <th className="px-6 py-3.5">Phone</th>
              <th className="px-6 py-3.5">Resume</th>
              <th className="px-6 py-3.5">Applications</th>
              <th className="px-6 py-3.5">Best Match</th>
              <th className="px-6 py-3.5">Latest Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, idx) => (
              <tr
                key={c.id}
                className={`border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/70 transition-colors ${
                  idx % 2 === 1 ? 'bg-[#F8FAFC]/30' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold text-xs">
                      {initialsOf(c.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{c.full_name}</p>
                      <p className="text-xs text-[#475569] truncate">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#475569] whitespace-nowrap">{c.phone || '—'}</td>
                <td className="px-6 py-4">
                  {c.resume_path ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] bg-[#94A3B8]/10 px-2.5 py-1 rounded-full">
                      <Circle size={12} /> None
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-[#0F172A] font-medium">{c.applicationsCount}</td>
                <td className="px-6 py-4">
                  {typeof c.bestMatchScore === 'number' ? (
                    <span className="font-bold" style={{ color: matchScoreColor(c.bestMatchScore) }}>
                      {c.bestMatchScore}%
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {c.latestStatus ? <StatusBadge status={c.latestStatus} /> : <span className="text-xs text-[#94A3B8]">No applications</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <ActionIcon label="View candidate" onClick={() => onView(c)}>
                      <Eye size={16} />
                    </ActionIcon>
                    <ActionIcon label="View resume" onClick={() => onOpenResume(c)}>
                      <FileText size={16} />
                    </ActionIcon>
                    <ActionIcon label="View applications" onClick={() => onView(c)}>
                      <ClipboardList size={16} />
                    </ActionIcon>
                    <ActionIcon label="Email candidate — not available yet (no backend endpoint)" onClick={onEmail}>
                      <MailX size={16} />
                    </ActionIcon>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionIcon({ children, onClick, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`p-2 rounded-lg transition-colors ${
        disabled
          ? 'text-[#CBD5E1] cursor-not-allowed'
          : 'text-[#475569] hover:text-[#0F766E] hover:bg-[#0F766E]/5'
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   VIEW DRAWER
   ============================================================ */
function CandidateDrawer({ candidate, onClose, onOpenResume, onEmail }) {
  const c = candidate;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-[#FFFFFF] z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] font-bold">
              {initialsOf(c.full_name)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#0F172A] truncate">{c.full_name}</p>
              <p className="text-xs text-[#475569] truncate">{c.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#475569] hover:bg-[#F8FAFC] transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Snapshot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-2">Applications</p>
              <span className="text-2xl font-bold text-[#0F172A]">{c.applicationsCount}</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-2">Best Match Score</p>
              {typeof c.bestMatchScore === 'number' ? (
                <div>
                  <span className="text-2xl font-bold" style={{ color: matchScoreColor(c.bestMatchScore) }}>
                    {c.bestMatchScore}%
                  </span>
                  <div className="mt-2 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, c.bestMatchScore))}%`, backgroundColor: matchScoreColor(c.bestMatchScore) }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-sm text-[#94A3B8]">Not available</span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <Section title="Candidate Information">
            <InfoRow icon={Mail} label="Email" value={c.email} />
            <InfoRow icon={Phone} label="Phone" value={c.phone} />
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2 text-sm text-[#475569] min-w-0">
                <FileText size={15} className="shrink-0" />
                <span className="truncate">{c.resume_path ? c.resume_path.split('/').pop() : 'No resume uploaded'}</span>
              </div>
              {c.resume_path && (
                <button
                  onClick={() => onOpenResume(c)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0D9488] shrink-0"
                >
                  <Download size={13} />
                  Open
                </button>
              )}
            </div>
          </Section>

          {/* Applications */}
          <Section title={`Applications (${c.applications.length})`}>
            {c.applications.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-[#94A3B8] py-2">
                <Inbox size={16} />
                This candidate hasn't applied to any jobs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {[...c.applications]
                  .sort((a, b) => new Date(b.applied_at || 0) - new Date(a.applied_at || 0))
                  .map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
              </div>
            )}
          </Section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E2E8F0] shrink-0 flex gap-3">
          <button
            onClick={() => onOpenResume(c)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F766E] bg-[#0F766E]/5 border border-[#0F766E]/20 hover:bg-[#0F766E]/10 rounded-xl transition-colors"
          >
            <FileText size={16} />
            View Resume
          </button>
          <button
            onClick={onEmail}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-not-allowed"
            title="Email candidate — not available yet (no backend endpoint)"
          >
            <MailX size={16} />
            Email
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function ApplicationCard({ app }) {
  const matchedSkills = splitSkills(app.matched_skills);
  const missingSkills = splitSkills(app.missing_skills);

  return (
    <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#0F172A] truncate">{app.job?.title || `Job #${app.job_id}`}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#475569] mt-1">
            <Calendar size={12} />
            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {typeof app.match_score === 'number' && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: matchScoreColor(app.match_score) }}>
            {app.match_score}% Match
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, app.match_score))}%`, backgroundColor: matchScoreColor(app.match_score) }}
            />
          </div>
        </div>
      )}

      {matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matchedSkills.slice(0, 6).map((skill) => (
            <span key={skill} className="text-[11px] font-medium text-[#0F766E] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {missingSkills.slice(0, 6).map((skill) => (
            <span key={skill} className="text-[11px] font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {app.ai_recommendation && (
        <div className="flex items-start gap-1.5 text-xs text-[#0F172A]">
          <TrendingUp size={13} className="text-[#0F766E] mt-0.5 shrink-0" />
          <span>{app.ai_recommendation}</span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-sm py-1">
      <Icon size={15} className="text-[#94A3B8] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-[#475569]">{label}: </span>
        <span className="text-[#0F172A] font-medium break-words">{value}</span>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED STATES
   ============================================================ */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-[#F8FAFC] animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-14 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <Users className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A]">{hasFilters ? 'No matching candidates' : 'No Candidates Yet'}</h3>
      <p className="text-sm text-[#475569] max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to see more results.'
          : 'Candidates will appear here after registration.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F766E] bg-[#0F766E]/5 hover:bg-[#0F766E]/10 rounded-xl transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-white rounded-3xl border border-[#EF4444]/20 shadow-sm py-14 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/5 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
        <FileWarning className="w-7 h-7" />
      </div>
      <p className="text-sm font-medium text-[#EF4444] max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}
