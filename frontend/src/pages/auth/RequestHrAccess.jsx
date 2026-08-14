import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
ArrowLeft,
ArrowRight,
Building2,
Mail,
User,
Briefcase,
Users,
MessageSquare,
CheckCircle2,
ShieldCheck,
Sparkles,
Loader2,
Copy,
Check
} from 'lucide-react';

/* ============================================================
BRAND ASSET — identical mark used across every TalentNest
HR page (HRDashboard, AI Rankings, etc). Do not fork this.
============================================================ */
const TalentNestLogo = ({ className = 'w-6 h-6' }) => (
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

const SUPPORT_EMAIL = 'talentnest.ats@gmail.com';

const COMPANY_SIZES = [
'1–10 employees',
'11–50 employees',
'51–200 employees',
'201–500 employees',
'500+ employees',
];

const INITIAL_FORM = {
companyName: '',
workEmail: '',
fullName: '',
jobTitle: '',
companySize: '',
message: '',
};

export default function RequestHRAccess() {
const navigate = useNavigate();

const [form, setForm] = useState(INITIAL_FORM);
const [errors, setErrors] = useState({});
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [copied, setCopied] = useState(false);

const handleChange = (field) => (e) => {
const value = e.target.value;
setForm((prev) => ({ ...prev, [field]: value }));
if (errors[field]) {
setErrors((prev) => {
const next = { ...prev };
delete next[field];
return next;
});
}
};

const validate = () => {
const next = {};
if (!form.companyName.trim()) next.companyName = 'Company name is required.';
if (!form.workEmail.trim()) {
next.workEmail = 'Work email is required.';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail.trim())) {
next.workEmail = 'Enter a valid email address.';
}
if (!form.fullName.trim()) next.fullName = 'Your full name is required.';
if (!form.jobTitle.trim()) next.jobTitle = 'Job title / role is required.';
if (!form.companySize) next.companySize = 'Please select a company size.';
setErrors(next);
return Object.keys(next).length === 0;
};

const buildMailto = () => {
const subject = `TalentNest HR Access Request - ${form.companyName.trim()}`;
const body = [
'New HR Access Request',
'',
`Company Name: ${form.companyName.trim()}`,
`Contact Name: ${form.fullName.trim()}`,
`Work Email: ${form.workEmail.trim()}`,
`Job Title: ${form.jobTitle.trim()}`,
`Company Size: ${form.companySize}`,
'',
'Message:',
form.message.trim() || '—',
].join('\n');

return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!validate()) return;

setSubmitting(true);

try {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const payload = {
    company_name: form.companyName.trim(),
    work_email: form.workEmail.trim(),
    full_name: form.fullName.trim(),
    job_title: form.jobTitle.trim(),
    company_size: form.companySize,
    message: form.message.trim(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/hr-access/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || "Unable to send HR access request.");
    }
  } catch (apiError) {
    // Do not make the user lose the request because SMTP/CORS is unavailable.
    // Open a pre-filled email as a reliable fallback.
    console.warn("HR access API failed; opening email fallback.", apiError);
    window.location.href = buildMailto();
  }

  setSubmitted(true);
} catch (error) {
  console.error("HR access request failed:", error);
  alert(
    error?.message ||
      "We could not send your request. Please try again."
  );
} finally {
  setSubmitting(false);
}
};

const handleStartOver = () => {
setForm(INITIAL_FORM);
setErrors({});
setSubmitted(false);
};

const handleCopyEmail = async () => {
try {
await navigator.clipboard.writeText(SUPPORT_EMAIL);
setCopied(true);
window.setTimeout(() => setCopied(false), 1800);
} catch {
// Clipboard API unavailable — silently ignore, email is still visible/selectable.
}
};

return (
<div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#14B8A6] selection:text-white">
{/* Header */}
<header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#E2E8F0]">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-20">
<button
onClick={() => navigate('/hr-login')}
className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] rounded-xl p-1"
>
<div className="w-10 h-10 shrink-0 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
<TalentNestLogo className="w-6 h-6 text-white" />
</div>
<span className="text-xl font-bold text-[#0F172A] tracking-tight">TalentNest</span>
</button>

<button
onClick={() => navigate('/hr-login')}
className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl shadow-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
>
<ArrowLeft className="w-4 h-4" />
Back to HR Login
</button>
</div>
</div>
</header>

{/* Hero */}
<section className="relative overflow-hidden">
<div
className="pointer-events-none absolute inset-x-0 -top-24 h-[420px]"
style={{
background:
'radial-gradient(60% 100% at 50% 0%, rgba(15,118,110,0.10) 0%, rgba(20,184,166,0.05) 45%, rgba(248,250,252,0) 80%)',
}}
/>
<div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
<motion.div
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35 }}
className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] text-xs font-semibold tracking-wide uppercase"
>
<Sparkles className="w-3.5 h-3.5" />
For Companies & HR Teams
</motion.div>

<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.05 }}
className="mt-6 flex items-center justify-center"
>
<div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#0F766E]">
<Building2 className="w-7 h-7" />
</div>
</motion.div>

<motion.h1
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.1 }}
className="mt-5 text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight"
>
Bring your hiring to TalentNest
</motion.h1>

<motion.p
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.15 }}
className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed"
>
Request HR access for your organization and start managing jobs, applications,
candidates, and recruitment workflows in one secure platform.
</motion.p>
</div>
</section>

{/* Request Card */}
<section className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
<motion.div
initial={{ opacity: 0, y: 14 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.1 }}
className="bg-white rounded-[20px] border border-[#E2E8F0] shadow-sm p-6 sm:p-8"
>
<AnimatePresence mode="wait">
{!submitted ? (
<motion.div
key="form"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}
>
<div className="mb-6">
<h2 className="text-xl font-bold text-[#0F172A]">Request HR Access</h2>
<p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
Tell us a little about your organization. Our team will review your request
and contact you with the next steps.
</p>
</div>

<form onSubmit={handleSubmit} noValidate className="space-y-5">
<Field
id="companyName"
label="Company Name"
icon={Building2}
placeholder="Enter your company name"
value={form.companyName}
onChange={handleChange('companyName')}
error={errors.companyName}
required
/>

<Field
id="workEmail"
label="Work Email"
icon={Mail}
type="email"
placeholder="name@company.com"
value={form.workEmail}
onChange={handleChange('workEmail')}
error={errors.workEmail}
required
/>

<Field
id="fullName"
label="Your Full Name"
icon={User}
placeholder="Enter your full name"
value={form.fullName}
onChange={handleChange('fullName')}
error={errors.fullName}
required
/>

<Field
id="jobTitle"
label="Job Title / Role"
icon={Briefcase}
placeholder="e.g. HR Manager, Recruiter, Talent Acquisition Lead"
value={form.jobTitle}
onChange={handleChange('jobTitle')}
error={errors.jobTitle}
required
/>

<div>
<label htmlFor="companySize" className="block text-xs font-semibold text-[#475569] mb-1.5">
Company Size <span className="text-[#EF4444]">*</span>
</label>
<div className="relative">
<Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
<select
id="companySize"
value={form.companySize}
onChange={handleChange('companySize')}
aria-invalid={!!errors.companySize}
aria-describedby={errors.companySize ? 'companySize-error' : undefined}
className={`w-full appearance-none pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all ${
errors.companySize ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
}`}
>
<option value="" disabled>
Select company size
</option>
{COMPANY_SIZES.map((size) => (
<option key={size} value={size}>
{size}
</option>
))}
</select>
</div>
{errors.companySize && (
<p id="companySize-error" className="mt-1.5 text-xs text-[#EF4444]">
{errors.companySize}
</p>
)}
</div>

<div>
<label htmlFor="message" className="block text-xs font-semibold text-[#475569] mb-1.5">
Message
</label>
<div className="relative">
<MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-[#475569] pointer-events-none" />
<textarea
id="message"
rows={4}
placeholder="Tell us briefly about your hiring needs..."
value={form.message}
onChange={handleChange('message')}
className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#475569]/60 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all resize-none"
/>
</div>
</div>

<button
type="submit"
disabled={submitting}
className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] active:bg-[#0F5B54] rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
>
{submitting ? (
<>
<Loader2 className="w-4 h-4 animate-spin" />
Preparing your request...
</>
) : (
<>
Request HR Access
<ArrowRight className="w-4 h-4" />
</>
)}
</button>

<a
href={`mailto:${SUPPORT_EMAIL}`}
className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl transition-all duration-200"
>
<Mail className="w-4 h-4" />
Email us directly
</a>
</form>
</motion.div>
) : (
<motion.div
key="success"
initial={{ opacity: 0, scale: 0.98 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.25 }}
className="text-center py-4"
>
<div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
<CheckCircle2 className="w-7 h-7" />
</div>

<h2 className="mt-5 text-xl font-bold text-[#0F172A]">Request Received</h2>
<p className="mt-3 text-sm text-[#475569] leading-relaxed max-w-md mx-auto">
Thank you for your interest in TalentNest. Your request has been prepared for
our team. We'll review your information and contact you at your work email
with the next steps.
</p>

<div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
<Mail className="w-4 h-4 text-[#0F766E]" />
<span className="text-sm font-medium text-[#0F172A]">{SUPPORT_EMAIL}</span>
<button
onClick={handleCopyEmail}
aria-label="Copy support email address"
className="ml-1 p-1 rounded-lg text-[#475569] hover:text-[#0F766E] hover:bg-white transition-colors"
>
{copied ? <Check className="w-3.5 h-3.5 text-[#0F766E]" /> : <Copy className="w-3.5 h-3.5" />}
</button>
</div>

<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
<button
onClick={() => navigate('/hr-login')}
className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl shadow-sm transition-all duration-200"
>
Back to HR Login
</button>
<button
onClick={handleStartOver}
className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0F766E] bg-white border border-[#E2E8F0] hover:border-[#14B8A6] hover:bg-[#F8FAFC] rounded-xl transition-all duration-200"
>
Submit another request
</button>
</div>
</motion.div>
)}
</AnimatePresence>
</motion.div>

{/* Trust Section */}
<div className="mt-10 text-center">
<p className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
Built for modern hiring teams
</p>
<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
{[
{ label: 'Centralized hiring', icon: Building2 },
{ label: 'Smarter candidate management', icon: Users },
{ label: 'Secure HR workflows', icon: ShieldCheck },
].map((item) => (
<div
key={item.label}
className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#475569]"
>
<CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
<span>{item.label}</span>
</div>
))}
</div>
</div>
</section>

{/* Footer */}
<footer className="border-t border-[#E2E8F0] bg-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center space-x-2.5">
<div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
<TalentNestLogo className="w-5 h-5 text-white" />
</div>
<span className="text-sm font-bold text-[#0F172A] tracking-tight">TalentNest</span>
</div>

<div className="flex items-center gap-6 text-xs font-medium text-[#475569]">
<a href="#" className="hover:text-[#0F766E] transition-colors">Privacy Policy</a>
<a href="#" className="hover:text-[#0F766E] transition-colors">System Support</a>
<span className="text-[#475569]/60">© {new Date().getFullYear()} TalentNest</span>
</div>
</div>
</div>
</footer>
</div>
);
}

/* ============================================================
FIELD — shared text input with label, icon, and inline error.
============================================================ */
function Field({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, error, required }) {
return (
<div>
<label htmlFor={id} className="block text-xs font-semibold text-[#475569] mb-1.5">
{label} {required && <span className="text-[#EF4444]">*</span>}
</label>
<div className="relative">
<Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
<input
id={id}
type={type}
placeholder={placeholder}
value={value}
onChange={onChange}
aria-invalid={!!error}
aria-describedby={error ? `${id}-error` : undefined}
className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-[#0F172A] placeholder:text-[#475569]/60 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all ${
error ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
}`}
/>
</div>
{error && (
<p id={`${id}-error`} className="mt-1.5 text-xs text-[#EF4444]">
{error}
</p>
)}
</div>
);
}
