import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hrLogin } from "../../services/authService";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  BrainCircuit, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

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

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function HRLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

 const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};

  if (!email) {
    newErrors.email = "Company email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = "Please enter a valid company email";
  }

  if (!password) {
    newErrors.password = "Password is required";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setIsLoading(true);

  try {
    const data = await hrLogin(email, password);

    // Save JWT token
    localStorage.setItem("access_token", data.access_token);

    // Optional: save company email
    localStorage.setItem("hr_email", email);

    // Success message
    alert("Login Successful!");

    // Redirect
    navigate("/hr-dashboard");
  } catch (error) {
    console.error(error);

    if (error.response) {
      alert(error.response.data.detail || "Invalid email or password");
    } else {
      alert("Unable to connect to the server.");
    }
  } finally {
    setIsLoading(false);
  }
};
  const featureCards = [
    {
      icon: FileText,
      title: 'AI Resume Screening',
      description: 'Automatically extract structured candidate information using AI.',
    },
    {
      icon: BrainCircuit,
      title: 'Candidate Evaluation',
      description: 'Generate intelligent hiring recommendations and skill analysis.',
    },
    {
      icon: Calendar,
      title: 'Interview Workflow',
      description: 'Schedule interviews and manage recruitment stages effortlessly.',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      description: 'JWT authentication, role-based access, and encrypted storage.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-[#0F172A] antialiased flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-teal-700/10 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/40 blur-3xl" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 my-auto">
        
        {/* 1. Top-Left Premium Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-sm text-xs font-semibold text-[#0F172A] hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all duration-300 ease-out hover:-translate-x-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE (55%) */}
          <div className="space-y-8 text-left transition-all duration-300">
            
            {/* Branding Header */}
            <div className="space-y-4">
              <Link 
                to="/" 
                className="group inline-flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-teal-700 rounded-xl p-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md group-hover:bg-teal-600 transition-all duration-300 transform group-hover:scale-105">
                  <TalentNestLogo className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-teal-700 transition-colors">
                  TalentNest
                </span>
              </Link>

              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E2E8F0] text-xs font-semibold text-teal-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Enterprise AI Recruitment Platform
                </span>
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Welcome Back
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl font-normal">
                Manage hiring pipelines, automate recruitment, evaluate candidates using AI, and collaborate with your HR teams.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {featureCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E2E8F0] text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="mt-3.5 text-base font-bold text-[#0F172A] tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT SIDE (45%) */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-[#E2E8F0] rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
              
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-700 to-teal-500" />

              {/* 2. Card Header using Official TalentNest Logo */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md">
                  <TalentNestLogo className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    HR Portal Login
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 font-medium">
                    Secure access for recruitment managers.
                  </p>
                </div>
              </div>

              {/* Form & Spacing Modifications */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label htmlFor="hr-email" className="block text-xs font-semibold text-[#0F172A]">
                    Company Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] group-focus-within:text-teal-700 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="hr-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border text-sm text-[#0F172A] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-300 ${
                        errors.email ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-red-600 pl-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="hr-password" className="block text-xs font-semibold text-[#0F172A]">
                      Password
                    </label>
                
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] group-focus-within:text-teal-700 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="hr-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border text-sm text-[#0F172A] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-300 ${
                        errors.password ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-red-600 pl-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-0.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-700 bg-[#F8FAFC] border-[#E2E8F0] rounded focus:ring-teal-700 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 text-xs text-[#64748B] font-medium cursor-pointer select-none">
                    Remember my credentials
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-800 hover:to-teal-600 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to HR Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 3 & 4. Google Sign In, OR Divider & Improved Spacing */}
    

              </form>

              {/* 4. Improved Spacing for Bottom Links */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center space-y-4">
                <div className="inline-flex items-center space-x-1.5 text-xs text-[#64748B]">
                
                </div>

              <div>
  <Link
    to="/request-hr-access"
    className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none"
  >
    New to TalentNest?{" "}
    <span className="text-teal-700 font-semibold hover:underline">
      Request HR Access
    </span>
  </Link>
</div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-[#E2E8F0] bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} TalentNest Inc. Enterprise Recruitment Governance.</p>
          <div className="flex items-center space-x-6 font-medium">
            <Link to="/privacy-policy" className="hover:text-teal-700 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-teal-700 transition-colors">System Support</Link>
            <span className="inline-flex items-center text-teal-700">
              <Sparkles className="w-3 h-3 mr-1" />
              v2.4.0 High-Security Mode
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}