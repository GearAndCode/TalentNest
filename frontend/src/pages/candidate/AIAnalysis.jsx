import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  RefreshCw,
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
   NAV ITEMS — matches the paths specified for this page.
   ============================================================ */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse Jobs", icon: Briefcase, path: "/browse-jobs" },
  { label: "My Applications", icon: FileText, path: "/candidate/applications" },
  { label: "AI Resume Analysis", icon: BrainCircuit, path: "/candidate/ai-analysis" },
  { label: "Profile", icon: UserCircle, path: "/candidate/profile" },
];

/* ============================================================
   MOCK ANALYSIS ENGINE
   No backend endpoint exists for this yet, so results are generated
   locally from the uploaded filename + optional target job/skills.
   This is clearly a placeholder, not a real AI call.
   ============================================================ */
function buildMockAnalysis({ fileName, targetJob, targetSkills }) {
  const seed = (fileName || "resume").length + (targetJob || "").length;
  const clamp = (n) => Math.max(35, Math.min(98, n));

  const overallScore = clamp(68 + (seed % 24));
  const sections = [
    { label: "ATS Compatibility", value: clamp(overallScore + 6) },
    { label: "Skills Match", value: clamp(overallScore - 4) },
    { label: "Experience", value: clamp(overallScore + 2) },
    { label: "Education", value: clamp(overallScore + 10) },
    { label: "Resume Structure", value: clamp(overallScore - 8) },
    { label: "Keyword Optimization", value: clamp(overallScore - 12) },
  ];

  const requestedSkills = targetSkills
    ? targetSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["React", "JavaScript", "SQL", "Communication", "Problem Solving"];

  const half = Math.ceil(requestedSkills.length / 2);
  const matchedSkills = requestedSkills.slice(0, half).length ? requestedSkills.slice(0, half) : ["Communication", "Teamwork"];
  const missingSkills = requestedSkills.slice(half).length ? requestedSkills.slice(half) : ["System Design"];
  const recommendedSkills = ["TypeScript", "Docker", "REST APIs", "Testing", "Cloud Basics"].filter(
    (s) => !matchedSkills.includes(s)
  );

  return {
    overallScore,
    sections,
    strengths: [
      "Strong technical skills relevant to your target roles",
      "Clear and well-organized education background",
      "Relevant project experience highlighted early in the resume",
    ],
    improvements: [
      "Add more measurable achievements (numbers, percentages, outcomes)",
      "Improve keyword matching for applicant tracking systems",
      "Strengthen your professional summary at the top of the resume",
    ],
    matchedSkills,
    missingSkills,
    recommendedSkills,
    summary: `This resume presents a candidate with a solid technical foundation${
      targetJob ? ` for a ${targetJob} role` : ""
    }. The experience section is relevant and the education background is clearly presented. To stand out further, focus on quantifying achievements and aligning keywords more closely with the target job description.`,
    recommendations: [
      { icon: TrendingUp, text: "Quantify your achievements with metrics wherever possible (e.g. 'increased performance by 30%')." },
      { icon: Target, text: "Tailor your resume keywords to closely match the target job description." },
      { icon: Lightbulb, text: "Add a concise professional summary that highlights your top 3 strengths." },
      { icon: CheckCircle2, text: "List your most relevant and recent experience first." },
      { icon: Sparkles, text: "Use consistent formatting for headings, dates, and bullet points." },
      { icon: AlertCircle, text: "Avoid generic phrases — be specific about your contributions and outcomes." },
    ],
    jobMatch: targetJob
      ? {
          score: clamp(overallScore + 5),
          matching: matchedSkills.map((s) => `Proficiency in ${s}`),
          missing: missingSkills.map((s) => `Demonstrated experience with ${s}`),
          suggestions: [
            `Highlight any experience directly related to "${targetJob}" near the top of your resume.`,
            "Mirror language from the job description where it genuinely applies to your background.",
          ],
        }
      : null,
  };
}

function scoreColor(score) {
  if (score >= 85) return "#0F766E";
  if (score >= 70) return "#14B8A6";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function AIAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [targetJob, setTargetJob] = useState("");
  const [targetSkills, setTargetSkills] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const isActivePath = (path) => location.pathname === path;
  const handleNav = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("candidate_token");
    sessionStorage.removeItem("candidate_token");
    localStorage.removeItem("candidate");
    sessionStorage.removeItem("candidate");
    localStorage.removeItem("candidate_session_email");
    sessionStorage.removeItem("candidate_session_email");
    navigate("/candidate-login", { replace: true });
  };

  const handleFileSelect = useCallback((selected) => {
    if (!selected) return;
    const validTypes = [".pdf", ".doc", ".docx"];
    const isValid = validTypes.some((ext) => selected.name.toLowerCase().endsWith(ext));
    if (!isValid) return;
    setFile(selected);
    setResult(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFileSelect(dropped);
  };

  const handleAnalyze = () => {
    if (!file || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    // Simulated analysis delay — no backend endpoint exists for this yet.
    setTimeout(() => {
      setResult(buildMockAnalysis({ fileName: file.name, targetJob, targetSkills }));
      setAnalyzing(false);
    }, 1800);
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

      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} isActivePath={isActivePath} handleNav={handleNav} onLogout={handleLogout} />
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} isActivePath={isActivePath} handleNav={handleNav} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar onMenuClick={() => setMobileSidebarOpen(true)} navigate={navigate} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">AI Resume Analysis</h1>
              <p className="mt-1 text-sm sm:text-base text-[#475569]">
                Analyze your resume with AI and get personalized insights to improve your chances of getting hired.
              </p>
            </div>

            <UploadCard
              file={file}
              dragActive={dragActive}
              setDragActive={setDragActive}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />

            <TargetJobSection targetJob={targetJob} setTargetJob={setTargetJob} targetSkills={targetSkills} setTargetSkills={setTargetSkills} />

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0F766E]"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing your resume...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {result && <AnalysisResult result={result} targetJob={targetJob} />}
            </AnimatePresence>
          </div>
        </main>
      </div>
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
                key={item.label}
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
function TopNavbar({ onMenuClick, navigate }) {
  const email = typeof window !== "undefined" ? localStorage.getItem("candidate_session_email") || "" : "";
  const namePart = email.includes("@") ? email.split("@")[0] : email;
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
   UPLOAD CARD
   ============================================================ */
function UploadCard({ file, dragActive, setDragActive, onDrop, onFileSelect, fileInputRef }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Upload your resume</h3>
          <p className="text-xs text-[#475569]">Upload a PDF or DOCX file</p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-3 transition-colors ${
          dragActive ? "border-[#0F766E] bg-[#0F766E]/5" : "border-[#E2E8F0] bg-[#F8FAFC]"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0F766E]">
          <UploadCloud className="w-7 h-7" />
        </div>

        {file ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <FileText className="w-4 h-4 text-[#0F766E]" />
            {file.name}
          </div>
        ) : (
          <p className="text-sm text-[#475569]">Drag and drop your resume here, or browse to select a file</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files?.[0])}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] text-sm font-semibold text-[#0F766E] shadow-sm transition-all"
        >
          {file ? "Replace File" : "Browse Files"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TARGET JOB SECTION
   ============================================================ */
function TargetJobSection({ targetJob, setTargetJob, targetSkills, setTargetSkills }) {
  return (
    <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-[#0F172A]">Target Job (optional)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Target Job Title</label>
          <input
            type="text"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            placeholder="e.g. Software Engineer, Frontend Developer"
            className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Target Skills</label>
          <input
            type="text"
            value={targetSkills}
            onChange={(e) => setTargetSkills(e.target.value)}
            placeholder="React, Python, SQL, JavaScript..."
            className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/70 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANALYSIS RESULT
   ============================================================ */
function AnalysisResult({ result, targetJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Overall score */}
      <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center gap-8">
        <CircularScore score={result.overallScore} size={120} strokeWidth={10} labelClass="text-2xl" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-[#0F172A]">Overall Resume Score</h3>
          <p className="text-sm text-[#475569] mt-1 max-w-md">{result.summary}</p>
        </div>
      </div>

      {/* Section scores */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-base font-bold text-[#0F172A] mb-5">Score Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {result.sections.map((section) => (
            <div key={section.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#0F172A]">{section.label}</span>
                <span className="text-xs font-bold" style={{ color: scoreColor(section.value) }}>
                  {section.value}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${section.value}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: scoreColor(section.value) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard icon={CheckCircle2} tone="emerald" title="Strengths" items={result.strengths} />
        <InsightCard icon={AlertCircle} tone="amber" title="Areas to Improve" items={result.improvements} />
      </div>

      {/* Skills analysis */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-5">
        <h3 className="text-base font-bold text-[#0F172A]">Skills Analysis</h3>
        <SkillGroup label="Matched Skills" skills={result.matchedSkills} tone="emerald" />
        <SkillGroup label="Missing Skills" skills={result.missingSkills} tone="rose" />
        <SkillGroup label="Recommended Skills" skills={result.recommendedSkills} tone="teal" />
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-base font-bold text-[#0F172A] mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0">
                <rec.icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job match */}
      {result.jobMatch && (
        <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <CircularScore score={result.jobMatch.score} size={90} strokeWidth={8} labelClass="text-lg" />
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Job Match Score</h3>
              <p className="text-sm text-[#475569] mt-1">
                How well this resume matches the <span className="font-semibold text-[#0F172A]">{targetJob}</span> role.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Matching Requirements</p>
              <ul className="space-y-1.5">
                {result.jobMatch.matching.map((m, i) => (
                  <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">Missing Requirements</p>
              <ul className="space-y-1.5">
                {result.jobMatch.missing.map((m, i) => (
                  <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Suggested Improvements</p>
            <ul className="space-y-1.5">
              {result.jobMatch.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CircularScore({ score, size = 100, strokeWidth = 8, labelClass = "text-xl" }) {
  const color = scoreColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-extrabold ${labelClass}`} style={{ color }}>
          {Math.round(score)}
        </span>
        <span className="text-[10px] text-[#475569] font-medium">/ 100</span>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, tone, title, items }) {
  const toneMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100" },
  };
  const t = toneMap[tone];
  return (
    <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg ${t.iconBg} ${t.text} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className={`text-sm text-[#475569] flex items-start gap-2 p-2.5 rounded-xl ${t.bg}`}>
            <span className={`font-bold ${t.text} shrink-0`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillGroup({ label, skills, tone }) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    teal: "bg-[#14B8A6]/10 text-[#0F766E]",
  };
  if (!skills || skills.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className={`px-3 py-1.5 rounded-full text-xs font-medium ${toneMap[tone]}`}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
