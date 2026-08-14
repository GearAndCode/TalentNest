import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle, Briefcase, Mail, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });

function getToken() {
  return localStorage.getItem("candidate_token") || sessionStorage.getItem("candidate_token");
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SESSION_KEY = "candidate_session_email";

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

function clearCandidateSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("candidate_token");
    storage.removeItem("candidate");
    storage.removeItem(SESSION_KEY);
  }
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

  const goToLogin = () => {
    clearCandidateSession();
    navigate("/candidate-login", { state: { returnTo: `/candidate/apply/${jobId}` } });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      // Must be logged in to apply — the token is the same one used by the
      // working Candidate Dashboard (localStorage/sessionStorage "candidate_token").
      if (!getToken()) {
        goToLogin();
        return;
      }

      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);

        // Always confirm the candidate against the backend (same call the
        // Candidate Dashboard uses) instead of trusting stale localStorage data,
        // so the application is guaranteed to belong to the logged-in candidate.
        try {
          const meRes = await api.get("/candidates/me");
          setCandidate(meRes.data);
        } catch (meErr) {
          if (meErr?.response?.status === 401) {
            goToLogin();
            return;
          }
          // Backend candidate lookup failed for a non-auth reason; fall back to
          // whatever was cached from login so the page still renders.
          setCandidate(getCandidateFromStorage());
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setError("This job posting no longer exists.");
        } else if (err?.response) {
          setError(err.response.data?.detail || "Unable to load this job. Please try again.");
        } else {
          setError("Unable to reach the TalentNest server. Please check your connection and try again.");
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const submitApplication = async () => {
    if (!getToken() || !candidate?.id) {
      goToLogin();
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/applications/", {
        candidate_id: Number(candidate.id),
        job_id: Number(jobId),
      });
      setSuccess(true);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 400 && detail === "Already applied.") {
        // Backend's duplicate-protection response — treat as success, not an error.
        setSuccess(true);
      } else if (status === 401) {
        goToLogin();
      } else if (status === 403) {
        setError(detail || "You don't have permission to apply for this job.");
      } else if (status === 404) {
        setError(detail || "This job could not be found. It may have been removed.");
      } else if (status === 409) {
        setError("You have already applied for this job.");
      } else if (status === 422) {
        setError(detail || "Your application details are incomplete. Please refresh and try again.");
      } else if (status >= 500) {
        setError("The TalentNest server ran into a problem submitting your application. Please try again shortly.");
      } else if (!err?.response) {
        // No response reached the browser at all — network/CORS failure.
        setError("We could not reach the TalentNest server. Please check your connection and try again.");
      } else {
        setError(detail || "We could not submit your application. Please try again.");
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
