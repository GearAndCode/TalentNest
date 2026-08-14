import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  GraduationCap,
  Briefcase,
  Globe,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  TrendingUp,
  Loader2,
  RefreshCw,
  Check,
  ChevronRight,
  LockKeyhole
} from 'lucide-react';
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export default function CandidateRegister() {
  const navigate = useNavigate();

  // ----------------------------------------------------
  // Safe Back Navigation Handler
  // ----------------------------------------------------
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.history.back();
    }
  };

  // ----------------------------------------------------
  // Form State
  // ----------------------------------------------------
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    qualification: '',
    experience: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ----------------------------------------------------
  // OTP & Email Verification State
  // ----------------------------------------------------
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(299); // 04:59 countdown timer
  const [timerActive, setTimerActive] = useState(false);

  // ----------------------------------------------------
  // Registration State
  // ----------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ----------------------------------------------------
  // OTP Countdown Effect
  // ----------------------------------------------------
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------
  // Password Strength Meter Logic
  // ----------------------------------------------------
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
      case 3:
        return { score: 50, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
      case 4:
        return { score: 75, label: 'Strong', color: 'bg-teal-500', textColor: 'text-teal-600' };
      case 5:
        return { score: 100, label: 'Excellent', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
      default:
        return { score: 0, label: 'Too Short', color: 'bg-slate-200', textColor: 'text-slate-400' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // ----------------------------------------------------
  // Input Validation Rules
  // ----------------------------------------------------
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'email':
        if (!value) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^\+?[1-9]\d{1,14}$|^[\d\s()+-]{7,20}$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(value)) {
          error = 'Must include uppercase, lowercase, number & special char';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'qualification':
        if (!value) error = 'Select highest qualification';
        break;
      case 'experience':
        if (!value) error = 'Select experience level';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }

    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      const matchErr = value !== formData.confirmPassword ? 'Passwords do not match' : '';
      setErrors((prev) => ({ ...prev, confirmPassword: matchErr }));
    }

    if (name === 'email' && emailVerified) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // ----------------------------------------------------
  // Resume File Upload Process
  // ----------------------------------------------------
  const processFile = (file) => {
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      setResumeError('Invalid file format. Only PDF or DOCX files are allowed.');
      setResume(null);
      return;
    }

    if (file.size > maxBytes) {
      setResumeError('File size exceeds the 5MB limit.');
      setResume(null);
      return;
    }

    setResumeError('');
    setResume(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // ----------------------------------------------------
  // OTP Input Navigation Handlers
  // ----------------------------------------------------
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
      setOtpError('');
    }
  };

  // ----------------------------------------------------
  // Send / Resend OTP Call
  // ----------------------------------------------------
  const handleSendOtp = async () => {
    const emailErr = validateField('email', formData.email);
    setTouched((prev) => ({ ...prev, email: true }));
    if (emailErr) {
      setErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    try {
await axios.post(`${API}/candidate-auth/send-otp`, {
    email: formData.email
});
      setOtpSent(true);
      setTimer(299);
      setTimerActive(true);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
setOtpError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');    } finally {
      setIsSendingOtp(false);
    }
  };

  // ----------------------------------------------------
  // Verify OTP Call
  // ----------------------------------------------------
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
     const res = await axios.post(
    `${API}/candidate-auth/verify-otp`,
    {
        email: formData.email,
        otp: fullOtp
    }
);
    if (res.status === 200) {
    setEmailVerified(true);
    setOtpSent(false);
} else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.detail|| 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ----------------------------------------------------
  // Registration Form Submission
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldsToTouch = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      city: true,
      qualification: true,
      experience: true
    };
    setTouched((prev) => ({ ...prev, ...fieldsToTouch }));

    const newErrors = {};
    Object.keys(fieldsToTouch).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (!resume) {
      setResumeError('Please upload your resume to complete registration.');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !resume || !emailVerified) {
      setSubmitError('Please correct all validation errors and verify your email.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
    const registerData = {
    full_name: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
};

const registerResponse = await axios.post(
    `${API}/candidate-auth/register`,
    registerData
);

// Registration returns the candidate record. Sign in immediately to obtain
// the JWT required by protected candidate endpoints such as resume upload.
const loginResponse = await axios.post(`${API}/candidate-auth/login`, {
  email: formData.email.trim(),
  password: formData.password,
});

const accessToken = loginResponse.data.access_token;
const loggedInCandidate = loginResponse.data.candidate;

localStorage.setItem("candidate_token", accessToken);
localStorage.setItem("candidate", JSON.stringify(loggedInCandidate));
localStorage.setItem("candidate_session_email", loggedInCandidate.email);
// Keep these legacy keys for compatibility with older candidate pages.
localStorage.setItem("candidate_access_token", accessToken);
localStorage.setItem("candidate_id", String(loggedInCandidate.id));
localStorage.setItem("candidate_email", loggedInCandidate.email);
localStorage.setItem("candidate_name", loggedInCandidate.name || registerData.full_name);

const resumeForm = new FormData();
resumeForm.append("resume", resume);

await axios.post(
    `${API}/candidates/me/upload-resume`,
    resumeForm,
    {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
        },
    }
);

setShowSuccessModal(true);
    } catch (err) {
setSubmitError(
    err.response?.data?.detail ||
    'Registration failed. Please try again.'
);    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800 font-sans relative overflow-hidden">
      {/* Home Page Exact Background System (Soft Radial Glow + White Gradient) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[12%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[600px] h-[600px] rounded-full bg-[#14B8A6]/10 blur-[150px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-[#0F766E]/10 blur-[100px]" />
      </div>

      {/* Header Bar with Premium Back Button */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-slate-700 border border-teal-200/80 rounded-full shadow-sm hover:shadow-md hover:bg-[#0F766E] hover:text-white hover:border-[#0F766E] hover:-translate-y-0.5 transition-all duration-300 group focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 text-[#0F766E] group-hover:text-white transition-colors duration-300" />
          <span className="text-xs font-semibold tracking-wide">Back</span>
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-grow flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start w-full">
          
          {/* ============================================================ */}
          {/* LEFT SIDE - BRANDING & VALUE PROPOSITIONS */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col justify-center lg:sticky lg:top-8 pt-2">
            
           

            {/* Home Page Exact Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200/80 rounded-full px-3.5 py-1.5 w-fit mb-6 shadow-sm hover:shadow hover:bg-teal-100/60 transition-all duration-300">
              <Zap className="w-4 h-4 text-[#0F766E]" />
              <span className="text-xs font-semibold text-[#0F766E] tracking-wide uppercase">
                AI Candidate Platform
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Start Your <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0F766E] to-[#14B8A6]">
                Career Journey.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Create your TalentNest account, upload your resume, discover AI-matched engineering opportunities, and track application stages seamlessly.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Feature 1 */}
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  Resume Upload
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Smart AI parser extracts your skills & experience instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  AI Job Matching
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Get matched with top roles based on your verified skill index.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  Application Tracking
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time visibility into hiring pipelines & interviewer feedback.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  Career Insights
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  AI analysis on technical skill gaps and competitive benchmarks.
                </p>
              </div>

            </div>

          </div>


          {/* ============================================================ */}
          {/* RIGHT SIDE - CANDIDATE REGISTRATION CARD */}
          {/* ============================================================ */}
          <div className="lg:col-span-7">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 lg:p-10 relative">
              
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create Candidate Account
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Complete the fields below to register and access AI-driven matching.
                </p>
              </div>

              {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Alex"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${
                          errors.firstName && touched.firstName
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                    </div>
                    {errors.firstName && touched.firstName && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.firstName}</span>
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Morgan"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${
                          errors.lastName && touched.lastName
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                    </div>
                    {errors.lastName && touched.lastName && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.lastName}</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Email Address + OTP trigger button */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        disabled={emailVerified}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="alex.morgan@domain.com"
                        className={`w-full pl-10 pr-10 py-3 ${
                          emailVerified ? 'bg-emerald-50/60 text-slate-600 border-emerald-300' : 'bg-slate-50/50 text-slate-800 border-[#E2E8F0]'
                        } border ${
                          errors.email && touched.email
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                      {emailVerified && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || !formData.email || !!errors.email}
                        className="sm:w-auto w-full px-5 py-3 bg-[#0F766E] hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 flex-shrink-0"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify Email</span>
                          </>
                        )}
                      </button>
                    )}

                    {emailVerified && (
                      <div className="px-4 py-3 bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-1.5 flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* OTP Verification Interactive Card */}
                {otpSent && !emailVerified && (
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-teal-50/80 to-slate-50 border border-teal-200 shadow-md animate-fadeIn transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <LockKeyhole className="w-5 h-5 text-[#0F766E]" />
                        <h4 className="font-bold text-slate-900 text-base">
                          Verify Your Email
                        </h4>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#0F766E] bg-teal-100 px-2.5 py-1 rounded-md">
                        {formatTime(timer)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mb-5">
                      Enter the 6-digit verification code sent to{' '}
                      <span className="font-semibold text-slate-800">{formData.email}</span>.
                    </p>

                    <div className="flex justify-between items-center gap-2 mb-4">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          ref={(el) => (otpRefs.current[idx] = el)}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className="w-11 sm:w-12 h-12 text-center text-lg font-extrabold text-slate-900 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none shadow-sm transition-all"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-xs text-rose-500 mb-4 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{otpError}</span>
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={timer > 0 || isSendingOtp}
                        className="text-xs font-semibold text-[#0F766E] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend OTP {timer > 0 && `in ${formatTime(timer)}`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otp.join('').length < 6}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 disabled:bg-slate-300 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center space-x-2"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify OTP</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Phone & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${
                          errors.phone && touched.phone
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Current City <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="San Francisco, CA"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${
                          errors.city && touched.city
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                    </div>
                    {errors.city && touched.city && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-50/50 border ${
                          errors.password && touched.password
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Strength</span>
                          <span className={`text-[11px] font-bold ${passwordStrength.textColor}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {errors.password && touched.password && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-50/50 border ${
                          errors.confirmPassword && touched.confirmPassword
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.confirmPassword}</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Qualification & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Qualification */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Highest Qualification <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-8 py-3 bg-slate-50/50 border ${
                          errors.qualification && touched.qualification
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none`}
                      >
                        <option value="">Select Qualification</option>
                        <option value="High School">High School Diploma</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate / PhD">Doctorate / PhD</option>
                        <option value="Self-Taught / Bootcamp">Bootcamp / Self-Taught</option>
                      </select>
                    </div>
                    {errors.qualification && touched.qualification && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.qualification}</span>
                      </p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Experience Level <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-8 py-3 bg-slate-50/50 border ${
                          errors.experience && touched.experience
                            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-[#E2E8F0] focus:ring-[#0F766E] focus:border-[#0F766E]'
                        } rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none`}
                      >
                        <option value="">Select Experience</option>
                        <option value="Fresh / Student">Fresher / Entry Level (0-1 yrs)</option>
                        <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                        <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                        <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                        <option value="Lead / Executive (8+ yrs)">Lead / Executive (8+ yrs)</option>
                      </select>
                    </div>
                    {errors.experience && touched.experience && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.experience}</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Social Profiles - Guaranteed Safe Lucide Icons Only */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* LinkedIn Link */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      LinkedIn
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                      />
                    </div>
                  </div>

                  {/* GitHub Link */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      GitHub
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                      />
                    </div>
                  </div>

                  {/* Portfolio Link */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Portfolio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="https://myportfolio.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Drag and Drop Resume Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Resume Upload <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                  />

                  {!resume ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed ${
                        isDragging
                          ? 'border-[#0F766E] bg-teal-50/50'
                          : resumeError
                          ? 'border-rose-300 bg-rose-50/20'
                          : 'border-slate-300 hover:border-[#0F766E] bg-slate-50/40'
                      } rounded-2xl p-6 text-center transition-all duration-200 group`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        Click to browse <span className="text-slate-400 font-normal">or drag & drop resume</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF or DOCX (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {resume.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(resume.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResume(null)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {resumeError && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{resumeError}</span>
                    </p>
                  )}
                </div>

                {/* Email Verification Alert Banner */}
                {!emailVerified && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Please verify your email address before completing account creation.</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!emailVerified || isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-teal-800 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg shadow-teal-700/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-3">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/candidate-login')}
                      className="font-bold text-[#0F766E] hover:underline inline-flex items-center space-x-0.5"
                    >
                      <span>Candidate Login</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </p>

                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    By registering you agree to our{' '}
                    <Link to="/terms" className="text-slate-600 underline hover:text-[#0F766E]">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-slate-600 underline hover:text-[#0F766E]">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>

      {/* Page Footer */}
      <footer className="relative z-10 py-6 border-t border-slate-200/60 bg-white/40 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} TalentNest AI Inc. All rights reserved. Enterprise Grade Recruiting Platform.</p>
      </footer>

      {/* ============================================================ */}
      {/* SUCCESS POPUP MODAL */}
      {/* ============================================================ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-100 transform transition-all scale-100">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12 animate-bounce" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              Account Created
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-8">
              Your TalentNest candidate account has been created successfully.
              <br />
              You can now log in and access your personalized dashboard.
            </p>

            <button
              type="button"
              onClick={() => navigate('/candidate-login')}
              className="w-full py-3.5 bg-[#0F766E] hover:bg-teal-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}