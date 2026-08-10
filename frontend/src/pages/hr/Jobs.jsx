import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Search, Eye, Pencil, Trash2, X, MapPin, Briefcase, Building2,
  DollarSign, Calendar, GraduationCap, Tag, AlertTriangle, XCircle,
  ChevronDown, RefreshCw, LayoutDashboard, Users, FileText, Award,
  BarChart3, Settings, LogOut, Bell, ChevronLeft, ChevronRight,
  Menu, UserCircle, BrainCircuit,
} from 'lucide-react';

// ==========================================
// AXIOS CLIENT (unchanged — matches existing project config)
// ==========================================
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// CONSTANTS — derived only from what the backend actually accepts
// (JobCreate schema: title, department, category, location, description,
//  salary, employment_type, experience, skills)
// ==========================================
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead'];

const EMPTY_FORM = {
  title: '',
  department: '',
  category: 'Engineering',
  location: '',
  description: '',
  salary: '',
  employment_type: 'Full Time',
  experience: 'Entry Level',
  skills: [],
};

/* ============================================================
   BRAND ASSET — reused exactly from HRDashboard.jsx so the Jobs
   page visually matches the rest of the HR Dashboard.
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

// Decode the JWT payload (same helper as HRDashboard.jsx) so the header
// can show the signed-in HR user's name without adding any new auth logic.
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

/* ============================================================
   NAV ITEMS — identical set/order to HRDashboard.jsx
   ============================================================ */
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/hr-dashboard' },
  { label: 'Jobs', icon: Briefcase, path: '/jobs' },
  { label: 'Applications', icon: FileText, path: '/applications' },
  { label: 'Candidates', icon: Users, path: '/candidates' },
  { label: 'AI Analysis', icon: BrainCircuit, path: '/ai-analysis' },
  { label: 'AI Rankings', icon: Award, path: '/ai-rankings' },

];

// ==========================================
// PAGE SHELL — reuses the exact Sidebar + TopNavbar from HRDashboard.jsx
// ==========================================
export default function Jobs() {
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
    toast.success('Logged out successfully');
    navigate('/hr-login');
  }, [navigate]);

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

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto h-full">
            <JobsContent />
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

// ==========================================
// JOBS CONTENT (existing Create/View/Edit/Delete logic — UNCHANGED)
// ==========================================
function JobsContent() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [viewingJob, setViewingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);

  // ---------------- FETCH JOBS ----------------
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = keyword.trim() || departmentFilter.trim() || locationFilter.trim();
      const res = hasFilters
        ? await api.get('/jobs/search', {
            params: {
              keyword: keyword.trim() || undefined,
              department: departmentFilter.trim() || undefined,
              location: locationFilter.trim() || undefined,
            },
          })
        : await api.get('/jobs/');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Check your backend connection.'
          : 'Failed to load jobs.')
      );
    } finally {
      setLoading(false);
    }
  }, [keyword, departmentFilter, locationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // ---------------- DERIVED FILTER OPTIONS ----------------
  const departmentOptions = useMemo(
    () => [...new Set(jobs.map((j) => j.department).filter(Boolean))],
    [jobs]
  );
  const locationOptions = useMemo(
    () => [...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );

  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    switch (sortBy) {
      case 'oldest':
        return list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      case 'az':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  }, [jobs, sortBy]);

  // ---------------- CREATE / EDIT ----------------
  const openCreateForm = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    setEditingJob(null);
    fetchJobs();
  };

  // ---------------- DELETE ----------------
  const confirmDelete = async () => {
    if (!deletingJob) return;
    try {
      await api.delete(`/jobs/${deletingJob.id}`);
      toast.success('Job deleted successfully');
      setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
      setDeletingJob(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete job');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' } }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Jobs</h1>
          <p className="text-xs text-slate-400 mt-1">Manage every open position in your company.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-semibold shadow-lg shadow-teal-700/20 hover:shadow-teal-700/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          <span className="text-sm">Create Job</span>
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#14B8A6] transition"
          />
        </div>

        <FilterSelect
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departmentOptions}
          placeholder="All Departments"
        />
        <FilterSelect
          value={locationFilter}
          onChange={setLocationFilter}
          options={locationOptions}
          placeholder="All Locations"
        />
        <FilterSelect
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'az', label: 'Alphabetical' },
          ]}
          placeholder="Sort By"
          raw
        />
      </div>

      {/* Table / States */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : sortedJobs.length === 0 ? (
        <EmptyState onCreate={openCreateForm} />
      ) : (
        <JobsTable
          jobs={sortedJobs}
          onView={setViewingJob}
          onEdit={openEditForm}
          onDelete={setDeletingJob}
        />
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <JobFormModal
            job={editingJob}
            api={api}
            onClose={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* View Drawer */}
      <AnimatePresence>
        {viewingJob && (
          <JobViewDrawer job={viewingJob} onClose={() => setViewingJob(null)} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingJob && (
          <DeleteConfirmModal
            job={deletingJob}
            onCancel={() => setDeletingJob(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// FILTER SELECT
// ==========================================
function FilterSelect({ value, onChange, options, placeholder, raw }) {
  return (
    <div className="relative w-full lg:w-48">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-[#14B8A6] transition cursor-pointer"
      >
        {!raw && <option value="">{placeholder}</option>}
        {raw
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ==========================================
// JOBS TABLE
// ==========================================
function JobsTable({ jobs, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Job Title</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Location</th>
              <th className="py-4 px-6">Employment Type</th>
              <th className="py-4 px-6">Salary</th>
              <th className="py-4 px-6">Experience</th>
              <th className="py-4 px-6">Created</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {jobs.map((job, idx) => (
              <tr
                key={job.id}
                className={`hover:bg-teal-50/40 transition group ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}
              >
                <td className="py-4 px-6">
                  <p className="font-semibold text-slate-800">{job.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{job.category || 'General'}</p>
                </td>
                <td className="py-4 px-6 text-slate-600">{job.department || '—'}</td>
                <td className="py-4 px-6 text-slate-600">{job.location || '—'}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-bold">
                    {job.employment_type || '—'}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600">
                  {job.salary != null ? `$${Number(job.salary).toLocaleString()}` : '—'}
                </td>
                <td className="py-4 px-6 text-slate-600">{job.experience || '—'}</td>
                <td className="py-4 px-6 text-xs text-slate-400">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="py-4 px-6">
                  {/* Always visible now — previously these used opacity-0 group-hover:opacity-100,
                      which hid the icons until the row was hovered. That's what made it look like
                      "nothing is there" even though the click handlers worked. */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(job)}
                      title="View Job"
                      aria-label="View Job"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 bg-white hover:text-[#0F766E] hover:bg-teal-50 hover:border-teal-200 active:scale-95 shadow-sm transition-all duration-150"
                    >
                      <Eye size={16} strokeWidth={2.25} />
                    </button>
                    <button
                      onClick={() => onEdit(job)}
                      title="Edit Job"
                      aria-label="Edit Job"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 bg-white hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 active:scale-95 shadow-sm transition-all duration-150"
                    >
                      <Pencil size={16} strokeWidth={2.25} />
                    </button>
                    <button
                      onClick={() => onDelete(job)}
                      title="Delete Job"
                      aria-label="Delete Job"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 bg-white hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 active:scale-95 shadow-sm transition-all duration-150"
                    >
                      <Trash2 size={16} strokeWidth={2.25} />
                    </button>
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

// ==========================================
// CREATE / EDIT MODAL
// ==========================================
function JobFormModal({ job, api, onClose, onSaved }) {
  const isEditing = Boolean(job);
  const [formData, setFormData] = useState(() =>
    job
      ? {
          title: job.title || '',
          department: job.department || '',
          category: job.category || 'Engineering',
          location: job.location || '',
          description: job.description || '',
          salary: job.salary ?? '',
          employment_type: job.employment_type || 'Full Time',
          experience: job.experience || 'Entry Level',
          skills: Array.isArray(job.skills) ? job.skills : [],
        }
      : EMPTY_FORM
  );
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !formData.skills.includes(val)) {
      update('skills', [...formData.skills, val]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    update('skills', formData.skills.filter((s) => s !== skill));
  };

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = 'Job title is required';
    if (!formData.department.trim()) next.department = 'Department is required';
    if (!formData.location.trim()) next.location = 'Location is required';
    if (!formData.description.trim()) next.description = 'Description is required';
    if (formData.salary === '' || Number.isNaN(Number(formData.salary))) {
      next.salary = 'A valid salary is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      category: formData.category.trim() || 'Engineering',
      location: formData.location.trim(),
      description: formData.description.trim(),
      salary: Number(formData.salary),
      employment_type: formData.employment_type,
      experience: formData.experience,
      skills: formData.skills,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/jobs/${job.id}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs/create', payload);
        toast.success('Job created successfully');
      }
      onSaved();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSubmitError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : 'Failed to save job. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Edit Job' : 'Create Job'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
              {submitError}
            </div>
          )}

          <FormField label="Job Title" error={errors.title} required>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => update('title', e.target.value)}
              className={inputClass(errors.title)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Department" error={errors.department} required>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => update('department', e.target.value)}
                className={inputClass(errors.department)}
                placeholder="e.g. Engineering"
              />
            </FormField>
            <FormField label="Category">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => update('category', e.target.value)}
                className={inputClass()}
                placeholder="e.g. Engineering"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Location" error={errors.location} required>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass(errors.location)}
                placeholder="e.g. Lahore, PK (Remote)"
              />
            </FormField>
            <FormField label="Salary" error={errors.salary} required>
              <input
                type="number"
                min="0"
                value={formData.salary}
                onChange={(e) => update('salary', e.target.value)}
                className={inputClass(errors.salary)}
                placeholder="e.g. 90000"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employment Type">
              <select
                value={formData.employment_type}
                onChange={(e) => update('employment_type', e.target.value)}
                className={inputClass()}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Experience">
              <select
                value={formData.experience}
                onChange={(e) => update('experience', e.target.value)}
                className={inputClass()}
              >
                {EXPERIENCE_LEVELS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Description" error={errors.description} required>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              className={inputClass(errors.description)}
              placeholder="Role overview, responsibilities, requirements..."
            />
          </FormField>

          <FormField label="Skills">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className={inputClass()}
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-[#0F766E] text-xs font-bold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-rose-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-slate-600 font-semibold hover:bg-slate-100 text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-semibold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <RefreshCw size={14} className="animate-spin" />}
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Job'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormField({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-600 font-medium mt-1">{error}</p>}
    </div>
  );
}

function inputClass(error) {
  return `w-full px-4 py-2.5 rounded-2xl bg-slate-50 border text-sm focus:outline-none transition ${
    error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#14B8A6]'
  }`;
}

// ==========================================
// VIEW DRAWER
// ==========================================
function JobViewDrawer({ job, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-sm flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-200"
      >
        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Details</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{job.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{job.category || 'General'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoChip icon={Building2} label="Department" value={job.department} />
            <InfoChip icon={MapPin} label="Location" value={job.location} />
            <InfoChip icon={Briefcase} label="Employment Type" value={job.employment_type} />
            <InfoChip icon={GraduationCap} label="Experience" value={job.experience} />
            <InfoChip
              icon={DollarSign}
              label="Salary"
              value={job.salary != null ? `$${Number(job.salary).toLocaleString()}` : '—'}
            />
            <InfoChip
              icon={Calendar}
              label="Created"
              value={job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
            />
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl">
              {job.description || 'No description provided.'}
            </p>
          </div>

          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={12} /> Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-teal-50 text-[#0F766E] text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

// ==========================================
// DELETE CONFIRMATION MODAL
// ==========================================
function DeleteConfirmModal({ job, onCancel, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-5 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Trash2 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Delete this job?</h3>
          <p className="text-sm text-slate-500 mt-1">
            "{job.title}" will be permanently removed. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-2xl text-slate-600 font-semibold hover:bg-slate-100 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-semibold text-sm shadow-md hover:bg-rose-700 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// EMPTY / LOADING / ERROR STATES
// ==========================================
function EmptyState({ onCreate }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
        <Briefcase size={26} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">No jobs found</h3>
      </div>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-semibold text-sm shadow-md hover:shadow-lg transition"
      >
        <Plus size={16} />
        Create Job
      </button>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-2xl" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <XCircle size={24} />
      </div>
      <div>
        <h3 className="text-base font-bold text-rose-900">Couldn't Load Jobs</h3>
        <p className="text-xs text-rose-700 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-2xl bg-rose-600 text-white font-semibold text-xs shadow-md hover:bg-rose-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}
