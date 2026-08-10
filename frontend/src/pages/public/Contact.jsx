import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  Building2,
  Wrench,
  Users2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Globe,
  Briefcase
} from 'lucide-react';
import { FaGithub } from "react-icons/fa";
export default function Contact() {
  const navigate = useNavigate();

  // Scroll to top on initial render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Company Contact Grid Data
  const companyContacts = [
    {
      icon: Mail,
      title: "Email",
      value: "sales@digitalsofts.pk",
      href: "mailto:sales@digitalsofts.pk",
      subtext: "For official business inquiries"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "0321 8661765",
      href: "tel:03218661765",
      subtext: "Direct office helpline"
    },
    {
      icon: MapPin,
      title: "Office Location",
      value: "Ground Floor, Sitara Techno Park",
      subtext: "Canal Road, Faisalabad, Pakistan"
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "Monday – Friday",
      subtext: "9:00 AM – 6:00 PM (PKT)"
    }
  ];

  // Developer Details Array
  const developerDetails = [
    {
      icon: Mail,
      label: "Email",
      value: "hareematif2007@gmail.com",
      href: "mailto:hareematif2007@gmail.com",
      isLink: true
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+92 324 4007564",
      href: "tel:+92344007564",
      isLink: true
    },
    {
icon: FaGithub,
      label: "GitHub",
      value: "github.com/GearAndCode",
      href: "https://github.com/GearAndCode",
      isLink: true
    },
    {
      icon: Briefcase,
      label: "Current Role",
      value: "DigitalSofts Internee",
isLink: false    },
    {
      icon: Sparkles,
      label: "Availability",
      value: "Freelance & AI Projects",
isLink: false    }
  ];

  // Why Contact Us Grid Data
  const inquiryTypes = [
    {
      icon: Building2,
      badge: "Enterprise",
      title: "Business Inquiry",
      description: "For organizations, recruitment agencies, and enterprises interested in deploying TalentNest to streamline candidate evaluation."
    },
    {
      icon: Wrench,
      badge: "Support",
      title: "Technical Support",
      description: "Questions about architecture, API integration, vector models, FastAPI setup, or system deployment configurations."
    },
    {
      icon: Users2,
      badge: "Partnership",
      title: "Collaboration",
      description: "Interested in working together on artificial intelligence, full-stack web applications, or innovative software projects."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative overflow-hidden">
      
      {/* BACKGROUND RADIAL GLOW & FLOATING BLURRED CIRCLES */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[750px] pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-slate-50/30 to-slate-50" />
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-teal-200/20 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute top-[250px] left-10 w-72 h-72 bg-teal-300/10 blur-[100px] rounded-full" />
        <div className="absolute top-[300px] right-10 w-80 h-80 bg-slate-200/50 blur-[120px] rounded-full" />
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-20">

        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold tracking-wide uppercase shadow-sm hover:scale-105 hover:bg-teal-100/70 transition-all duration-300 cursor-default">
            <MessageSquare className="w-3.5 h-3.5 text-teal-600 animate-bounce" />
            <span>💬 Let's Connect</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Contact <span className="text-teal-700">Us</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            We'd love to hear from you. Whether you're interested in TalentNest, want to collaborate, or have project inquiries, we're always happy to connect.
          </p>
        </section>

        {/* ====================================================
            COMPANY CONTACT SECTION (DigitalSofts)
            ==================================================== */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8 relative overflow-hidden">
            
            {/* Header Title */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Contact DigitalSofts
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                The software enterprise behind TalentNest.
              </p>
            </div>

            {/* 4 Interactive Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {companyContacts.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1.5 hover:border-teal-200 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all duration-300">
                        <IconComp className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          {item.title}
                        </span>
                        {item.href ? (
                          <a 
                            href={item.href}
                            className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors block truncate"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div className="font-bold text-slate-900 text-sm leading-snug">
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
                      {item.subtext}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Premium CTA Button */}
            <div className="pt-4 text-center">
            <a
href="https://mail.google.com/mail/?view=cm&fs=1&to=sales@digitalsofts.pk&su=TalentNest%20Inquiry"
target="_blank"
rel="noopener noreferrer"
  target="_self"
  rel="noopener noreferrer"
  className="relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 hover:from-teal-800 hover:to-teal-800 text-white font-semibold text-base shadow-md shadow-teal-900/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group"
>
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
                <Mail className="w-5 h-5 transition-transform group-hover:rotate-12" />
                <span>Contact DigitalSofts</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

          </div>
        </section>

        {/* ELEGANT CENTERED DIVIDER */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center">
          <div className="w-full border-t border-slate-200/80" />
          <span className="absolute px-4 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-200/80 rounded-full py-1">
            Or Get in Touch with the Developer
          </span>
        </div>

        {/* ====================================================
            DEVELOPER SECTION (Portfolio Feature Card)
            ==================================================== */}
        <section className="max-w-5xl mx-auto">
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            
            {/* Soft Floating Teal Glow Background Decoration */}
            <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-96 h-96 bg-teal-100/50 blur-[110px] rounded-full pointer-events-none -z-0 animate-pulse" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* LEFT COLUMN: ANIMATED AVATAR & STATUS */}
              <div className="lg:col-span-5 flex flex-col items-center text-center space-y-6">
                
                {/* Avatar with Rotating Ring */}
                <div className="relative">
                  {/* Outer Rotating Glowing Ring */}
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-teal-600 via-teal-400 to-emerald-500 animate-[spin_8s_linear_infinite] opacity-70 blur-xs" />
                  
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white">
                      <User className="w-20 h-20 sm:w-24 sm:h-24 text-slate-400 transition-transform duration-500 hover:scale-110" />
                    </div>
                  </div>
                </div>

                {/* Animated Status Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>Available for Projects</span>
                </div>

              </div>

              {/* RIGHT COLUMN: BIO, BADGES, CONTACTS & BUTTONS */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                    Meet the Developer
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Hareem Atif
                    </h3>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                      DigitalSofts Internee
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                      Software Developer
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                      AI Developer
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
                    Hello! I'm <strong>Hareem Atif</strong>, a Computer Science student and Software Developer passionate about building modern AI-powered applications. I enjoy creating intelligent web systems, beautiful user experiences, and scalable full-stack solutions using React, FastAPI, PostgreSQL, and Artificial Intelligence.
                  </p>
                  
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    TalentNest reflects my passion for combining AI with modern recruitment technology to simplify hiring and improve candidate evaluation. I'm always excited to learn new technologies and collaborate on innovative software projects.
                  </p>
                </div>

                {/* Developer Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {developerDetails.map((detail, idx) => {
                    const IconComp = detail.icon;
                    return (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 hover:bg-white hover:shadow-xs transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">
                            {detail.label}
                          </div>
                          {detail.isLink ? (
                         <a
  href={detail.href}
  target={detail.href?.startsWith("http") ? "_blank" : "_self"}
  rel={detail.href?.startsWith("http") ? "noopener noreferrer" : ""}
  className="text-xs font-bold text-teal-700 hover:underline truncate flex items-center gap-1"
>
  <span className="truncate">{detail.value}</span>

  {detail.href?.startsWith("http") && (
    <ExternalLink className="w-3 h-3 shrink-0 inline" />
  )}
</a>
                          ) : (
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {detail.value}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Developer Call-to-Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
               <a
href="https://mail.google.com/mail/?view=cm&fs=1&to=hareematif2007@gmail.com&su=Project%20Inquiry"
target="_blank"
rel="noopener noreferrer"  target="_self"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-900/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
>
                    <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>Email Developer</span>
                  </a>

                  <a
                    href="https://github.com/GearAndCode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                  >
<FaGithub className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ====================================================
            WHY CONTACT US SECTION
            ==================================================== */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Why Reach Out?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Select the option that best describes your inquiry so we can route you to the right channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inquiryTypes.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1.5 hover:border-teal-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all duration-300">
                        <IconComp className="w-6 h-6 transition-transform group-hover:rotate-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        {card.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
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