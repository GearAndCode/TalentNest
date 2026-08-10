import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Cpu, 
  Server, 
  Lock, 
  UserCheck, 
  Cookie, 
  Layers,
  Clock,
  Database,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

// ====================================================
// MAIN PRIVACY POLICY COMPONENT
// ====================================================
export default function PrivacyPolicy() {
  const navigate = useNavigate();

  // Scroll to top on render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Section Data Configuration
  const sections = [
    {
      id: "introduction",
      num: "01",
      icon: Shield,
      title: "Introduction",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-base">
          <p>
            Welcome to TalentNest AI Inc. ("TalentNest," "we," "our," or "us"). We provide an enterprise-grade, AI-powered Applicant Tracking System (ATS) designed to streamline recruitment, improve candidate matching, and optimize talent acquisition workflows.
          </p>
          <p>
            This Privacy Policy outlines how we collect, process, secure, and manage personal data provided by candidates, recruiters, and corporate clients. By accessing or using the TalentNest platform, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>
      )
    },
    {
      id: "information-collected",
      num: "02",
      icon: FileText,
      title: "Information We Collect",
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            To deliver precision recruitment scoring and administrative tools, TalentNest processes specific categories of personal and organizational data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span> Candidate Information
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Full name, contact details, work history, educational background, certifications, uploaded resume files, portfolios, and job preference parameters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span> Company Information
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiter contact details, corporate domain metadata, job descriptions, evaluation criteria, hiring manager notes, and recruitment workflow configurations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span> Usage Information
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Platform feature interactions, application status updates, search parameters, audit logs, timestamped user actions, and session performance metrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span> Device Information
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                IP addresses, browser client signatures, operating system specs, authorization headers, and access session security tokens.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "resume-processing",
      num: "03",
      icon: Database,
      title: "Resume Processing & Semantic Embeddings",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            When a resume is submitted to TalentNest, it passes through our secure data extraction and indexing pipeline:
          </p>
          <ul className="space-y-3">
            {[
              { title: "Document Parsing", desc: "Extracting raw structured text from PDF, DOCX, and plain text uploads." },
              { title: "Attribute Categorization", desc: "Isolating work history, verified education, projects, technical skills, and certifications." },
              { title: "Semantic Embedding Generation", desc: "Converting structured text into high-dimensional numerical vectors using Sentence Transformers to compute job-resume context alignment without relying on rigid keyword matching." },
              { title: "Match Calculation", desc: "Comparing candidate vector profiles against verified job requirement vectors to determine semantic similarity scores." }
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-medium">{item.title}:</strong> {item.desc}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "artificial-intelligence",
      num: "04",
      icon: Cpu,
      title: "Artificial Intelligence & Automated Analysis",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            TalentNest utilizes local and cloud-hosted Large Language Models (including Llama 3.2 and specialized transformer pipelines) strictly for analytical assistance. The AI generates candidate evaluation summaries, targeted interview questions, transferable skill mappings, and gap identification.
          </p>
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 text-teal-950 font-medium text-sm flex items-center gap-3">
            <Shield className="w-5 h-5 text-teal-700 shrink-0" />
            <span>
              <strong>Human-in-the-Loop Safeguard:</strong> TalentNest AI acts solely as an analytical co-pilot for talent acquisition teams. The platform does NOT execute automated hiring decisions, rejections, or offer issuances without explicit recruiter oversight.
            </span>
          </div>
        </div>
      )
    },
    {
      id: "how-we-use-information",
      num: "05",
      icon: Briefcase,
      title: "How We Use Information",
      content: (
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed mb-2">
            We use collected information exclusively to fulfill legitimate business and recruitment objectives:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Matching candidates to relevant job vacancies semantically",
              "Continuously training and evaluating core ATS matching algorithms",
              "Facilitating interview scheduling and candidate communication",
              "Enabling collaboration between hiring managers and recruiters",
              "Maintaining system security, audit history, and service integrity",
              "Generating anonymized enterprise workforce analytics"
            ].map((purpose, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                {purpose}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "data-security",
      num: "06",
      icon: Lock,
      title: "Data Security & Enterprise Controls",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            TalentNest enforces strict technical and organizational safeguards to prevent unauthorized access, data alteration, disclosure, or destruction:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-teal-700 font-bold text-base">AES-256 & TLS 1.3</div>
              <p className="text-xs text-slate-500">Encryption at rest and in transit</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-teal-700 font-bold text-base">JWT & RBAC</div>
              <p className="text-xs text-slate-500">Strict role-based access tokens</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-teal-700 font-bold text-base">Audit Logging</div>
              <p className="text-xs text-slate-500">Comprehensive system activity logs</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "candidate-rights",
      num: "07",
      icon: UserCheck,
      title: "Candidate Rights & Privacy Controls",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Candidates whose resumes are stored or processed within TalentNest maintain full autonomy over their personal identifiers and data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Right to Access", desc: "Request a complete copy of all indexed profile data." },
              { label: "Right to Rectification", desc: "Update or correct outdated professional and personal details." },
              { label: "Right to Erasure", desc: "Request permanent removal of candidate resumes and vector embeddings." },
              { label: "Consent Withdrawal", desc: "Revoke authorization for AI semantic processing at any time." }
            ].map((right, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-900 text-sm mb-1">{right.label}</div>
                <div className="text-xs text-slate-600 leading-normal">{right.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "cookies",
      num: "08",
      icon: Cookie,
      title: "Cookies & Session Management",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            TalentNest uses essential cookies and secure session tokens to enable secure authentication, maintain recruiter workspace states, prevent cross-site request forgery, and retain system preferences. We do not utilize intrusive third-party cross-site advertising trackers.
          </p>
        </div>
      )
    },
    {
      id: "third-party-services",
      num: "09",
      icon: Layers,
      title: "Third-Party Infrastructure Services",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            To deliver high-availability enterprise services, TalentNest partners with SOC-2 compliant third-party infrastructure providers. Key components include:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "PostgreSQL Database Clusters",
              "OpenAI Embedding API Services",
              "Local Ollama Inference Nodes",
              "AWS Encrypted Cloud Storage",
              "Redis Token Cache"
            ].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative overflow-hidden">
      
      {/* BACKGROUND RADIAL GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-slate-50/30 to-slate-50" />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-200/20 blur-[120px] rounded-full" />
      </div>

      {/* ====================================================
          HEADER COMPONENT
          ==================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 group"
            aria-label="Return to landing page"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* ====================================================
          MAIN CONTENT AREA
          ==================================================== */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            Enterprise Privacy
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            TalentNest is committed to protecting candidate, recruiter, and company information while providing transparent AI-powered recruitment services.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Last Updated: August 2026</span>
          </div>
        </section>

        {/* POLICY CARDS LIST */}
        <section className="space-y-6">
          {sections.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <article
                key={sec.id}
                id={sec.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-teal-700 tracking-widest uppercase bg-teal-50 border border-teal-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    Section {sec.num}
                  </span>
                </div>

                {sec.content}
              </article>
            );
          })}
        </section>

      </main>

      {/* ====================================================
          FOOTER COMPONENT
          ==================================================== */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TalentNest</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">Privacy Policy</span>
            <span className="ml-2">© 2026 TalentNest. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}