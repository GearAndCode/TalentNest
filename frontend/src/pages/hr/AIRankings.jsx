import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from "../../services/api";
import {
LayoutDashboard,
Briefcase,
Users,
FileCheck,
FileText,
BrainCircuit,
Award,
BarChart3,
Settings,
Search,
Bell,
LogOut,
ChevronLeft,
ChevronRight,
Menu,
RefreshCw,
Eye,
UserCheck,
Trophy,
ChevronDown,
Sparkles,
X,
ExternalLink,
Percent,
CheckCircle2,
XCircle,
AlertCircle,
UserCircle
} from 'lucide-react';
import {
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell,
Legend
} from 'recharts';

/* ============================================================
BRAND ASSET — identical to the one used on HRDashboard.
Kept in sync so every HR page renders the same mark.
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
NAV ITEMS — identical set/order/paths to HRDashboard so the
active state lines up across every HR page.
============================================================ */
const NAV_ITEMS = [
{ label: 'Dashboard', icon: LayoutDashboard, path: '/hr-dashboard' },
{ label: 'Jobs', icon: Briefcase, path: '/jobs' },
{ label: 'Applications', icon: FileText, path: '/applications' },
{ label: 'Candidates', icon: Users, path: '/candidates' },
{ label: 'AI Analysis', icon: BrainCircuit, path: '/ai-analysis' },
{ label: 'AI Rankings', icon: Award, path: '/ai-rankings' },
];

// Decode the JWT payload already stored on login (mirrors HRDashboard, display-only).
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

export default function AIRankings() {
const navigate = useNavigate();
const location = useLocation();

// Navigation / Sidebar & Header layout states
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Data States
const [jobs, setJobs] = useState([]);
const [selectedJobId, setSelectedJobId] = useState('ALL');
const [candidates, setCandidates] = useState([]);
const [applications, setApplications] = useState([]);
const [dashboardStats, setDashboardStats] = useState(null);

// UI States
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);

// Filter & Search States
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('ALL');
const [departmentFilter, setDepartmentFilter] = useState('ALL');
const [matchScoreFilter, setMatchScoreFilter] = useState('ALL');
const [experienceFilter, setExperienceFilter] = useState('ALL');
const [sortBy, setSortBy] = useState('highest_match');

// Modal States
const [candidateModal, setCandidateModal] = useState({ isOpen: false, data: null });
const [aiModal, setAiModal] = useState({ isOpen: false, data: null });
const [highlightedCandidateId, setHighlightedCandidateId] = useState(null);

// Base API URL
const API_BASE = API_BASE_URL;
// Authenticate every HR request with the logged-in company's JWT.
// The backend uses company_id from the signed token for tenant isolation.
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// Display-only identity for the top navbar (mirrors HRDashboard; no new API calls)
const hrIdentity = useMemo(() => {
const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
const payload = token ? decodeJwtPayload(token) : null;
const email = payload?.email || (typeof window !== 'undefined' ? localStorage.getItem('hr_email') : '') || '';
const namePart = email.includes('@') ? email.split('@')[0] : email;
const displayName = namePart
? namePart
.replace(/[._-]+/g, ' ')
.split(' ')
.filter(Boolean)
.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
.join(' ')
: 'HR Manager';
return { email, displayName };
}, []);

// Fetch all initial data
const fetchData = async (isManualRefresh = false) => {
if (isManualRefresh) setRefreshing(true);
else setLoading(true);
setError(null);

try {
const [jobsRes, candidatesRes, applicationsRes, dashRes] = await Promise.all([
api.get('/jobs/').catch(() => ({ data: [] })),
api.get('/candidates/').catch(() => ({ data: [] })),
api.get('/applications/').catch(() => ({ data: [] })),
api.get('/dashboard/stats').catch(() => ({ data: null }))
]);

setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
setCandidates(Array.isArray(candidatesRes.data) ? candidatesRes.data : []);
setApplications(Array.isArray(applicationsRes.data) ? applicationsRes.data : []);
setDashboardStats(dashRes.data);
} catch (err) {
console.error('Error loading AI Rankings data:', err);
setError('Failed to load ranking data. Please check your network or server connection.');
} finally {
setLoading(false);
setRefreshing(false);
}
};

useEffect(() => {
fetchData();
}, []);

// Map and sort rankings strictly per job application
const rankedItems = useMemo(() => {
if (!applications || !applications.length) return [];

const jobMap = new Map((jobs || []).map(j => [j.id, j]));
const candidateMap = new Map((candidates || []).map(c => [c.id, c]));

const items = applications.map(app => {
const job = jobMap.get(app.job_id) || {};
const candidate = candidateMap.get(app.candidate_id) || {};

const matchScore = typeof app.match_score === 'number' ? app.match_score : 0;
const matchedSkills = Array.isArray(app.matched_skills)
? app.matched_skills
: (app.matched_skills ? String(app.matched_skills).split(',') : []);
const missingSkills = Array.isArray(app.missing_skills)
? app.missing_skills
: (app.missing_skills ? String(app.missing_skills).split(',') : []);

return {
...app,
jobTitle: job.title || app.job_title || 'Unknown Job',
department: job.department || app.department || 'General',
candidateName: candidate.full_name || candidate.name || app.candidate_name || 'Anonymous',
candidateEmail: candidate.email || app.candidate_email || 'N/A',
candidatePhone: candidate.phone || app.phone || 'N/A',
candidateEducation: candidate.education || app.education || 'N/A',
candidateExperience: candidate.experience || app.experience || 'N/A',
candidateSkills: Array.isArray(candidate.skills) ? candidate.skills : (candidate.skills ? [candidate.skills] : []),
resumeUrl: candidate.resume_url || app.resume_url || null,
matchScore,
matchedSkills,
missingSkills,
aiRecommendation: app.ai_recommendation || app.recommendation || 'Needs Review',
currentStatus: app.status || 'Pending',
created_at: app.created_at || new Date().toISOString()
};
});

let filtered = items;
if (selectedJobId !== 'ALL') {
filtered = filtered.filter(item => String(item.job_id) === String(selectedJobId));
}

if (searchQuery.trim()) {
const q = searchQuery.toLowerCase().trim();
filtered = filtered.filter(item =>
item.candidateName.toLowerCase().includes(q) ||
item.candidateEmail.toLowerCase().includes(q) ||
item.matchedSkills.some(s => String(s).toLowerCase().includes(q)) ||
item.missingSkills.some(s => String(s).toLowerCase().includes(q))
);
}

if (statusFilter !== 'ALL') {
filtered = filtered.filter(item => item.currentStatus.toLowerCase() === statusFilter.toLowerCase());
}

if (departmentFilter !== 'ALL') {
filtered = filtered.filter(item => item.department.toLowerCase() === departmentFilter.toLowerCase());
}

if (matchScoreFilter === '90+') {
filtered = filtered.filter(item => item.matchScore >= 90);
} else if (matchScoreFilter === '75-89') {
filtered = filtered.filter(item => item.matchScore >= 75 && item.matchScore < 90);
} else if (matchScoreFilter === '50-74') {
filtered = filtered.filter(item => item.matchScore >= 50 && item.matchScore < 75);
} else if (matchScoreFilter === '<50') {
filtered = filtered.filter(item => item.matchScore < 50);
}

if (experienceFilter !== 'ALL') {
filtered = filtered.filter(item =>
String(item.candidateExperience).toLowerCase().includes(experienceFilter.toLowerCase())
);
}

filtered.sort((a, b) => {
if (sortBy === 'highest_match') {
if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
return new Date(b.created_at) - new Date(a.created_at);
} else if (sortBy === 'lowest_match') {
if (a.matchScore !== b.matchScore) return a.matchScore - b.matchScore;
return new Date(a.created_at) - new Date(b.created_at);
} else if (sortBy === 'newest') {
return new Date(b.created_at) - new Date(a.created_at);
} else if (sortBy === 'oldest') {
return new Date(a.created_at) - new Date(b.created_at);
}
return 0;
});

return filtered;
}, [applications, jobs, candidates, selectedJobId, searchQuery, statusFilter, departmentFilter, matchScoreFilter, experienceFilter, sortBy]);

const departmentsList = useMemo(() => {
const set = new Set();
(jobs || []).forEach(j => j.department && set.add(j.department));
return Array.from(set);
}, [jobs]);

const stats = useMemo(() => {
const totalJobsCount = jobs.length;
const totalRanked = rankedItems.length;
let highestCandidate = 'N/A';
let highestScore = -1;
let totalScoreSum = 0;

rankedItems.forEach(item => {
totalScoreSum += item.matchScore;
if (item.matchScore > highestScore) {
highestScore = item.matchScore;
highestCandidate = item.candidateName;
}
});

const avgScore = totalRanked > 0 ? Math.round(totalScoreSum / totalRanked) : 0;

return {
totalJobs: totalJobsCount,
totalRankedCandidates: totalRanked,
highestMatchCandidate: highestCandidate !== 'N/A' ? `${highestCandidate} (${highestScore}%)` : 'N/A',
avgMatchScore: `${avgScore}%`
};
}, [jobs, rankedItems]);

const top10ChartData = useMemo(() => {
return rankedItems.slice(0, 10).map(item => ({
name: item.candidateName.length > 12 ? item.candidateName.substring(0, 10) + '..' : item.candidateName,
score: item.matchScore
}));
}, [rankedItems]);

const avgMatchPerJobData = useMemo(() => {
const jobScores = {};
(applications || []).forEach(app => {
const j = (jobs || []).find(job => job.id === app.job_id);
const title = j ? (j.title.length > 12 ? j.title.substring(0, 10) + '..' : j.title) : 'Job ' + app.job_id;
if (!jobScores[title]) jobScores[title] = { total: 0, count: 0 };
jobScores[title].total += (app.match_score || 0);
jobScores[title].count += 1;
});

return Object.keys(jobScores).map(title => ({
title,
avg: Math.round(jobScores[title].total / jobScores[title].count)
}));
}, [applications, jobs]);

const recommendationDistribution = useMemo(() => {
const dist = { 'Recommended': 0, 'Strong Match': 0, 'Needs Review': 0, 'Not Suitable': 0 };
rankedItems.forEach(item => {
const rec = item.aiRecommendation || 'Needs Review';
if (dist[rec] !== undefined) dist[rec]++;
else dist['Needs Review']++;
});
return Object.keys(dist).map(key => ({ name: key, value: dist[key] })).filter(d => d.value > 0);
}, [rankedItems]);

const statusDistribution = useMemo(() => {
const dist = {};
rankedItems.forEach(item => {
const st = item.currentStatus || 'Pending';
dist[st] = (dist[st] || 0) + 1;
});
return Object.keys(dist).map(key => ({ name: key, value: dist[key] }));
}, [rankedItems]);

const getMatchScoreColor = (score) => {
if (score >= 90) return { text: 'text-[#0F766E] font-bold', bg: 'bg-[#0F766E]/5 border-[#0F766E]/20', stroke: '#0F766E' };
if (score >= 75) return { text: 'text-[#14B8A6] font-bold', bg: 'bg-[#14B8A6]/5 border-[#14B8A6]/20', stroke: '#14B8A6' };
if (score >= 50) return { text: 'text-[#D97706] font-bold', bg: 'bg-amber-50 border-amber-200', stroke: '#D97706' };
return { text: 'text-[#EF4444] font-bold', bg: 'bg-red-50 border-red-200', stroke: '#EF4444' };
};

const getRecommendationBadge = (rec) => {
switch (rec) {
case 'Recommended':
case 'Strong Match':
return 'bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/20';
case 'Needs Review':
case 'Reviewed':
return 'bg-amber-50 text-amber-700 border-amber-200';
case 'Not Suitable':
return 'bg-red-50 text-red-700 border-red-200';
default:
return 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]';
}
};

const getStatusBadge = (status) => {
switch (status) {
case 'Accepted':
case 'Hired':
return 'bg-[#0F766E]/10 text-[#0F766E]';
case 'Interview Scheduled':
case 'Offer Sent':
return 'bg-[#14B8A6]/10 text-[#0F766E]';
case 'Pending':
return 'bg-amber-100 text-amber-800';
case 'Rejected':
return 'bg-red-100 text-red-800';
default:
return 'bg-[#F8FAFC] text-[#475569]';
}
};

const PIE_COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#EF4444', '#64748B', '#0EA5E9'];

const isActivePath = (path) => location.pathname === path || (path === '/ai-rankings');
const handleNav = (path) => {
navigate(path);
setIsMobileMenuOpen(false);
};
const handleLogout = () => navigate('/hr-login');

return (
<div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-white flex">
{/* Mobile sidebar overlay */}
<AnimatePresence>
{isMobileMenuOpen && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={() => setIsMobileMenuOpen(false)}
className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40 lg:hidden"
/>
)}
</AnimatePresence>

<MobileSidebar
open={isMobileMenuOpen}
onClose={() => setIsMobileMenuOpen(false)}
isActivePath={isActivePath}
handleNav={handleNav}
onLogout={handleLogout}
/>

<Sidebar
collapsed={isSidebarCollapsed}
setCollapsed={setIsSidebarCollapsed}
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
onMenuClick={() => setIsMobileMenuOpen(true)}
onLogout={handleLogout}
/>

<main className="flex-1 overflow-y-auto">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
<Trophy className="text-[#0F766E] h-6 w-6" />
AI Rankings
</h1>
<p className="mt-1 text-sm sm:text-base text-[#475569]">
View AI-ranked candidates for every job opening.
</p>
</div>

<button
onClick={() => fetchData(true)}
disabled={refreshing}
className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0F766E] hover:bg-[#0D9488] active:bg-[#0F5B54] rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 w-fit"
>
<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
<span>Refresh Rankings</span>
</button>
</div>

{/* Statistics Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
<StatCard label="Total Jobs" value={stats.totalJobs} icon={Briefcase} />
<StatCard label="Total Ranked Candidates" value={stats.totalRankedCandidates} icon={Users} />
<StatCard label="Highest Match Candidate" value={stats.highestMatchCandidate} icon={Award} isText />
<StatCard label="Average Match Score" value={stats.avgMatchScore} icon={Percent} isText />
</div>

{/* Job Selection Card */}
<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-4">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="flex-1 max-w-xl">
<label className="block text-xs font-semibold text-[#475569] mb-1.5">
Select Job Opening
</label>
<div className="relative">
<select
value={selectedJobId}
onChange={(e) => setSelectedJobId(e.target.value)}
className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="ALL">All Active Job Openings ({jobs.length})</option>
{jobs.map((job) => (
<option key={job.id} value={job.id}>
{job.title} - {job.department || 'General'}
</option>
))}
</select>
<ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
</div>
</div>

<div className="flex items-center gap-2 self-end text-xs text-[#475569]">
<Sparkles size={15} className="text-[#0F766E]" />
<span>Showing candidates strictly for selected position</span>
</div>
</div>
</div>

{/* Filters Bar */}
<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
<div>
<label className="block text-xs font-semibold text-[#475569] mb-1">Status</label>
<select
value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value)}
className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="ALL">All Statuses</option>
<option value="Pending">Pending</option>
<option value="Interview Scheduled">Interview Scheduled</option>
<option value="Accepted">Accepted</option>
<option value="Rejected">Rejected</option>
<option value="Hired">Hired</option>
<option value="Offer Sent">Offer Sent</option>
</select>
</div>

<div>
<label className="block text-xs font-semibold text-[#475569] mb-1">Department</label>
<select
value={departmentFilter}
onChange={(e) => setDepartmentFilter(e.target.value)}
className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="ALL">All Departments</option>
{departmentsList.map((dept) => (
<option key={dept} value={dept}>{dept}</option>
))}
</select>
</div>

<div>
<label className="block text-xs font-semibold text-[#475569] mb-1">Match Score</label>
<select
value={matchScoreFilter}
onChange={(e) => setMatchScoreFilter(e.target.value)}
className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="ALL">All Scores</option>
<option value="90+">90%+ (Gold)</option>
<option value="75-89">75% - 89%</option>
<option value="50-74">50% - 74%</option>
<option value="<50">Below 50%</option>
</select>
</div>

<div>
<label className="block text-xs font-semibold text-[#475569] mb-1">Experience Level</label>
<select
value={experienceFilter}
onChange={(e) => setExperienceFilter(e.target.value)}
className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="ALL">All Experience</option>
<option value="Senior">Senior</option>
<option value="Mid">Mid Level</option>
<option value="Junior">Junior</option>
</select>
</div>

<div>
<label className="block text-xs font-semibold text-[#475569] mb-1">Sort By</label>
<select
value={sortBy}
onChange={(e) => setSortBy(e.target.value)}
className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
>
<option value="highest_match">Highest Match</option>
<option value="lowest_match">Lowest Match</option>
<option value="newest">Newest</option>
<option value="oldest">Oldest</option>
</select>
</div>
</div>
</div>

{/* Ranking Table */}
{loading ? (
<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-4">
<div className="h-6 bg-[#F8FAFC] rounded w-1/4 mb-6 animate-pulse"></div>
{[1, 2, 3, 4, 5].map((n) => (
<div key={n} className="h-12 bg-[#F8FAFC] rounded-xl w-full animate-pulse"></div>
))}
</div>
) : error ? (
<div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[20px] p-8 text-center space-y-3">
<div className="w-12 h-12 rounded-2xl bg-white border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mx-auto">
<AlertCircle size={22} />
</div>
<h3 className="text-base font-bold text-[#EF4444]">Error Loading Data</h3>
<p className="text-sm text-[#475569] max-w-md mx-auto">{error}</p>
<button
onClick={() => fetchData()}
className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold rounded-xl shadow transition"
>
<RefreshCw size={14} />
Retry
</button>
</div>
) : rankedItems.length === 0 ? (
<div className="bg-white p-12 rounded-[20px] border border-[#E2E8F0] shadow-sm text-center space-y-3">
<div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] mx-auto">
<Users size={22} />
</div>
<h3 className="text-base font-bold text-[#0F172A]">No ranked candidates available.</h3>
<p className="text-[#475569] text-sm max-w-sm mx-auto">
There are no candidates matching your active filters or applied to the selected job opening.
</p>
</div>
) : (
<div className="bg-white rounded-[20px] border border-[#E2E8F0] shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse text-sm">
<thead>
<tr className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]">
<th className="px-6 py-3 text-center">Rank</th>
<th className="px-6 py-3">Candidate</th>
<th className="px-6 py-3">Email</th>
<th className="px-6 py-3">Applied Job</th>
<th className="px-6 py-3">Department</th>
<th className="px-6 py-3 text-center">Match Score</th>
<th className="px-6 py-3">Matched Skills</th>
<th className="px-6 py-3">Missing Skills</th>
<th className="px-6 py-3">AI Recommendation</th>
<th className="px-6 py-3">Current Status</th>
<th className="px-6 py-3 text-right">Actions</th>
</tr>
</thead>
<tbody>
{rankedItems.map((item, index) => {
const rankNum = index + 1;
const scoreStyle = getMatchScoreColor(item.matchScore);
const isHighlighted = highlightedCandidateId === item.id;

return (
<tr
key={item.id || index}
className={`border-t border-[#E2E8F0] transition-colors duration-150 hover:bg-[#F8FAFC]/60 ${
isHighlighted ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : ''
}`}
>
<td className="px-6 py-4 text-center font-bold text-sm">
{rankNum === 1 ? (
<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
🥇
</span>
) : rankNum === 2 ? (
<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] font-bold text-xs">
🥈
</span>
) : rankNum === 3 ? (
<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/10 text-amber-800 font-bold text-xs">
🥉
</span>
) : (
<span className="text-[#475569]/70 font-medium">#{rankNum}</span>
)}
</td>

<td className="px-6 py-4 font-semibold text-[#0F172A] whitespace-nowrap">
{item.candidateName}
</td>

<td className="px-6 py-4 text-[#475569] whitespace-nowrap">
{item.candidateEmail}
</td>

<td className="px-6 py-4 font-medium text-[#0F172A] whitespace-nowrap">
{item.jobTitle}
</td>

<td className="px-6 py-4 text-[#475569] whitespace-nowrap">
{item.department}
</td>

<td className="px-6 py-4 text-center whitespace-nowrap">
<div className="inline-flex items-center gap-1.5">
<div className="relative w-9 h-9 flex items-center justify-center">
<svg className="w-9 h-9 transform -rotate-90">
<circle
cx="18"
cy="18"
r="14"
stroke="#E2E8F0"
strokeWidth="3"
fill="transparent"
/>
<circle
cx="18"
cy="18"
r="14"
stroke={scoreStyle.stroke}
strokeWidth="3"
strokeDasharray={88}
strokeDashoffset={88 - (88 * item.matchScore) / 100}
strokeLinecap="round"
fill="transparent"
/>
</svg>
<span className={`absolute text-[11px] ${scoreStyle.text}`}>
{item.matchScore}%
</span>
</div>
</div>
</td>

<td className="px-6 py-4 max-w-xs">
<div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
{item.matchedSkills.length > 0 ? (
item.matchedSkills.map((sk, idx) => (
<span
key={idx}
className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0F766E]/10 text-[#0F766E]"
>
{sk}
</span>
))
) : (
<span className="text-[#475569]/60 text-xs">None</span>
)}
</div>
</td>

<td className="px-6 py-4 max-w-xs">
<div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
{item.missingSkills.length > 0 ? (
item.missingSkills.map((sk, idx) => (
<span
key={idx}
className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700"
>
{sk}
</span>
))
) : (
<span className="text-[#475569]/60 text-xs">None</span>
)}
</div>
</td>

<td className="px-6 py-4 whitespace-nowrap">
<span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRecommendationBadge(item.aiRecommendation)}`}>
{item.aiRecommendation}
</span>
</td>

<td className="px-6 py-4 whitespace-nowrap">
<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.currentStatus)}`}>
{item.currentStatus}
</span>
</td>

<td className="px-6 py-4 text-right whitespace-nowrap">
<div className="flex items-center justify-end space-x-1">
<button
onClick={() => setCandidateModal({ isOpen: true, data: item })}
title="View Candidate"
className="w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC] transition-colors"
>
<Eye size={16} />
</button>

<button
onClick={() => setAiModal({ isOpen: true, data: item })}
title="View AI Analysis"
className="w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC] transition-colors"
>
<FileText size={16} />
</button>

<button
onClick={() => navigate(`/candidates?id=${item.candidate_id}`)}
title="Open Candidate Profile"
className="w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC] transition-colors"
>
<UserCheck size={16} />
</button>

<button
onClick={() =>
setHighlightedCandidateId(
highlightedCandidateId === item.id ? null : item.id
)
}
title="Highlight Candidate"
className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
isHighlighted
? 'text-amber-600 bg-amber-100'
: 'text-[#475569] hover:text-amber-600 hover:bg-[#F8FAFC]'
}`}
>
<Trophy size={16} />
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
)}

{/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
<div className="mb-4">
<h3 className="text-base font-bold text-[#0F172A]">Top 10 Ranked Candidates</h3>
<p className="text-xs text-[#475569] mt-0.5">Highest AI match scores across all applications</p>
</div>
<div className="h-64 w-full">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={top10ChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
<XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
<YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} width={85} tickLine={false} axisLine={false} />
<Tooltip
cursor={{ fill: '#F8FAFC' }}
contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
formatter={(val) => [`${val}%`, 'Match Score']}
/>
<Bar dataKey="score" fill="#0F766E" radius={[0, 8, 8, 0]} maxBarSize={22} />
</BarChart>
</ResponsiveContainer>
</div>
</div>

<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
<div className="mb-4">
<h3 className="text-base font-bold text-[#0F172A]">Average Match Score Per Job</h3>
<p className="text-xs text-[#475569] mt-0.5">AI match average grouped by job opening</p>
</div>
<div className="h-64 w-full">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={avgMatchPerJobData} margin={{ top: 5, right: 20, left: -12, bottom: 5 }}>
<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
<XAxis dataKey="title" stroke="#475569" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
<YAxis domain={[0, 100]} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
<Tooltip
cursor={{ fill: '#F8FAFC' }}
contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
formatter={(val) => [`${val}%`, 'Avg Match Score']}
/>
<Bar dataKey="avg" fill="#14B8A6" radius={[8, 8, 0, 0]} maxBarSize={48} />
</BarChart>
</ResponsiveContainer>
</div>
</div>

<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
<div className="mb-4">
<h3 className="text-base font-bold text-[#0F172A]">Recommendation Distribution</h3>
<p className="text-xs text-[#475569] mt-0.5">Share of candidates by AI recommendation</p>
</div>
<div className="h-64 w-full">
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie
data={recommendationDistribution}
cx="50%"
cy="50%"
innerRadius={55}
outerRadius={80}
paddingAngle={4}
dataKey="value"
>
{recommendationDistribution.map((entry, index) => (
<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
))}
</Pie>
<Tooltip
contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
/>
<Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
</PieChart>
</ResponsiveContainer>
</div>
</div>

<div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
<div className="mb-4">
<h3 className="text-base font-bold text-[#0F172A]">Status Distribution</h3>
<p className="text-xs text-[#475569] mt-0.5">Applications grouped by current pipeline status</p>
</div>
<div className="h-64 w-full">
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie
data={statusDistribution}
cx="50%"
cy="50%"
outerRadius={80}
dataKey="value"
>
{statusDistribution.map((entry, index) => (
<Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 1) % PIE_COLORS.length]} />
))}
</Pie>
<Tooltip
contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
/>
<Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
</PieChart>
</ResponsiveContainer>
</div>
</div>
</div>
</div>
</main>
</div>

{/* Candidate Profile Modal */}
<AnimatePresence>
{candidateModal.isOpen && candidateModal.data && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm">
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
className="bg-white rounded-[20px] shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative border border-[#E2E8F0]"
>
<button
onClick={() => setCandidateModal({ isOpen: false, data: null })}
className="absolute top-5 right-5 p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
>
<X size={18} />
</button>

<div className="flex items-center space-x-4 border-b border-[#E2E8F0] pb-4">
<div className="h-12 w-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] flex items-center justify-center font-bold text-lg">
{candidateModal.data.candidateName.charAt(0)}
</div>
<div>
<h2 className="text-xl font-bold text-[#0F172A]">{candidateModal.data.candidateName}</h2>
<p className="text-[#475569] text-xs">{candidateModal.data.candidateEmail} • {candidateModal.data.candidatePhone}</p>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
<div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-0.5">
<span className="text-xs font-medium text-[#475569]">Education</span>
<p className="font-semibold text-[#0F172A]">{candidateModal.data.candidateEducation}</p>
</div>

<div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-0.5">
<span className="text-xs font-medium text-[#475569]">Experience</span>
<p className="font-semibold text-[#0F172A]">{candidateModal.data.candidateExperience}</p>
</div>

<div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-0.5">
<span className="text-xs font-medium text-[#475569]">Application Status</span>
<div>
<span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(candidateModal.data.currentStatus)}`}>
{candidateModal.data.currentStatus}
</span>
</div>
</div>

<div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-0.5">
<span className="text-xs font-medium text-[#475569]">AI Recommendation</span>
<div>
<span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRecommendationBadge(candidateModal.data.aiRecommendation)}`}>
{candidateModal.data.aiRecommendation}
</span>
</div>
</div>
</div>

<div className="space-y-1.5">
<span className="text-xs font-semibold uppercase text-[#475569]">Matched Skills</span>
<div className="flex flex-wrap gap-1.5">
{candidateModal.data.matchedSkills.map((sk, i) => (
<span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#0F766E]/10 text-[#0F766E]">
{sk}
</span>
))}
</div>
</div>

<div className="space-y-1.5">
<span className="text-xs font-semibold uppercase text-[#475569]">Missing Skills</span>
<div className="flex flex-wrap gap-1.5">
{candidateModal.data.missingSkills.map((sk, i) => (
<span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
{sk}
</span>
))}
</div>
</div>

<div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
{candidateModal.data.resumeUrl ? (
<a
href={`${API_BASE}${candidateModal.data.resumeUrl.startsWith('/') ? '' : '/'}${candidateModal.data.resumeUrl}`}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-medium text-xs rounded-xl shadow-sm transition"
>
<FileText size={16} />
<span>View Resume (PDF)</span>
<ExternalLink size={14} />
</a>
) : (
<a
href={`${API_BASE}/uploads/resumes/${candidateModal.data.candidate_id}_cv.pdf`}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-medium text-xs rounded-xl shadow-sm transition"
>
<FileText size={16} />
<span>View Resume (PDF)</span>
<ExternalLink size={14} />
</a>
)}
</div>
</motion.div>
</div>
)}
</AnimatePresence>

{/* AI Analysis Modal */}
<AnimatePresence>
{aiModal.isOpen && aiModal.data && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm">
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
className="bg-white rounded-[20px] shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative border border-[#E2E8F0]"
>
<button
onClick={() => setAiModal({ isOpen: false, data: null })}
className="absolute top-5 right-5 p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
>
<X size={18} />
</button>

<div className="flex items-center space-x-2.5 border-b border-[#E2E8F0] pb-3">
<Sparkles className="text-[#0F766E] h-5 w-5" />
<h2 className="text-lg font-bold text-[#0F172A]">AI Evaluation Analysis</h2>
</div>

<div className="flex items-center justify-between p-4 bg-[#0F766E]/5 rounded-xl border border-[#0F766E]/10">
<div>
<p className="text-xs font-semibold text-[#0F766E] uppercase">Overall Match Score</p>
<p className="text-2xl font-bold text-[#0F766E]">{aiModal.data.matchScore}%</p>
</div>
<div>
<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRecommendationBadge(aiModal.data.aiRecommendation)}`}>
{aiModal.data.aiRecommendation}
</span>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div className="p-3 bg-[#0F766E]/5 rounded-xl border border-[#0F766E]/10 space-y-1.5">
<span className="text-xs font-semibold text-[#0F766E] flex items-center gap-1">
<CheckCircle2 size={14} />
Matched Skills & Strengths
</span>
<div className="flex flex-wrap gap-1">
{aiModal.data.matchedSkills.map((sk, i) => (
<span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0F766E]/10 text-[#0F766E]">
{sk}
</span>
))}
</div>
</div>

<div className="p-3 bg-red-50/60 rounded-xl border border-red-100 space-y-1.5">
<span className="text-xs font-semibold text-red-800 flex items-center gap-1">
<XCircle size={14} />
Missing Skills & Weaknesses
</span>
<div className="flex flex-wrap gap-1">
{aiModal.data.missingSkills.map((sk, i) => (
<span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
{sk}
</span>
))}
</div>
</div>
</div>

<div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
<span className="text-xs font-semibold text-[#475569] uppercase">Hiring Decision & Recommendation</span>
<p className="text-xs text-[#475569] leading-relaxed">
Candidate demonstrates a <span className="font-semibold text-[#0F172A]">{aiModal.data.matchScore}%</span> alignment with the requirements for <span className="font-semibold text-[#0F172A]">{aiModal.data.jobTitle}</span>. AI system categorizes this candidate as <span className="font-semibold text-[#0F172A]">{aiModal.data.aiRecommendation}</span>.
</p>
</div>
</motion.div>
</div>
)}
</AnimatePresence>
</div>
);
}

/* ============================================================
STAT CARD — matches HRDashboard's StatCard exactly.
============================================================ */
function StatCard({ label, value, icon: Icon, isText = false }) {
return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
whileHover={{ y: -3 }}
className="group bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 transition-all duration-300"
>
<div className="flex items-start justify-between">
<div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
<Icon className="w-5 h-5" />
</div>
</div>
<p className={`mt-4 font-extrabold text-[#0F172A] tracking-tight ${isText ? 'text-base sm:text-lg truncate' : 'text-2xl sm:text-3xl'}`}>
{value}
</p>
<p className="mt-1 text-xs sm:text-sm font-medium text-[#475569]">{label}</p>
</motion.div>
);
}

/* ============================================================
SIDEBAR (Desktop, collapsible) — identical to HRDashboard.
============================================================ */
function Sidebar({ collapsed, setCollapsed, isActivePath, handleNav, onLogout }) {
return (
<motion.aside
animate={{ width: collapsed ? 84 : 264 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
className="hidden lg:flex flex-col h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r border-[#E2E8F0] z-30 shadow-sm"
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
<div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
<button
onClick={() => handleNav('/hr-dashboard')}
className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1"
>
<div className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
<TalentNestLogo className="w-6 h-6 text-white" />
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
SIDEBAR (Mobile drawer) — identical to HRDashboard.
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
className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-[#E2E8F0] z-50 lg:hidden shadow-xl flex flex-col"
>
<div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
<TalentNestLogo className="w-6 h-6 text-white" />
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
TOP NAVIGATION — identical to HRDashboard.
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
scrolled ? 'bg-white/85 border-[#E2E8F0] shadow-sm' : 'bg-white/70 border-[#E2E8F0]/60'
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
placeholder="Search candidates, skills, emails..."
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
<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0F766E]"></span>
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
className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
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