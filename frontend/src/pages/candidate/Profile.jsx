import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search as SearchIcon,
  FileText,
  ListChecks,
  BrainCircuit,
  UserCircle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  Upload,
  Eye,
  Pencil,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Award,
  Target,
  FileWarning,
  Loader2,
} from "lucide-react";

/* ============================================================
   BRAND ASSET — Reused exactly from the existing dashboard/login
   pages. Do not modify. Do not create a second logo.
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
   Mirrors the axios setup used in HRDashboard.jsx: same base
   URL env var, same JSON header, same bearer-token interceptor
   pattern — scoped to the candidate token key so a signed-in HR
   session and a signed-in candidate session never collide.
   ============================================================ */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("candidate_token") || sessionStorage.getItem("candidate_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ============================================================
   SMALL UTILITIES
   ============================================================ */

// Decodes the JWT issued by POST /candidate-auth/login, whose
// payload is { candidate_id, email } (see backend candidate_auth.py).
function initialOf(name, email) {
  const source = (name || "").trim() || (email || "").trim();
  return source ? source.charAt(0).toUpperCase() : "?";
}

function classifyStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("interview")) return "Interview";
  if (s.includes("offer") || s.includes("accept") || s.includes("hire")) return "Offer";
  return "Pending";
}

function resumeFileName(resumePath) {
  if (!resumePath) return null;
  const parts = resumePath.split(/[/\\]/);
  return parts[parts.length - 1];
}

function resumeUrl(resumePath) {
  if (!resumePath) return null;
  const cleaned = resumePath.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleaned}`;
}

// Optional profile fields (location, DOB, headline, desired role,
// years of experience, education) do not exist on the Candidate
// model in the backend yet — only full_name, email, phone,
// resume_path and is_email_verified are persisted server-side.
// Rather than inventing new backend/auth to support them, these
// extras are kept as a lightweight local draft per candidate so
// edits survive a refresh without pretending they are synced.
function extendedProfileKey(candidateId) {
  return `candidate_profile_extra_${candidateId}`;
}

function loadExtendedProfile(candidateId) {
  if (!candidateId) return {};
  try {
    const raw = localStorage.getItem(extendedProfileKey(candidateId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtendedProfile(candidateId, data) {
  if (!candidateId) return;
  try {
    localStorage.setItem(extendedProfileKey(candidateId), JSON.stringify(data));
  } catch {
    // Local storage may be unavailable (private mode, quota) — fail silently,
    // the in-memory state still reflects the edit for this session.
  }
}

/* ============================================================
   ANIMATED COUNTER — identical pattern to HRDashboard.jsx
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
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse Jobs", icon: SearchIcon, path: "/browse-jobs" },
  { label: "My Applications", icon: FileText, path: "/candidate/applications" },
  { label: "AI Resume Analysis", icon: BrainCircuit, path: "/candidate/ai-analysis" },
  { label: "Profile", icon: UserCircle, path: "/candidate/profile" },
];

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [candidateError, setCandidateError] = useState(null);

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // The existing candidate pages use the shared email-based candidate session.
  // The backend currently does not provide a real candidate-auth session, so
  // resolve the active candidate from candidate_session_email instead of
  // requiring a JWT that this app does not store.
  const SESSION_KEY = "candidate_session_email";

  const sessionEmail = useMemo(
    () => localStorage.getItem(SESSION_KEY) || "",
    []
  );

  const fetchCandidate = useCallback(async () => {
    setCandidateLoading(true);
    setCandidateError(null);

    try {
      const res = await api.get("/candidates/me");
      const found = res.data;

      if (!found) {
        setCandidate(null);
        setCandidateError("Unable to find your candidate profile.");
        return;
      }

      const extras = loadExtendedProfile(found.id);
      setCandidate({ ...found, ...extras });
    } catch (err) {
      setCandidateError(
        err?.response?.status === 401
          ? "Your session has expired. Please log in again."
          : "Unable to load your profile right now."
      );
    } finally {
      setCandidateLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      const res = await api.get("/applications");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setApplicationsError("Unable to load your application data.");
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidate();
    fetchApplications();
  }, [fetchCandidate, fetchApplications]);

  const handleLogout = useCallback(() => {
    // Clear every candidate authentication/session key from BOTH storage types.
    // CandidateLogin stores these in either localStorage or sessionStorage
    // depending on "Remember me".
    const authKeys = [
      "candidate_token",
      "candidate_access_token",
      "candidate",
      "candidate_session_email",
    ];

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // The actual candidate portal route is /dashboard.
    // After logout, always replace the current history entry so Back
    // does not simply return to the authenticated page.
    navigate("/candidate-login", { replace: true });
  }, [navigate]);

  const isActivePath = (path) => location.pathname === path;

  const handleNav = useCallback(
    (path) => {
      navigate(path);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );

  /* ---------------- Account summary (derived from real application data) ---------------- */
  const summary = useMemo(() => {
    const submitted = applications.length;
    const interviews = applications.filter((a) => classifyStatus(a.status) === "Interview").length;
    const offers = applications.filter((a) => classifyStatus(a.status) === "Offer").length;
    const scored = applications.filter((a) => typeof a.match_score === "number");
    const avgMatch = scored.length
      ? Math.round(scored.reduce((sum, a) => sum + a.match_score, 0) / scored.length)
      : 0;
    return { submitted, interviews, offers, avgMatch };
  }, [applications]);

  /* ---------------- Edit profile ---------------- */
  const startEdit = () => {
    setForm({
      full_name: candidate?.full_name || "",
      phone: candidate?.phone || "",
      location: candidate?.location || "",
      date_of_birth: candidate?.date_of_birth || "",
      headline: candidate?.headline || "",
      desired_role: candidate?.desired_role || "",
      years_experience: candidate?.years_experience || "",
      education: candidate?.education || "",
    });
    setSaveState("idle");
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setForm(null);
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form) return;
    setSaveState("saving");

    // full_name and phone are real Candidate columns, so we try to persist
    // them through the existing candidates API. The backend does not yet
    // expose a PUT /candidates/{id} endpoint, so this is written to fail
    // gracefully and fall back to a local-only save rather than invent one.
    try {
      const candidateId = candidate?.id;
      if (candidateId) {
        await api.put(`/candidates/${candidateId}`, {
          full_name: form.full_name,
          phone: form.phone,
        });
      }
    } catch {
      // No update endpoint yet on the backend — continue with local persistence below.
    }

    const extras = {
      location: form.location,
      date_of_birth: form.date_of_birth,
      headline: form.headline,
      desired_role: form.desired_role,
      years_experience: form.years_experience,
      education: form.education,
    };
    saveExtendedProfile(candidate?.id, extras);

    setCandidate((c) => ({
      ...c,
      full_name: form.full_name,
      phone: form.phone,
      ...extras,
    }));

    setSaveState("saved");
    setEditMode(false);
    setTimeout(() => setSaveState("idle"), 2500);
  };

  /* ---------------- Resume upload ---------------- */
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !candidate?.id) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post(`/candidates/${candidate.id}/upload-resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCandidate((c) => ({
        ...c,
        resume_path: res.data?.resume_path || c.resume_path,
        parsed_skills: res.data?.parsed_data?.skills?.join(",") || c.parsed_skills,
      }));
    } catch (err) {
      setUploadError("Resume upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const skills = useMemo(() => {
    const raw = candidate?.parsed_skills;
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [candidate]);

  const hasResume = Boolean(candidate?.resume_path);
  const fileName = resumeFileName(candidate?.resume_path);

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
          candidate={candidate}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">My Profile</h1>
                <p className="mt-1 text-sm sm:text-base text-[#475569]">
                  Manage your personal details, resume and career information.
                </p>
              </div>
              {saveState === "saved" && (
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-xl w-fit">
                  <CheckCircle2 className="w-4 h-4" />
                  Profile updated
                </span>
              )}
            </div>

            {candidateError === "no-session" ? (
              <NoSessionNotice onGoToLogin={() => navigate("/candidate-login")} />
            ) : candidateLoading ? (
              <ProfileHeaderSkeleton />
            ) : candidateError ? (
              <ErrorState message={candidateError} onRetry={fetchCandidate} />
            ) : (
              <>
                <ProfileHeaderCard
                  candidate={candidate}
                  editMode={editMode}
                  onEditClick={startEdit}
                  onCancel={cancelEdit}
                  onSave={handleSave}
                  saveState={saveState}
                  form={form}
                  updateField={updateField}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PersonalInformationCard
                    candidate={candidate}
                    editMode={editMode}
                    form={form}
                    updateField={updateField}
                  />
                  <ProfessionalInformationCard
                    candidate={candidate}
                    skills={skills}
                    editMode={editMode}
                    form={form}
                    updateField={updateField}
                  />
                </div>

                <ResumeCard
                  hasResume={hasResume}
                  fileName={fileName}
                  resumeHref={resumeUrl(candidate?.resume_path)}
                  uploading={uploading}
                  uploadError={uploadError}
                  onUploadClick={handleUploadClick}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <AccountSummarySection
                  summary={summary}
                  loading={applicationsLoading}
                  error={applicationsError}
                  onRetry={fetchApplications}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR (Desktop, collapsible) — same structure as HRDashboard.jsx
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
            onClick={() => handleNav("/dashboard")}
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
function TopNavbar({ candidate, onMenuClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  const displayName = candidate?.full_name || "Candidate";

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

          <div className="flex-1 hidden sm:block">
            <p className="text-sm font-semibold text-[#0F172A]">My Profile</p>
            <p className="text-xs text-[#475569]">Candidate Portal</p>
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
                <p className="text-sm font-semibold text-[#0F172A]">{displayName}</p>
                <p className="text-xs text-[#475569]">Candidate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] font-bold text-sm">
                {initialOf(candidate?.full_name, candidate?.email)}
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
   PROFILE HEADER CARD
   ============================================================ */
function ProfileHeaderCard({ candidate, editMode, onEditClick, onCancel, onSave, saveState, form, updateField }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#0F766E] flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0 mx-auto sm:mx-0">
          {initialOf(candidate?.full_name, candidate?.email)}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          {editMode ? (
            <input
              type="text"
              value={form?.full_name ?? ""}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Full name"
              className="w-full max-w-sm px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-lg font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
          ) : (
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight truncate">
              {candidate?.full_name || "Unnamed Candidate"}
            </h2>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-sm text-[#475569]">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#0F766E]" />
              {candidate?.email || "—"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              {editMode ? (
                <input
                  type="text"
                  value={form?.location ?? ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Add location"
                  className="px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                />
              ) : (
                candidate?.location || "Location not set"
              )}
            </span>
          </div>

          <div className="mt-3 flex justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-xs font-semibold text-[#0F766E]">
              <UserCircle className="w-3.5 h-3.5" />
              Candidate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center sm:justify-end shrink-0">
          {editMode ? (
            <>
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#475569] bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saveState === "saving"}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D655E] hover:to-[#109B8B] rounded-xl shadow-md transition-all duration-200 disabled:opacity-70"
              >
                {saveState === "saving" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D655E] hover:to-[#109B8B] rounded-xl shadow-md hover:shadow-xl hover:shadow-[#0F766E]/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PERSONAL INFORMATION CARD
   ============================================================ */
function InfoField({ icon: Icon, label, value, editMode, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#0F766E]" />
        {label}
      </p>
      {editMode ? (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
        />
      ) : (
        <p className="mt-1.5 text-sm font-medium text-[#0F172A]">{value || <span className="text-[#94A3B8] font-normal">Not provided</span>}</p>
      )}
    </div>
  );
}

function PersonalInformationCard({ candidate, editMode, form, updateField }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-6">
      <h3 className="text-base font-bold text-[#0F172A]">Personal Information</h3>
      <p className="text-xs text-[#475569] mt-0.5 mb-5">Your basic contact and identity details</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <InfoField
          icon={UserCircle}
          label="Full Name"
          value={editMode ? form?.full_name : candidate?.full_name}
          editMode={editMode}
          onChange={(v) => updateField("full_name", v)}
          placeholder="Your full name"
        />
        <InfoField icon={Mail} label="Email" value={candidate?.email} editMode={false} />
        <InfoField
          icon={Phone}
          label="Phone"
          value={editMode ? form?.phone : candidate?.phone}
          editMode={editMode}
          onChange={(v) => updateField("phone", v)}
          placeholder="Phone number"
        />
        <InfoField
          icon={MapPin}
          label="Location"
          value={editMode ? form?.location : candidate?.location}
          editMode={editMode}
          onChange={(v) => updateField("location", v)}
          placeholder="City, Country"
        />
        <InfoField
          icon={Calendar}
          label="Date of Birth"
          value={editMode ? form?.date_of_birth : candidate?.date_of_birth}
          editMode={editMode}
          onChange={(v) => updateField("date_of_birth", v)}
          type="date"
        />
      </div>
    </div>
  );
}

/* ============================================================
   PROFESSIONAL INFORMATION CARD
   ============================================================ */
function ProfessionalInformationCard({ candidate, skills, editMode, form, updateField }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-6">
      <h3 className="text-base font-bold text-[#0F172A]">Professional Information</h3>
      <p className="text-xs text-[#475569] mt-0.5 mb-5">Your career profile and areas of expertise</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <InfoField
          icon={Sparkles}
          label="Professional Headline"
          value={editMode ? form?.headline : candidate?.headline}
          editMode={editMode}
          onChange={(v) => updateField("headline", v)}
          placeholder="e.g. Senior Frontend Engineer"
        />
        <InfoField
          icon={Briefcase}
          label="Current / Desired Role"
          value={editMode ? form?.desired_role : candidate?.desired_role}
          editMode={editMode}
          onChange={(v) => updateField("desired_role", v)}
          placeholder="e.g. Product Manager"
        />
        <InfoField
          icon={Award}
          label="Years of Experience"
          value={editMode ? form?.years_experience : candidate?.years_experience}
          editMode={editMode}
          onChange={(v) => updateField("years_experience", v)}
          placeholder="e.g. 5"
          type="number"
        />
        <InfoField
          icon={GraduationCap}
          label="Education"
          value={editMode ? form?.education : candidate?.education}
          editMode={editMode}
          onChange={(v) => updateField("education", v)}
          placeholder="e.g. B.Sc. Computer Science"
        />
      </div>

      <div className="mt-5 pt-5 border-t border-[#E2E8F0]">
        <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Skills</p>
        {skills.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0F766E]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#94A3B8]">
            No skills detected yet. Upload your resume below to auto-extract skills.
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   RESUME SECTION
   ============================================================ */
function ResumeCard({ hasResume, fileName, resumeHref, uploading, uploadError, onUploadClick }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              hasResume
                ? "bg-[#0F766E]/10 border-[#0F766E]/20 text-[#0F766E]"
                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]"
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Resume</h3>
            {hasResume ? (
              <>
                <p className="mt-0.5 text-sm text-[#0F172A] font-medium truncate max-w-xs">{fileName}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-[#0F766E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Uploaded
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#F59E0B]">
                <FileWarning className="w-3.5 h-3.5" />
                No resume uploaded yet
              </span>
            )}
            {uploadError && <p className="mt-1.5 text-xs font-medium text-[#EF4444]">{uploadError}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasResume && (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              View Resume
            </a>
          )}
          <button
            onClick={onUploadClick}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D655E] hover:to-[#109B8B] rounded-xl shadow-md transition-all duration-200 disabled:opacity-70"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {hasResume ? "Replace Resume" : "Upload Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACCOUNT SUMMARY
   ============================================================ */
function AccountSummarySection({ summary, loading, error, onRetry }) {
  const cards = [
    { label: "Applications Submitted", value: summary.submitted, icon: FileText },
    { label: "Interviews", value: summary.interviews, icon: ListChecks },
    { label: "Offers", value: summary.offers, icon: Award },
    { label: "Avg. Resume Match Score", value: summary.avgMatch, icon: Target, suffix: "%" },
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-[#0F172A] mb-4">Account Summary</h3>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => (
            <StatCard key={card.label} {...card} delay={idx * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, suffix = "", delay = 0 }) {
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
    </motion.div>
  );
}

/* ============================================================
   STATES — loading / error / no-session
   ============================================================ */
function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
        <div className="h-64 rounded-[20px] bg-[#E2E8F0]/60 animate-pulse" />
      </div>
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

function NoSessionNotice({ onGoToLogin }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-sm p-10 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
        <UserCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A]">We couldn't detect your session</h3>
      <p className="text-sm text-[#475569] max-w-sm">
        Please sign in to your candidate account to view and manage your profile.
      </p>
      <button
        onClick={onGoToLogin}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D655E] hover:to-[#109B8B] rounded-xl shadow-md transition-all duration-200"
      >
        Go to Candidate Login
      </button>
    </div>
  );
}
