import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  FileText,
  BrainCircuit,
  GitMerge,
  Calendar,
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  Users,
  Briefcase,
  UserSearch,
  ChevronRight
} from 'lucide-react';

// Height (px) reserved for the sticky header so anchor-scrolls don't hide the
// destination heading underneath it. Keep in sync with the header's h-20 + border.
const HEADER_SCROLL_OFFSET = 96;

// Smoothly scrolls to an in-page section, compensating for the sticky header.
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
};

// Reveals children with a subtle fade/slide-up the first time they enter the viewport.
// Respects prefers-reduced-motion by simply rendering visible immediately.
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// Single source of truth for nav item behavior: "scroll" items smooth-scroll to an
// in-page section (accounting for the sticky header); "route" items use React Router.
// Shared by desktop nav, mobile nav, and the footer so the logic isn't duplicated.
const NavItem = ({ link, className, onNavigate }) => {
  if (link.type === 'scroll') {
    const targetId = link.href.slice(1);
    return (
      <a
        href={link.href}
        onClick={(e) => {
          e.preventDefault();
          scrollToSection(targetId);
          onNavigate?.();
        }}
        className={className}
      >
        {link.name}
      </a>
    );
  }

  return (
    <Link to={link.href} onClick={onNavigate} className={className}>
      {link.name}
    </Link>
  );
};

// Custom TalentNest Brand Logo (Pure SVG: Minimal, circular nest concept wrapping two abstract talent nodes)
const TalentNestLogo = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer Nest Framework Curve */}
    <path
      d="M4 18C4 23.5228 8.47715 28 14 28H18C23.5228 28 28 23.5228 28 18C28 15.5 27.1 13.2 25.5 11.5"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
    />
    {/* Inner Nest Support Cradle */}
    <path
      d="M7 16C7 20.4183 10.5817 24 15 24H17C21.4183 24 25 20.4183 25 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.75"
    />
    {/* Left Talent Figure Node */}
    <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    <path
      d="M9 17.5C9 15.5 10.3 14.5 12 14.5C13.7 14.5 15 15.5 15 17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Right Talent Figure Node */}
    <circle cx="20" cy="10" r="2.5" fill="currentColor" />
    <path
      d="M17 16.5C17 14.5 18.3 13.5 20 13.5C21.7 13.5 23 14.5 23 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animated Tagline State
  const taglines = [
    "Where Great Talent Finds Home.",
    "Connecting Talent. Empowering Growth.",
    "AI-Powered Recruitment. Human-Centered Hiring.",
    "Build Exceptional Teams with Confidence."
  ];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [fadeState, setFadeState] = useState(true);

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

  // Cycle taglines smoothly every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState(false); // Trigger fade-out & slight move-up
      setTimeout(() => {
        setCurrentTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
        setFadeState(true); // Trigger fade-in & return to position
      }, 500); // Wait for half a second fade-out transition
    }, 3500);

    return () => clearInterval(interval);
  }, [taglines.length]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  // "type" drives NavItem behavior: scroll = smooth in-page scroll, route = react-router Link.
  const navLinks = [
    { name: "Features", href: "#features", type: "scroll" },
    { name: "Solutions", href: "#solutions", type: "scroll" },
    { name: "Careers", href: "/careers", type: "route" },
    { name: "About", href: "/about", type: "route" },
    { name: "Contact", href: "/contact", type: "route" },
  ];

  const features = [
    {
      icon: FileText,
      title: 'AI Resume Parsing',
      description: 'Automatically extract structured candidate data, skills, education, and work history from PDF and DOCX documents with context-aware semantic extraction.',
    },
    {
      icon: BrainCircuit,
      title: 'AI Candidate Evaluation',
      description: 'Generate objective, structured candidate summaries, strengths, gap analyses, and role-fit scoring based on custom job description criteria.',
    },
    {
      icon: GitMerge,
      title: 'Recruitment Pipeline',
      description: 'Streamline applicant flow through fully customizable hiring stages, multi-stage approval gates, and automated status transitions.',
    },
    {
      icon: Calendar,
      title: 'Interview Scheduling',
      description: 'Coordinate multi-interviewer panel evaluations, send automated calendar invites, and collect structured feedback scorecards seamlessly.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Define granular authorization boundaries across Super Admin, HR Specialist, Department Interviewer, and Candidate role categories.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Protect platform operations with JWT session controls, encrypted file storage, rigorous payload validation, and immutable audit logs.',
    },
  ];

  const [featuresRef, featuresVisible] = useReveal();
  const [solutionsRef, solutionsVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-[#FFFFFF]">

      {/* Custom Keyframe Animations for Subtle Hero Elements */}
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-subtle-float {
          animation: subtleFloat 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulseGlow 8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-subtle-float,
          .animate-pulse-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* Premium Glassmorphic Navigation Bar */}
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
              aria-label="TalentNest home"
              className="group flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] shadow-sm group-hover:bg-[#0D9488] transition-colors duration-200">
                <TalentNestLogo className="w-6 h-6 text-[#FFFFFF]" />
              </div>
              <span className="text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0F766E] transition-colors duration-200">
                TalentNest
              </span>
            </Link>

            {/* Desktop Navigation Links with Active/Hover Indicators */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center justify-center gap-8 bg-[#F8FAFC]/80 px-10 py-3 rounded-full border border-[#E2E8F0] shadow-sm min-w-[560px]"
            >
              {navLinks.map((link) => (
                <NavItem
                  key={link.name}
                  link={link}
                  className="text-sm font-medium text-[#475569] hover:text-[#0F766E] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded-md"
                />
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                to="/hr-login"
                className="px-4.5 py-2.5 text-sm font-medium text-[#0F766E] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl shadow-2xs"
              >
                HR Login
              </Link>
              <Link
                to="/hr-login"
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
                aria-controls="mobile-nav-menu"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="md:hidden bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200"
          >
            <nav aria-label="Mobile" className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavItem
                  key={link.name}
                  link={link}
                  onNavigate={closeMobileMenu}
                  className="text-base font-medium text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC] px-3 py-2.5 rounded-xl transition-colors"
                />
              ))}
            </nav>
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col space-y-2.5">
              <Link
                to="/hr-login"
                onClick={closeMobileMenu}
                className="w-full text-center py-2.5 text-sm font-medium text-[#0F766E] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
              >
                HR Login
              </Link>
              <Link
                to="/hr-login"
                onClick={closeMobileMenu}
                className="w-full text-center px-5 py-2.5 text-sm font-medium text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main>

        {/* Hero Section */}
        <section className="relative bg-[#F8FAFC] py-20 lg:py-28 overflow-hidden border-b border-[#E2E8F0]">

          {/* Subtle Floating Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Ambient Blurred Emerald Circle Top-Left */}
            <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#14B8A6]/10 blur-3xl motion-safe:animate-pulse-glow" />
            {/* Ambient Blurred Emerald Circle Center-Right */}
            <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#0F766E]/10 blur-3xl motion-safe:animate-pulse-glow" style={{ animationDelay: '3s' }} />
            {/* Tiny Glowing Particle Top Center */}
            <div className="absolute top-12 left-1/2 w-2 h-2 rounded-full bg-[#14B8A6]/40 blur-[1px] motion-safe:animate-subtle-float" />
            {/* Small Floating Ring */}
            <div className="absolute top-1/4 left-10 w-16 h-16 rounded-full border border-[#0F766E]/15 motion-safe:animate-subtle-float" style={{ animationDelay: '1s' }} />
            {/* Abstract Connection Dot Grid Accent */}
            <div className="absolute bottom-12 left-1/3 w-3 h-3 rounded-full bg-[#0F766E]/20 motion-safe:animate-subtle-float" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* Left Column: Headline, Dynamic Tagline, and Call to Actions */}
              <div className="lg:col-span-6 space-y-8 text-left">

                {/* Enterprise Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/80 backdrop-blur-sm border border-[#E2E8F0] text-xs font-semibold text-[#0F766E] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] motion-safe:animate-pulse"></span>
                  <span>Enterprise Recruitment Platform</span>
                </div>

                {/* Primary Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
                  Hire Smarter. <br />
                  <span className="text-[#0F766E]">Build Stronger Teams.</span>
                </h1>

                {/* Premium Animated Branding Tagline Badge Container */}
                <div className="pt-1 pb-1">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFFFF]/80 backdrop-blur-md border border-[#14B8A6]/40 shadow-xs motion-safe:animate-subtle-float max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                    <span
                      className={`text-sm sm:text-base font-medium text-[#0F766E] tracking-tight transition-all duration-500 ease-in-out inline-block ${
                        fadeState
                          ? 'opacity-100 translate-y-0 blur-0'
                          : 'opacity-0 -translate-y-1.5 blur-[2px]'
                      }`}
                      aria-live="polite"
                    >
                      {taglines[currentTaglineIndex]}
                    </span>
                  </div>
                </div>

                {/* Body Paragraph */}
                <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl font-normal">
                  TalentNest is an AI-powered Applicant Tracking System designed to help organizations manage recruitment, evaluate candidates intelligently, automate hiring workflows, and streamline collaboration between recruiters and interviewers.
                </p>

                {/* Hero Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    to="/hr-login"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]"
                  >
                    Start Hiring
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/careers"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-[#0F172A] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#14B8A6]/50 hover:bg-[#F8FAFC] rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-2xs"
                  >
                    Explore Careers
                  </Link>
                </div>
              </div>

              {/* Right Column: Modern Enterprise ATS UI Illustration */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-md lg:max-w-none bg-[#FFFFFF] p-6 rounded-[20px] border border-[#E2E8F0] shadow-sm space-y-5">

                  {/* Dashboard Header Bar Component */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-[#E2E8F0]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#E2E8F0]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#E2E8F0]"></div>
                      <span className="text-xs font-semibold text-[#475569] pl-2 border-l border-[#E2E8F0]">
                        Active Hiring Workspace
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-lg text-xs text-[#475569]">
                      <Search className="w-3.5 h-3.5" />
                      <span>Search applicants...</span>
                    </div>
                  </div>

                  {/* Card 1: Candidate Profile */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#FFFFFF] font-bold text-sm">
                        CP
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-[#0F172A]">Candidate Profile</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#0F766E]">
                            Senior Level
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5">Software Architecture & Infrastructure</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#475569] bg-[#FFFFFF] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  </div>

                  {/* Card 2: AI Resume Analysis */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#0F766E]">
                        <BrainCircuit className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Resume Analysis</span>
                      </div>
                      <span className="text-xs font-medium text-[#0F766E] bg-[#14B8A6]/10 px-2.5 py-0.5 rounded-full">
                        High Match Alignment
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#475569]">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Extracted core competencies and technical domain experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Automated skill gap comparison completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Hiring Pipeline Stages */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#0F172A]">
                        <GitMerge className="w-4 h-4 text-[#0F766E]" />
                        <span className="text-xs font-semibold">Hiring Pipeline Progress</span>
                      </div>
                      <span className="text-xs text-[#475569]">Stage 3 of 5</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <div className="h-2 rounded-full bg-[#0F766E]"></div>
                      <div className="h-2 rounded-full bg-[#0F766E]"></div>
                      <div className="h-2 rounded-full bg-[#14B8A6]"></div>
                      <div className="h-2 rounded-full bg-[#E2E8F0]"></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium text-[#475569]">
                      <span>Applied</span>
                      <span>Screened</span>
                      <span className="text-[#0F766E] font-semibold">Technical Evaluation</span>
                      <span>Offer</span>
                    </div>
                  </div>

                  {/* Card 4: Interview Schedule */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F766E]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A]">Technical Panel Interview</p>
                        <p className="text-xs text-[#475569]">System Architecture & Code Review</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-[#475569] bg-[#FFFFFF] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Scheduled</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="scroll-mt-28 py-20 md:py-28 bg-[#FFFFFF]">
          <div
            ref={featuresRef}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
              featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-[#0F766E] uppercase tracking-widest">
                Core Capabilities
              </h2>
              <p className="mt-3 text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                Enterprise-Grade Recruitment Intelligence
              </p>
              <p className="mt-4 text-base sm:text-lg text-[#475569]">
                Everything your organization needs to standardise evaluation, automate manual hiring tasks, and enforce governance across all departments.
              </p>
            </div>

            {/* Exactly 6 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={idx}
                    id={feature.title === 'Enterprise Security' ? 'security' : undefined}
                    className="group h-full bg-[#FFFFFF] p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
                  >
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                      <IconComponent className="w-6 h-6 stroke-[2]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#0F172A] tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-[#475569] leading-relaxed text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Solutions & Architecture Overview Section */}
        <section id="solutions" className="scroll-mt-28 py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div
            ref={solutionsRef}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
              solutionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs font-bold text-[#0F766E] uppercase tracking-widest">
                Built for Scale
              </h2>
              <p className="mt-3 text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                Solutions for Every Hiring Team
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="group bg-[#FFFFFF] p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-fit text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Enterprise Scalability</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Support high-volume recruitment across global branches with unified role controls, customized candidate workflows, and central administration.
                </p>
              </div>

              <div className="group bg-[#FFFFFF] p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-fit text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Collaborative Hiring</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Connect hiring managers, interviewers, and HR teams with synchronized evaluation rubrics, standardized notes, and automated notification loops.
                </p>
              </div>

              <div className="group bg-[#FFFFFF] p-8 rounded-[20px] border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-fit text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Structured Governance</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Ensure hiring compliance with structured interview kits, explicit role authorization matrices, and secure audit logging for every stage.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Dual Audience CTA Section (Employers & Candidates) */}
        <section id="get-started" className="scroll-mt-28 py-20 md:py-24 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div
            ref={ctaRef}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >

            {/* Section Heading & Subheading */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                Build Your Next Great Team with TalentNest
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed">
                TalentNest empowers organizations to hire exceptional talent while giving candidates a seamless platform to discover opportunities, apply with confidence, and track their recruitment journey.
              </p>
            </div>

            {/* Side-by-Side Dual Audience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* Card 1 – Employers */}
              <div className="group bg-[#FFFFFF] p-8 md:p-10 rounded-[20px] border border-[#E2E8F0] border-t-4 border-t-[#0F766E] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] w-fit group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                    <Briefcase className="w-7 h-7 stroke-[2]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#0F172A] tracking-tight">
                    Hiring Talent?
                  </h3>
                  <p className="mt-3 text-[#475569] leading-relaxed text-base">
                    Create job openings, manage applicants, evaluate resumes with AI, schedule interviews, and streamline recruitment from one intelligent platform.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E2E8F0]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Link
                    to="/hr-login"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-[#FFFFFF] bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]"
                  >
                    Start Hiring
                  </Link>
                  <Link
                    to="/hr-login"
                    className="inline-flex items-center justify-center text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] group/link py-2"
                  >
                    <span>HR Login</span>
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Card 2 – Candidates */}
              <div className="group bg-[#FFFFFF] p-8 md:p-10 rounded-[20px] border border-[#E2E8F0] border-t-4 border-t-[#14B8A6] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] w-fit group-hover:bg-[#0F766E] group-hover:text-[#FFFFFF] transition-colors duration-300">
                    <UserSearch className="w-7 h-7 stroke-[2]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#0F172A] tracking-tight">
                    Looking for Opportunities?
                  </h3>
                  <p className="mt-3 text-[#475569] leading-relaxed text-base">
                    Create your profile, upload your resume, discover jobs, apply online, and monitor every stage of your application from one dashboard.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E2E8F0]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Link
                    to="/candidate-login"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm transition-colors"
                  >
                    Start Applying
                  </Link>
                  <Link
                    to="/candidate-login"
                    className="inline-flex items-center justify-center text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] group/link py-2"
                  >
                    <span>Candidate Login</span>
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] pt-16 pb-12">
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
                <li>
                  <NavItem
                    link={{ name: 'Features', href: '#features', type: 'scroll' }}
                    className="text-[#475569] hover:text-[#0F766E] transition-colors"
                  />
                </li>
                <li>
                  <NavItem
                    link={{ name: 'Solutions', href: '#solutions', type: 'scroll' }}
                    className="text-[#475569] hover:text-[#0F766E] transition-colors"
                  />
                </li>
                <li>
                  <NavItem
                    link={{ name: 'Enterprise Security', href: '#security', type: 'scroll' }}
                    className="text-[#475569] hover:text-[#0F766E] transition-colors"
                  />
                </li>
              </ul>
            </div>

            {/* Platform Column */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/hr-login" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    HR Portal
                  </Link>
                </li>
                <li>
                  <Link to="/candidate-login" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    Candidate Hub
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    Careers Board
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Company</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-[#475569] hover:text-[#0F766E] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
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
