import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getJobs, searchJobs } from '../../services/jobService';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Sparkles,
  Zap,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Layers,
  BrainCircuit,
  Route,
  UserCircle2,
  Send,
  Mail,
  Globe,
  Clock,
  Filter,
  AlertTriangle,
  Loader2,
  Bookmark,
  Menu,
  X,
  BadgeCheck,
  SearchX
} from 'lucide-react';
import { subscribeNewsletter } from "../../services/newsletterService";

// Shared TalentNest Brand Logo (Identical to Home Page)
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

const TAGLINES = [
  "AI finds the best opportunities for you.",
  "Real-time opportunities from top companies.",
  "Your next career move starts here.",
  "Apply smarter with data-driven insights.",
  "Get matched with your ideal role."
];

const CAREER_RESOURCES = [
  {
    title: "Browse & Search Jobs",
    desc: "Search live job postings by keyword, location, department, and category.",
    icon: Search,
    tag: "LIVE JOBS",
    path: "/browse-jobs",
  },
  {
    title: "Apply to Open Roles",
    desc: "Open a job, review the position details, and submit your application directly to the hiring team.",
    icon: Send,
    tag: "APPLICATIONS",
    path: "/browse-jobs",
  },
  {
    title: "My Applications",
    desc: "View the applications you have submitted and keep your application history in one place.",
    icon: Briefcase,
    tag: "YOUR APPLICATIONS",
    path: "/candidate/applications",
  },
  {
    title: "Application Tracker",
    desc: "Track your application progress and see the latest status of your submitted applications.",
    icon: Route,
    tag: "TRACK PROGRESS",
    path: "/candidate/tracker",
  },
  {
    title: "AI Resume Analysis",
    desc: "Use the TalentNest AI resume analysis workspace to review candidate resume information and match insights.",
    icon: BrainCircuit,
    tag: "AI ANALYSIS",
    path: "/candidate/ai-analysis",
  },
  {
    title: "Profile & Resume",
    desc: "Manage your candidate profile and resume information from your personal TalentNest profile.",
    icon: UserCircle2,
    tag: "PROFILE",
    path: "/candidate/profile",
  },
];

const STATS_CONFIG = {
  totalJobs: { label: "Total Active Jobs", icon: Briefcase, suffix: "+" },
  totalCompanies: { label: "Total Companies", icon: Building2, suffix: "" },
  remoteJobs: { label: "Remote Jobs", icon: Globe, suffix: "" },
  internships: { label: "Internships", icon: GraduationCap, suffix: "" }
};

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-teal-600", "bg-emerald-600", "bg-cyan-700", "bg-teal-800",
    "bg-indigo-600", "bg-sky-600", "bg-rose-600", "bg-amber-700"
  ];
  return colors[Math.abs(hash) % colors.length];
}

function formatSalary(salary) {
  if (!salary && salary !== 0) return "Competitive";
  if (typeof salary === 'number') {
    return `$${salary.toLocaleString()}/yr`;
  }
  return salary;
}

function normalizeJob(job) {
  if (!job || typeof job !== 'object') return null;

  const nestedCompany =
    job.company && typeof job.company === 'object' ? job.company : null;

  const companyId = job.company_id ?? nestedCompany?.id ?? null;
  const companyName =
    job.company_name ??
    nestedCompany?.company_name ??
    nestedCompany?.name ??
    null;
  const companyLogo =
    job.company_logo ??
    nestedCompany?.logo ??
    job.logo ??
    job.companyLogo ??
    null;

  return {
    ...job,
    company_id: companyId,
    company_name: companyName,
    company_logo: companyLogo,
    company_headquarters:
      job.company_headquarters ?? nestedCompany?.headquarters ?? null,
  };
}

function getCompanyInitials(companyName) {
  if (!companyName) return "CO";

  const initials = companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "CO";
}

function useCounter(target, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger || target === undefined || target === null || isNaN(target)) {
      if (!isNaN(target)) setCount(target);
      return;
    }
    let start = 0;
    const finalTarget = parseInt(target, 10);
    if (finalTarget === 0) {
      setCount(0);
      return;
    }
    const increment = finalTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= finalTarget) {
        setCount(finalTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);

  return count;
}

const JobCardSkeleton = () => (
  <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between animate-pulse">
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-slate-200 rounded mb-3" />
      <div className="flex gap-3 mb-4">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
      <div className="h-10 w-full bg-slate-100 rounded mb-4" />
      <div className="flex gap-1.5 mb-6">
        {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-slate-100 rounded-lg" />)}
      </div>
    </div>
    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
      <div className="space-y-1">
        <div className="h-2 w-16 bg-slate-100 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-10 w-10 bg-slate-200 rounded-xl" />
        <div className="h-10 w-20 bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export default function CareersPage() {
  const navigate = useNavigate();

  // Navigation Bar States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Primary State
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search Filters State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Auxiliary UI States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);
  const [savedJobs, setSavedJobs] = useState({});
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [isLoggedIn] = useState(() => Boolean(
    localStorage.getItem('candidate_token') ||
    sessionStorage.getItem('candidate_token')
  ));

  // Handle Header Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial Load
  const loadJobs = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getJobs();
      const jobList = Array.isArray(data)
        ? data.map(normalizeJob).filter(Boolean)
        : [];
      setJobs(jobList);
      setFilteredJobs(jobList);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Server-side searching when inputs change
  useEffect(() => {
    const handleSearch = async () => {
      const hasKeyword = searchKeyword.trim().length > 0;
      const hasDepartment = selectedDepartment.trim().length > 0;
      const hasLocation = selectedLocation.trim().length > 0;

      if (!hasKeyword && !hasDepartment && !hasLocation) {
        const categoryFilteredJobs =
          selectedCategoryFilter === 'All'
            ? jobs
            : jobs.filter(
                (job) =>
                  (job.category || job.department || 'Engineering') ===
                  selectedCategoryFilter
              );

        setFilteredJobs(categoryFilteredJobs);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const results = await searchJobs({
          keyword: searchKeyword.trim(),
          department: selectedDepartment.trim(),
          location: selectedLocation.trim()
        });
        const jobResults = Array.isArray(results)
          ? results.map(normalizeJob).filter(Boolean)
          : [];
        setFilteredJobs(jobResults);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, selectedDepartment, selectedLocation, jobs, selectedCategoryFilter]);

  // Dynamic Statistics Calculation
  const statistics = useMemo(() => {
    const totalJobs = jobs.length;
    const remoteJobs = jobs.filter(j => j.location && j.location.toLowerCase().includes('remote')).length;
    const internships = jobs.filter(j => 
      (j.employment_type && j.employment_type.toLowerCase().includes('intern')) || 
      (j.title && j.title.toLowerCase().includes('intern'))
    ).length;

    const companyIds = new Set(
      jobs
        .map((job) => job.company_id)
        .filter((companyId) => companyId !== null && companyId !== undefined)
    );
    const totalCompanies = companyIds.size;

    return {
      totalJobs,
      totalCompanies,
      remoteJobs,
      internships
    };
  }, [jobs]);

  // Dynamic Category Generation
  const categories = useMemo(() => {
    const catCounts = {};
    jobs.forEach(job => {
      const cat = job.category || job.department || 'Engineering';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    return Object.entries(catCounts).map(([name, count]) => ({
      name,
      jobs: count
    }));
  }, [jobs]);

  // Dynamic Company Grouping
  // Only real company IDs/names returned by the backend are shown.
  const companies = useMemo(() => {
    const companyMap = {};

    jobs.forEach((job) => {
      const compId = job.company_id;
      const compName = job.company_name;

      if (!compId || !compName) return;

      if (!companyMap[compId]) {
        companyMap[compId] = {
          id: compId,
          name: compName,
          openJobs: 0,
          location: job.company_headquarters || job.location || '',
          logo: job.company_logo || null,
        };
      }

      companyMap[compId].openJobs += 1;
    });

    return Object.values(companyMap).sort(
      (a, b) => b.openJobs - a.openJobs
    );
  }, [jobs]);

  // Tagline Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIdx((prev) => (prev + 1) % TAGLINES.length);
        setTaglineFade(true);
      }, 300);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for Statistics animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleCategoryClick = (catName) => {
    setSelectedCategoryFilter(catName);
    setSearchKeyword('');
    setSelectedLocation('');
    setSelectedDepartment('');

    if (catName === 'All') {
      setFilteredJobs(jobs);
      return;
    }

    const results = jobs.filter(job => (job.category || job.department) === catName);
    setFilteredJobs(results);
  };

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
  };

  const handleApplyClick = (jobId) => {
    if (!isLoggedIn) {
      navigate('/candidate-login');
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

  const toggleSaveJob = (id, e) => {
    e.stopPropagation();
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

 const handleNewsletterSubmit = async (e) => {
  e.preventDefault();

  try {
    await subscribeNewsletter(emailInput);

    setSubscribed(true);
    setEmailInput("");

    setTimeout(() => {
      setSubscribed(false);
    }, 3000);

  } catch (err) {
    if (err.response?.status === 400) {
      alert("This email is already subscribed.");
    } else {
      alert("Subscription failed.");
    }

    console.error(err);
  }
};

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Solutions", href: "/#solutions" },
    { name: "Careers", href: "/careers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF] relative overflow-x-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[650px] h-[650px] rounded-full bg-[#14B8A6]/10 blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-[#0F766E]/10 blur-[160px]" />
      </div>

      {/* Header - Identical to Home Component */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
          scrolled 
            ? 'bg-[#FFFFFF]/85 border-[#E2E8F0] shadow-sm py-0.5' 
            : 'bg-[#FFFFFF]/70 border-[#E2E8F0]/60 py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="group flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] shadow-sm group-hover:bg-[#0D9488] transition-colors duration-200">
                <TalentNestLogo className="w-6 h-6 text-[#FFFFFF]" />
              </div>
              <span className="text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0F766E] transition-colors duration-200">
                TalentNest
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-8 bg-[#F8FAFC]/80 px-10 py-3 rounded-full border border-[#E2E8F0] shadow-sm min-w-[560px]">            
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    link.name === 'Careers' 
                      ? 'text-[#0F766E] font-semibold' 
                      : 'text-[#475569] hover:text-[#0F766E]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link to="/hr-login"
                className="px-4.5 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl shadow-2xs"
              >
                HR Login
              </Link>
              <Link
                to="/candidate-login"
                className="px-5 py-2.5 text-sm font-medium text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] rounded-xl"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC] px-3 py-2.5 rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col space-y-2.5">
              <Link to="/hr-login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-[#0F766E] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
              >
                HR Login
              </Link>
              <Link
                to="/candidate-login"
                className="px-5 py-2.5 text-center text-sm font-medium text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero & Search Section */}
      <section className="relative z-10 pt-12 pb-12 lg:pt-16 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-full px-3.5 py-1.5 mb-6 shadow-xs cursor-default">
          <Sparkles className="w-4 h-4 text-[#0F766E] animate-pulse" />
          <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
            TALENTNEST CAREER PORTAL
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
          Discover Your Dream{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-cyan-600">
            Career.
          </span>
        </h1>

        <div className="h-10 flex items-center justify-center mb-10">
          <p className={`text-lg sm:text-xl font-medium text-[#475569] max-w-2xl transition-all duration-300 transform ${taglineFade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
            {TAGLINES[taglineIdx]}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-5xl mx-auto bg-[#FFFFFF] p-3 sm:p-4 rounded-[24px] border border-[#E2E8F0] shadow-sm hover:border-[#14B8A6]/40 transition-all duration-300">
          <form onSubmit={handleSearchFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4 text-[#0F766E]" />
              </div>
              <input 
                type="text" 
                placeholder="Job Title / Keyword" 
                value={searchKeyword} 
                onChange={(e) => setSearchKeyword(e.target.value)} 
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-[#0F766E]" />
              </div>
              <input 
                type="text" 
                placeholder="Location" 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-4 h-4 text-[#0F766E]" />
              </div>
              <input 
                type="text" 
                placeholder="Department" 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)} 
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 px-6 bg-[#0F766E] hover:bg-[#0D9488] text-[#FFFFFF] font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </button>
          </form>
        </div>
      </section>

      {/* Dynamic Statistics Section */}
      <section ref={statsRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(statistics).map(([key, value]) => {
              const config = STATS_CONFIG[key] || STATS_CONFIG["totalJobs"];
              const Icon = config.icon;
const count = value;
              return (
                <div
                  key={key}
                  className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] mb-4 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {count}
                    <span className="text-[#0F766E]">{config.suffix}</span>
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-[#475569] mt-1">
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Jobs Listing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>LIVE DATABASE ROLES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Explore Open Roles
            </h2>
            <p className="text-[#475569] text-sm mt-1">
              Real-time job postings synchronized directly from PostgreSQL.
            </p>
          </div>

          {!loading && !error && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleCategoryClick('All')} 
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategoryFilter === 'All' 
                    ? 'bg-[#0F766E] text-white shadow-xs' 
                    : 'bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0] hover:border-[#14B8A6]/40 hover:bg-[#F8FAFC]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.name} 
                  onClick={() => handleCategoryClick(cat.name)} 
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategoryFilter === cat.name 
                      ? 'bg-[#0F766E] text-white shadow-xs' 
                      : 'bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0] hover:border-[#14B8A6]/40 hover:bg-[#F8FAFC]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <JobCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-xs max-w-xl mx-auto p-6">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Connection Error</h3>
            <p className="text-[#475569] text-sm mb-6">Unable to load jobs. Please try again later.</p>
            <button 
              onClick={loadJobs} 
              className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs rounded-xl flex items-center space-x-2 mx-auto transition-all"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State - No Jobs Available */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-xs max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No jobs available</h3>
            <p className="text-[#475569] text-sm max-w-sm mx-auto">
              There are currently no open positions listed. Check back later for new HR postings.
            </p>
          </div>
        )}

        {/* Empty State - Search Filter No Match */}
        {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] shadow-xs max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] mx-auto mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No matching jobs found</h3>
            <p className="text-[#475569] text-sm max-w-sm mx-auto">
              We couldn't find any opportunities matching your specific search filters.
            </p>
            <button 
              onClick={() => handleCategoryClick('All')} 
              className="mt-6 px-5 py-2.5 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold text-xs rounded-xl border border-[#E2E8F0] transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const compName = job.company_name || 'Unknown Company';
              const avatarColor = stringToColor(compName);
              const initials = getCompanyInitials(compName);

              return (
                <div 
                  key={job.id} 
                  className="bg-[#FFFFFF] rounded-[20px] border border-[#E2E8F0] hover:border-[#14B8A6]/50 p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center space-x-3">
                        {job.company_logo ? (
                          <img 
                            src={job.company_logo} 
                            alt={`${compName} Logo`} 
                            className="w-12 h-12 rounded-xl object-contain border border-[#E2E8F0] p-1 bg-[#FFFFFF] shadow-2xs" 
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-2xs ${avatarColor}`}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-sm">{compName}</h4>
                          <span className="text-xs text-[#475569] font-medium">{formatTimeAgo(job.created_at || job.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0F766E] transition-colors leading-snug mb-2">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap gap-y-1.5 gap-x-3 text-xs text-[#475569] font-medium mb-4">
                      {job.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      {(job.employment_type || job.employmentType) && (
                        <span className="flex items-center space-x-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.employment_type || job.employmentType}</span>
                        </span>
                      )}
                      {job.experience && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.experience}</span>
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed mb-4">
                        {job.description}
                      </p>
                    )}

                    {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {job.skills.slice(0, 4).map((sk) => (
                          <span key={sk} className="bg-[#F8FAFC] text-[#475569] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SALARY</span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#0F172A]">{formatSalary(job.salary)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        onClick={(e) => toggleSaveJob(job.id, e)} 
                        className={`p-2.5 rounded-xl border transition-all ${
                          savedJobs[job.id] 
                            ? 'bg-[#14B8A6]/10 border-[#14B8A6]/40 text-[#0F766E]' 
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-400 hover:text-[#0F172A] hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${savedJobs[job.id] ? 'fill-[#0F766E]' : ''}`} />
                      </button>

                      <button 
                        onClick={() => handleApplyClick(job.id)} 
                        className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center space-x-1"
                      >
                        <span>Apply</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Companies Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>HIRING PARTNERS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Companies on TalentNest
          </h2>
          <p className="text-[#475569] text-sm sm:text-base mt-2">
            Automatically grouped from active database entries.
          </p>
        </div>

        {!loading && !error && companies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp) => {
              const avatarColor = stringToColor(comp.name);
              const initials = getCompanyInitials(comp.name);

              return (
                <div 
                  key={comp.id || comp.name} 
                  className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] hover:border-[#14B8A6]/50 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {comp.logo ? (
                        <img 
                          src={comp.logo} 
                          alt={`${comp.name} Logo`} 
                          className="w-12 h-12 rounded-xl object-contain border border-[#E2E8F0] p-1 bg-[#FFFFFF] shadow-2xs" 
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-2xs ${avatarColor}`}>
                          {initials}
                        </div>
                      )}
                      {/* Subtle Verified / Active Badge replacing fake ratings */}
                      <div className="flex items-center space-x-1 bg-[#14B8A6]/10 text-[#0F766E] px-2.5 py-1 rounded-full text-xs font-semibold">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Active Employer</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F172A] mb-1 group-hover:text-[#0F766E] transition-colors">
                      {comp.name}
                    </h3>
                    {comp.location && (
                      <p className="text-xs font-semibold text-[#475569] mb-4 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400"/>
                        <span>{comp.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-[#0F766E] bg-[#14B8A6]/10 px-3 py-1 rounded-full">
                      {comp.openJobs} Open Roles
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* AI Resources Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2">
            <Briefcase className="w-4 h-4" />
            <span>CANDIDATE SUITE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Candidate Features & Tools
          </h2>
          <p className="text-[#475569] text-sm sm:text-base mt-2">
            Explore the candidate features that are actually available in TalentNest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_RESOURCES.map((res) => {
            const Icon = res.icon;
            return (
              <div 
                key={res.title} 
                className="bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] hover:border-[#14B8A6]/50 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full">
                      {res.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#0F766E] transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8F0]">
                  <Link
                    to={res.path}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                  >
                    <span>Open Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-[#FFFFFF] rounded-[24px] p-8 sm:p-12 border border-[#E2E8F0] shadow-xs text-center max-w-4xl mx-auto overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] flex items-center justify-center mx-auto mb-4 relative z-10">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2 relative z-10">
            Stay Updated with Database Job Alerts
          </h2>
          <p className="text-[#475569] text-sm max-w-md mx-auto mb-8 relative z-10">
            Receive personalized weekly alerts as soon as HR posts new roles.
          </p>

          {subscribed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 max-w-md mx-auto relative z-10">
              <span>You're subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
              <input 
                type="email" 
                required 
                placeholder="Enter your email..." 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                className="flex-grow px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1 shrink-0"
              >
                <span>Subscribe</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer - Identical to Home Component */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-[#FFFFFF]">
                  <TalentNestLogo className="w-5 h-5 text-[#FFFFFF]" />
                </div>
                <span className="text-lg font-bold text-[#0F172A]">TalentNest</span>
              </div>
              <p className="text-sm text-[#475569] max-w-xs">
                Where Great Talent Finds Home. Enterprise AI-powered Applicant Tracking System.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Product</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="/#features" className="text-[#475569] hover:text-[#0F766E] transition-colors">Features</a></li>
                <li><a href="/#solutions" className="text-[#475569] hover:text-[#0F766E] transition-colors">Solutions</a></li>
                <li><a href="/#security" className="text-[#475569] hover:text-[#0F766E] transition-colors">Enterprise Security</a></li>
              </ul>
            </div>

            {/* Platform Column */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/hr-login" className="text-[#475569] hover:text-[#0F766E] transition-colors">HR Portal</Link></li>
                <li><Link to="/candidate-login" className="text-[#475569] hover:text-[#0F766E] transition-colors">Candidate Hub</Link></li>
                <li><Link to="/careers" className="text-[#475569] hover:text-[#0F766E] transition-colors">Careers Board</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Company</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/about" className="text-[#475569] hover:text-[#0F766E] transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-[#475569] hover:text-[#0F766E] transition-colors">Contact</Link></li>
                <li><Link to="/privacy-policy" className="text-[#475569] hover:text-[#0F766E] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#475569]">
            <p>&copy; {new Date().getFullYear()} TalentNest Platform Inc. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Built for Enterprise Recruitment Teams.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

