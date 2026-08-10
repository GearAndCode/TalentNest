import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  FileText, 
  Compass, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  HelpCircle,
  UserPlus,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';

/* --- Official TalentNest Logo Component --- */
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

/* --- Google Logo SVG --- */
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function CandidateLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot-password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error(
        'Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in the frontend .env file.'
      );
      return;
    }

    if (window.google?.accounts?.id) return;

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Do not remove the global Google script because the page may remount.
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/candidate-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.detail ||
          'Unable to sign in. Please check your email and password.';

        if (response.status === 403) {
          setErrors({
            email: 'Please verify your email before logging in.',
          });
        } else if (response.status === 401) {
          setErrors({
            password: 'Invalid email or password.',
          });
        } else {
          setErrors({
            email: message,
          });
        }

        return;
      }

      // Save authentication data for the candidate portal.
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem('candidate_token', data.access_token);
      storage.setItem(
        'candidate',
        JSON.stringify(data.candidate)
      );
      storage.setItem('candidate_session_email', data.candidate.email);

      // If the user previously logged in with the other storage type,
      // remove the old session so only the current login is active.
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('candidate_token');
      otherStorage.removeItem('candidate');
      otherStorage.removeItem('candidate_session_email');

      // Backend uses /dashboard for the candidate portal.
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Candidate login error:', error);

      setErrors({
        email:
          'Cannot connect to TalentNest backend. Make sure the FastAPI server is running on port 8000.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setErrors({
        email:
          'Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in the frontend .env file.',
      });
      return;
    }

    setErrors({});
    setIsGoogleLoading(true);

    const startGooglePrompt = () => {
      if (!window.google?.accounts?.id) {
        setIsGoogleLoading(false);
        setErrors({
          email:
            'Google Sign-In could not load. Check your internet connection and Google Client ID.',
        });
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            if (!response?.credential) {
              throw new Error('Google did not return a credential.');
            }

            const apiResponse = await fetch(
              'http://127.0.0.1:8000/candidate-auth/google',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  credential: response.credential,
                }),
              }
            );

            const data = await apiResponse.json();

            if (!apiResponse.ok) {
              throw new Error(
                data?.detail || 'Unable to sign in with Google.'
              );
            }

            const storage = rememberMe ? localStorage : sessionStorage;

            storage.setItem('candidate_token', data.access_token);
            storage.setItem(
              'candidate',
              JSON.stringify(data.candidate)
            );
            storage.setItem(
              'candidate_session_email',
              data.candidate.email
            );

            const otherStorage = rememberMe
              ? sessionStorage
              : localStorage;

            otherStorage.removeItem('candidate_token');
            otherStorage.removeItem('candidate');
            otherStorage.removeItem('candidate_session_email');

            navigate('/dashboard', { replace: true });
          } catch (error) {
            console.error('Google candidate login error:', error);
            setErrors({
              email:
                error?.message ||
                'Unable to sign in with Google. Please try again.',
            });
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (
          notification.isNotDisplayed?.() ||
          notification.isSkippedMoment?.()
        ) {
          setIsGoogleLoading(false);
          setErrors({
            email:
              'Google sign-in could not be displayed. Please try again or use email and password.',
          });
        }
      });
    };

    if (window.google?.accounts?.id) {
      startGooglePrompt();
      return;
    }

    // Give the GIS script a short time to initialize.
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (window.google?.accounts?.id) {
        window.clearInterval(timer);
        startGooglePrompt();
      } else if (attempts >= 40) {
        window.clearInterval(timer);
        setIsGoogleLoading(false);
        setErrors({
          email:
            'Google Sign-In could not load. Check your internet connection and Google Client ID.',
        });
      }
    }, 100);

    return () => window.clearInterval(timer);
  };


  const openForgotPassword = () => {
    setForgotEmail(email.trim());
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
    setForgotOpen(true);
  };

  const closeForgotPassword = () => {
    if (forgotLoading) return;
    setForgotOpen(false);
    setForgotError('');
    setForgotSuccess('');
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/candidate-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || 'Unable to send the reset code.');
      }
      setForgotStep(2);
      setForgotSuccess('A password reset code has been sent to your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotError(error?.message || 'Unable to connect to TalentNest backend.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!/^\d{6}$/.test(resetOtp.trim())) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/candidate-auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: resetOtp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || 'Invalid or expired reset code.');
      }
      setForgotStep(3);
      setForgotSuccess('Code verified. Create your new password.');
    } catch (error) {
      console.error('Reset OTP verification error:', error);
      setForgotError(error?.message || 'Unable to verify the reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword.length < 6) {
      setForgotError('Your new password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/candidate-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || 'Unable to reset your password.');
      }
      setForgotStep(4);
      setForgotSuccess(data?.message || 'Your password has been reset successfully.');
    } catch (error) {
      console.error('Reset password error:', error);
      setForgotError(error?.message || 'Unable to reset your password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const candidateBenefits = [
    {
      icon: Sparkles,
      title: 'AI Job Matching',
      description: 'Receive personalized job recommendations based on your skills and experience.',
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create and improve your resume using AI-powered suggestions.',
    },
    {
      icon: Compass,
      title: 'Application Tracker',
      description: 'Track every application from submission to final hiring decision.',
    },
    {
      icon: TrendingUp,
      title: 'Career Insights',
      description: 'Get personalized recommendations to strengthen your profile and improve hiring chances.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-[#0F172A] antialiased flex flex-col justify-between selection:bg-[#14B8A6] selection:text-white relative overflow-hidden">
      
      {/* Background Orbs & Pattern Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Teal Radial Gradients */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#14B8A6]/10 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#0F766E]/10 blur-[160px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-white/50 blur-3xl" />
        
        {/* Subtle Dotted Matrix Background */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Tiny Floating Light Particles */}
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-[#14B8A6]/40 blur-[1px] animate-pulse" />
        <div className="absolute top-2/3 left-1/12 w-3 h-3 rounded-full bg-[#0F766E]/30 blur-[2px]" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#14B8A6]/50 blur-[1px]" />
        <div className="absolute bottom-1/4 right-1/12 w-2.5 h-2.5 rounded-full bg-[#0F766E]/30 blur-[1.5px] animate-pulse" />
      </div>

      {/* Main Layout Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 my-auto">
        
        {/* Top-Left Back Button */}
        <div className="mb-6 lg:mb-8">
          <Link
            to="/"
            className="group inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-sm text-xs font-semibold text-[#0F172A] hover:bg-[#14B8A6]/10 hover:border-[#14B8A6]/30 hover:text-[#0F766E] transition-all duration-300 ease-out hover:-translate-x-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F766E] transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* 60/40 Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
          
          {/* LEFT HERO SECTION (60%) */}
          <div className="space-y-8 text-left">
            
            {/* Branding & Badge */}
            <div className="space-y-4">
              <Link 
                to="/" 
                className="group inline-flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-2xl p-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-md group-hover:bg-[#14B8A6] transition-all duration-300 transform group-hover:scale-105">
                  <TalentNestLogo className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0F766E] transition-colors">
                  TalentNest
                </span>
              </Link>

              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] text-xs font-semibold text-[#0F766E] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
                  AI Recruitment Platform
                </span>
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Start Your Career Journey.
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl font-normal">
                Discover AI-powered job recommendations, apply to exciting opportunities, build your professional profile, and track every stage of your application—all in one intelligent platform.
              </p>
            </div>

            {/* Candidate Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {candidateBenefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#14B8A6] hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="mt-3.5 text-base font-bold text-[#0F172A] tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT SIDE LOGIN CARD (40%) */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-[#E2E8F0] rounded-[32px] shadow-2xl p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
              
              {/* Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F766E] to-[#14B8A6]" />

              {/* Card Header */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-md">
                  <TalentNestLogo className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    Candidate Portal Login
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">
                    Sign in to explore opportunities, manage your applications, and grow your career.
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="candidate-email" className="block text-xs font-semibold text-[#0F172A]">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] group-focus-within:text-[#0F766E] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="candidate-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border text-sm text-[#0F172A] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all duration-300 ${
                        errors.email ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-red-600 pl-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="candidate-password" className="block text-xs font-semibold text-[#0F172A]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={openForgotPassword}
                      className="text-xs font-semibold text-[#0F766E] hover:text-[#14B8A6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 rounded"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] group-focus-within:text-[#0F766E] transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="candidate-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border text-sm text-[#0F172A] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all duration-300 ${
                        errors.password ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] focus:outline-none cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-red-600 pl-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-0.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#0F766E] bg-[#F8FAFC] border-[#E2E8F0] rounded focus:ring-[#0F766E] focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 text-xs text-[#64748B] font-medium cursor-pointer select-none">
                    Remember me on this device
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D655E] hover:to-[#109B8B] rounded-xl shadow-md hover:shadow-xl hover:shadow-[#0F766E]/20 transition-all duration-300 ease-out transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Candidate Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* OR Divider & Google Login */}
                <div className="pt-2 space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#E2E8F0] w-full" />
                    <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase absolute">
                      OR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-3 px-4 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50/80 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-0.5 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Bottom Support & Signup Links */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center space-y-3.5">
                <div className="inline-flex items-center space-x-1.5 text-xs text-[#64748B]">
             
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">
                    Don't have an account?{' '}
                    <Link
                      to="/candidate-register"
                      className="font-semibold text-[#0F766E] hover:text-[#14B8A6] hover:underline transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Create Candidate Account</span>
                      <UserPlus className="w-3 h-3 ml-0.5" />
                    </Link>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>


      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#0F766E] to-[#14B8A6]" />
            <div className="p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF7F5] text-[#0F766E] flex items-center justify-center mb-4">
                    {forgotStep === 4 ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    {forgotStep === 1 && 'Reset your password'}
                    {forgotStep === 2 && 'Verify your email'}
                    {forgotStep === 3 && 'Create a new password'}
                    {forgotStep === 4 && 'Password updated'}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#64748B] leading-relaxed">
                    {forgotStep === 1 && 'Enter your candidate account email and we will send you a secure reset code.'}
                    {forgotStep === 2 && `Enter the 6-digit code sent to ${forgotEmail}.`}
                    {forgotStep === 3 && 'Choose a new password for your TalentNest candidate account.'}
                    {forgotStep === 4 && 'Your password has been changed successfully. You can now sign in with your new password.'}
                  </p>
                </div>
                <button type="button" onClick={closeForgotPassword} disabled={forgotLoading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors disabled:opacity-50" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {forgotStep < 4 && (
                <div className="flex items-center gap-2 mt-6 mb-7">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${step <= forgotStep ? 'bg-[#0F766E]' : 'bg-[#E2E8F0]'}`} />
                  ))}
                </div>
              )}

              {forgotError && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{forgotError}</div>}
              {forgotSuccess && forgotStep !== 4 && <div className="mb-5 rounded-xl border border-[#BDE5DF] bg-[#EAF7F5] px-4 py-3 text-sm text-[#0F766E]">{forgotSuccess}</div>}

              {forgotStep === 1 && (
                <form onSubmit={handleSendResetOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#0F172A]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com" autoFocus
                        className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]" />
                    </div>
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending Code...</> : <>Send Reset Code<ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyResetOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#0F172A]">6-Digit Reset Code</label>
                    <input type="text" inputMode="numeric" maxLength={6} value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000" autoFocus
                      className="w-full py-4 text-center text-2xl tracking-[0.5em] font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]" />
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : <>Verify Code<ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <button type="button" onClick={() => { setForgotStep(1); setResetOtp(''); setForgotError(''); setForgotSuccess(''); }}
                    disabled={forgotLoading} className="w-full text-xs font-semibold text-[#64748B] hover:text-[#0F766E] transition-colors">
                    Use a different email
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#0F172A]">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters" autoFocus
                        className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#0F172A]">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]" />
                    </div>
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating Password...</> : <>Update Password<CheckCircle2 className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {forgotStep === 4 && (
                <div className="space-y-5 mt-6">
                  <div className="rounded-2xl bg-[#EAF7F5] border border-[#BDE5DF] p-5 text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-[#0F766E]" />
                    <p className="mt-3 text-sm text-[#0F766E] font-semibold">Password reset complete.</p>
                  </div>
                  <button type="button"
                    onClick={() => { closeForgotPassword(); setEmail(forgotEmail); setPassword(''); }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-[#E2E8F0] bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <p>© 2026 TalentNest AI Platform. All rights reserved.</p>
          <p className="font-medium text-[#0F172A] flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-[#0F766E]">DigitalSofts</span>
          </p>
        </div>
      </footer>

    </div>
  );
}