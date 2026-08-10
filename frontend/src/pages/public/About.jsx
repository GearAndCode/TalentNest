import { FaGithub } from "react-icons/fa";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Database,
  ShieldCheck,
  FileText,
  UserCheck,
  Layers,
  Code2,
  Server,
  Zap,
  Globe,
  Mail,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Terminal,
  Activity,
  Briefcase,
  User,
  MapPin,
  Send,
  Building2,
  Lock,
  Search,
  Check
} from "lucide-react";
export default function About() {
  const navigate = useNavigate();

  // Scroll to top on render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Capability Cards Data
  const capabilities = [
    {
      icon: FileText,
      title: "AI Resume Parsing",
      badge: "Extraction Engine",
      description: "Extracts structured metadata from unstructured PDF, DOCX, and plain text resume files with high precision.",
      features: [
        "PDF & DOCX document parsing",
        "Automated skill & framework extraction",
        "Education & certification detection",
        "Work experience timeline extraction",
        "Project portfolio parsing",
        "Deep semantic document understanding"
      ]
    },
    {
      icon: Cpu,
      title: "AI Candidate Evaluation",
      badge: "Semantic Matching",
      description: "Utilizes vector embeddings to match resumes with job requirements based on contextual meaning rather than keywords.",
      features: [
        "Sentence Transformers embeddings",
        "Contextual semantic similarity scoring",
        "Local Llama 3.2 AI recruiter analysis",
        "Automated candidate summary synthesis",
        "Transferable skill & gap identification",
        "Targeted interview question generation"
      ]
    },
    {
      icon: Layers,
      title: "Recruitment Management",
      badge: "Workflow Automation",
      description: "Streamlines end-to-end talent acquisition pipelines for recruiters, hiring managers, and enterprise teams.",
      features: [
        "Corporate workspace & company setup",
        "Dynamic job opening creation",
        "Applicant tracking & status pipelines",
        "Ranked candidate shortlists",
        "Recruiter review notes & evaluation",
        "Real-time applicant analytics"
      ]
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      badge: "Zero Trust Architecture",
      description: "Enforces strict technical safeguards and access controls across candidate data and corporate infrastructure.",
      features: [
        "Stateless JWT token authentication",
        "Role-Based Access Control (RBAC)",
        "PostgreSQL encrypted data stores",
        "Secure REST API endpoints",
        "TLS 1.3 & AES-256 data protection",
        "Compliant resume storage policies"
      ]
    }
  ];

  // Architecture Timeline Steps
  const architectureSteps = [
    {
      step: "01",
      title: "Frontend Interface",
      subtitle: "React & Tailwind CSS",
      icon: Laptop,
      description: "Responsive, glassmorphic UI built with React, Vite, and Tailwind CSS for seamless recruiter workflows."
    },
    {
      step: "02",
      title: "REST API Gateway",
      subtitle: "Async Request Handler",
      icon: Terminal,
      description: "High-throughput RESTful endpoints managing authentication, document uploads, and candidate payloads."
    },
    {
      step: "03",
      title: "FastAPI Backend",
      subtitle: "Python Core Service",
      icon: Server,
      description: "Asynchronous Python engine driving core application business logic, ORM models, and route controllers."
    },
    {
      step: "04",
      title: "AI Inference Engine",
      subtitle: "Embeddings & Llama 3.2",
      icon: Cpu,
      description: "Vector embedding models calculating semantic similarity paired with local Ollama Llama 3.2 analysis."
    },
    {
      step: "05",
      title: "Database Infrastructure",
      subtitle: "PostgreSQL & SQLAlchemy",
      icon: Database,
      description: "Relational database schema storing encrypted user credentials, job profiles, and candidate vector indexes."
    }
  ];

  // Tech Stack Grid Items
  const techStack = [
    { name: "React", category: "Frontend Framework", icon: Code2, desc: "Component UI" },
    { name: "Vite", category: "Build Tool", icon: Zap, desc: "Lightning Fast Bundler" },
    { name: "Tailwind CSS", category: "Styling Engine", icon: Layers, desc: "Utility-First CSS" },
    { name: "FastAPI", category: "Backend Framework", icon: Server, desc: "Async Python Web API" },
    { name: "Python", category: "Core Language", icon: Terminal, desc: "AI & Backend Logic" },
    { name: "PostgreSQL", category: "Database", icon: Database, desc: "Relational Data Store" },
    { name: "SQLAlchemy", category: "ORM Layer", icon: Activity, desc: "Database Abstraction" },
    { name: "JWT Auth", category: "Security", icon: Lock, desc: "Stateless Tokens" },
    { name: "Sentence Transformers", category: "AI Vector Engine", icon: Cpu, desc: "Semantic Embeddings" },
    { name: "Ollama (Llama 3.2)", category: "Local LLM", icon: Sparkles, desc: "Recruiter Analysis" },
    { name: "REST APIs", category: "Communication", icon: Globe, desc: "Standard JSON Endpoints" },
{ name: "GitHub", category: "Version Control", icon: FaGithub, desc: "CI/CD & Repository" }  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative overflow-hidden">
      
      {/* BACKGROUND RADIAL GLOW (Copy of landing page background setup) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-slate-50/30 to-slate-50" />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-teal-200/20 blur-[130px] rounded-full" />
      </div>

      {/* ====================================================
          HEADER COMPONENT (Clean Internal Version)
          ==================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 group"
            aria-label="Return to home page"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* ====================================================
          MAIN CONTENT AREA
          ==================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-24">

        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            About TalentNest
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Building the Future of <span className="text-teal-700">AI Recruitment</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            TalentNest is an enterprise-grade AI-powered Applicant Tracking System built to automate recruitment, intelligently evaluate candidates, streamline hiring workflows, and help organizations hire faster with confidence.
          </p>

          {/* STATS HIGHLIGHT ROWS */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "AI Resume Parsing", val: "PDF / DOCX" },
              { label: "Semantic Matching", val: "Vector Models" },
              { label: "Candidate Ranking", val: "Real-time" },
              { label: "Interview Focus", val: "AI Generated" },
              { label: "Dashboard Insights", val: "Analytics" },
              { label: "JWT Authentication", val: "Role-Based" },
              { label: "Responsive UI", val: "Tailwind CSS" },
              { label: "Architecture", val: "FastAPI + React" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-center"
              >
                <div className="text-base sm:text-lg font-bold text-teal-700">{stat.val}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT THE PLATFORM (CAPABILITIES GRID) */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Platform Capabilities
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Engineered with advanced artificial intelligence and scalable backend architecture to automate modern talent pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {capabilities.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SYSTEM ARCHITECTURE TIMELINE */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              System Architecture
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              End-to-end data flow from client interactions down to vector processing and database persistence.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
              {architectureSteps.map((arch, idx) => {
                const IconComp = arch.icon;
                return (
                  <div key={idx} className="relative flex flex-col items-center text-center space-y-4 group">
                    
                    {/* Step Icon Container */}
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 relative z-10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <IconComp className="w-7 h-7" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                        {arch.step}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base">{arch.title}</h4>
                      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{arch.subtitle}</p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                      {arch.description}
                    </p>

                    {/* Connecting Indicator for Desktop */}
                    {idx < architectureSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-slate-200 -z-0">
                        <div className="w-2 h-2 rounded-full bg-teal-600 absolute right-0 -top-0.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TECH STACK GRID */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Technology Stack
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Powered by industry-standard frameworks, libraries, and machine learning infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech, idx) => {
              const IconComp = tech.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{tech.name}</h4>
                    <p className="text-[11px] font-semibold text-teal-700 truncate">{tech.category}</p>
                    <p className="text-[11px] text-slate-500 truncate">{tech.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROJECT INFORMATION (GLASS CARD) */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Project Specification</h3>
                <p className="text-xs text-slate-500">Core parameters and application details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Project Name", val: "TalentNest ATS" },
                { label: "Category", val: "Enterprise AI Recruitment Platform" },
                { label: "Type", val: "Full Stack Web Application" },
                { label: "Target Audience", val: "Recruitment & HR Teams" },
                { label: "Core Technology", val: "Artificial Intelligence & Fast API" },
                { label: "Developed By", val: "DigitalSofts" }
              ].map((info, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{info.label}</div>
                  <div className="font-bold text-slate-900 text-sm">{info.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MEET THE DEVELOPER (PORTFOLIO HIGHLIGHT CARD) */}
        <section className="max-w-5xl mx-auto">
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            
            {/* Subtle Gradient Glow in Corner */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 blur-[90px] rounded-full pointer-events-none -z-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* LEFT COLUMN: AVATAR & BADGES */}
              <div className="lg:col-span-5 flex flex-col items-center text-center space-y-6">
                
                {/* Developer Avatar Container */}
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 p-1.5 shadow-xl shadow-teal-900/10">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white">
                      <User className="w-20 h-20 sm:w-24 sm:h-24 text-slate-400" />
                    </div>
                  </div>
                  
                  {/* Glowing Status Dot */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Role Titles */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Hareem Atif</h3>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                      Software Developer
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                      AI Developer
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Full Stack
                    </span>
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Available for Collaboration
                </div>

              </div>

              {/* RIGHT COLUMN: BIO & CONTACT DETAILS */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                    Meet the Developer
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Passionate about intelligent software & modern web systems.
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Hello! I'm <strong className="text-slate-900">Hareem Atif</strong>, a Computer Science student passionate about building modern AI-powered software solutions. I enjoy developing scalable web applications, intelligent automation systems, and clean user experiences. TalentNest reflects my passion for combining Artificial Intelligence with modern recruitment technologies to solve real-world hiring challenges.
                  </p>
                </div>

                {/* Developer Metadata Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Email</div>
                      <a href="mailto:hareematif2007@gmail.com" className="text-xs font-bold text-teal-700 hover:underline truncate block">
                        hareematif2007@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <FaGithub className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">GitHub Profile</div>
                      <a 
                        href="https://github.com/GearAndCode" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 truncate"
                      >
                        github.com/GearAndCode
                        <ExternalLink className="w-3 h-3 inline shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Location</div>
                      <div className="text-xs font-bold text-slate-900">Pakistan</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Status</div>
                      <div className="text-xs font-bold text-slate-900">Open for Opportunities</div>
                    </div>
                  </div>

                </div>

                {/* Call to Action Button */}
                <div className="pt-2">
                  <a
                    href="mailto:hareematif2007@gmail.com"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-900/20 hover:shadow-lg transition-all duration-200 group"
                  >
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span>Let's Work Together</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ====================================================
          FOOTER COMPONENT
          ==================================================== */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-medium text-slate-500 text-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TalentNest</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">Project by DigitalSofts</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div>
            © 2026 TalentNest AI Platform. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}