import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle, Briefcase, Mail, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("candidate_access_token") ||
    sessionStorage.getItem("candidate_access_token") ||
    localStorage.getItem("candidate_token") ||
    sessionStorage.getItem("candidate_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SESSION_KEY = "candidate_session_email";

function getStoredCandidateEmail() {
  return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "";
}

function getCandidateFromStorage() {
  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem("candidate");
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    } catch {}
  }
  return null;
}

export default function ApplyJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(getCandidateFromStorage());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);

        let active = getCandidateFromStorage();
        if (!active) {
          const email = getStoredCandidateEmail();
          if (email) {
            const candidatesRes = await api.get("/candidates");
            active = (candidatesRes.data || []).find(
              (c) => String(c.email || "").toLowerCase() === email.toLowerCase()
            );
          }
        }
        setCandidate(active || null);
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load the job/application details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const submitApplication = async () => {
    if (!candidate?.id) {
      navigate("/candidate-login", {
        state: { returnTo: `/candidate/apply/${jobId}` },
      });
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (!job?.id) {
        throw new Error("Job information is missing. Please go back and open the job again.");
      }
      await api.post("/applications/", {
        candidate_id: Number(candidate.id),
        job_id: Number(jobId),
      });
      setSuccess(true);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join(", ")
        : detail || err?.message || "We could not submit your application. Please try again.";

      if (String(message).toLowerCase().includes("already applied")) {
        setSuccess(true);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#0F766E]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <header className="h-20 bg-white border-b border-[#E2E8F0] flex items-center px-6 sm:px-10">
        <button onClick={() => navigate(`/candidate/jobs/${jobId}`)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#0F766E]">
          <ArrowLeft className="w-4 h-4" /> Back to Job Details
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-7">
          <p className="text-sm font-semibold text-[#0F766E]">TalentNest Application</p>
          <h1 className="text-3xl font-bold mt-1">Apply for this position</h1>
          <p className="text-[#475569] mt-2">Review your details and submit your application directly to the hiring team.</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 sm:p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold mt-5">Application Submitted</h2>
            <p className="text-[#475569] mt-2 max-w-md mx-auto">Your application has been submitted successfully and is now available to the hiring team.</p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => navigate("/candidate/applications")} className="px-5 py-3 rounded-xl bg-[#0F766E] text-white font-semibold hover:bg-[#0D9488]">View My Applications</button>
              <button onClick={() => navigate("/candidate/browse-jobs")} className="px-5 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#0F766E] font-semibold">Browse More Jobs</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center"><Briefcase /></div>
                <div>
                  <h2 className="text-xl font-bold">{job?.title || "Position"}</h2>
                  <p className="text-[#475569] mt-1">{job?.department || "TalentNest opportunity"}</p>
                  <p className="text-sm text-[#64748B] mt-2">{job?.location || "Remote"} · {job?.employment_type || "Full Time"}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <h2 className="font-bold text-lg">Applicant</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex gap-3"><User className="text-[#0F766E] w-5" /><div><p className="text-xs text-[#64748B]">Name</p><p className="font-semibold">{candidate?.full_name || candidate?.name || "Your account"}</p></div></div>
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex gap-3"><Mail className="text-[#0F766E] w-5" /><div><p className="text-xs text-[#64748B]">Email</p><p className="font-semibold break-all">{candidate?.email || "Your account email"}</p></div></div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <h2 className="font-bold text-lg">Ready to apply?</h2>
              <p className="text-sm text-[#64748B] mt-1">Your application will be attached to this job and become visible in the HR Applications portal.</p>
              <button onClick={submitApplication} disabled={submitting} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0F766E] text-white font-semibold hover:bg-[#0D9488] disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting Application..." : "Submit Application"}
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
