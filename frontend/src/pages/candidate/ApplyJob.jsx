import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, MapPin, Briefcase } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });

function getCandidateToken() {
  return (
    localStorage.getItem("candidate_token") ||
    sessionStorage.getItem("candidate_token") ||
    localStorage.getItem("candidate_access_token") ||
    sessionStorage.getItem("candidate_access_token") ||
    null
  );
}

api.interceptors.request.use((config) => {
  const token = getCandidateToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function CandidateApply() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!getCandidateToken()) {
      navigate("/candidate-login", { replace: true, state: { returnTo: `/candidate/apply/${jobId}` } });
      return;
    }
    (async () => {
      try {
        const [jobRes, candidateRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get("/candidates/me"),
        ]);
        setJob(jobRes.data);
        setCandidate(candidateRes.data);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/candidate-login", { replace: true, state: { returnTo: `/candidate/apply/${jobId}` } });
          return;
        }
        setError(err?.response?.data?.detail || "Unable to load the application page.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, navigate]);

  const submitApplication = async () => {
    if (!candidate?.id) {
      setError("Your candidate session could not be verified. Please log in again.");
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
      const detail = err?.response?.data?.detail;
      setError(detail || "We could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#0F766E]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
          <p className="mt-4 text-sm text-red-700">{error}</p>
          <button onClick={() => navigate(`/candidate/jobs/${jobId}`)} className="mt-6 px-5 py-3 rounded-xl bg-[#0F766E] text-white font-semibold">Back to Job</button>
        </div>
      </div>
    );
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

        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="font-bold text-xl">{job?.title || "Job"}</h2>
          <p className="text-sm text-[#475569] mt-1">{job?.department || job?.category || "TalentNest"}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#475569]">
            {job?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#0F766E]" />{job.location}</span>}
            {job?.employment_type && <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#0F766E]" />{job.employment_type}</span>}
          </div>
        </section>

        <section className="mt-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="font-bold text-lg">Your application details</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <p className="text-xs text-[#64748B]">Name</p>
              <p className="font-semibold mt-1">{candidate?.full_name || candidate?.name || "Your account"}</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <p className="text-xs text-[#64748B]">Email</p>
              <p className="font-semibold mt-1 break-all">{candidate?.email || "Your account email"}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 mx-auto text-[#0F766E]" />
              <h2 className="font-bold text-xl mt-4">Application submitted</h2>
              <p className="text-sm text-[#64748B] mt-2">Your application is now visible to the hiring team.</p>
              <button onClick={() => navigate("/candidate/applications")} className="mt-6 px-6 py-3 rounded-xl bg-[#0F766E] text-white font-semibold">View My Applications</button>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg">Ready to apply?</h2>
              <p className="text-sm text-[#64748B] mt-1">Your application will be attached to this job and become visible in the HR Applications portal.</p>
              {error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
              <button onClick={submitApplication} disabled={submitting} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0F766E] text-white font-semibold hover:bg-[#0D9488] disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting Application..." : "Submit Application"}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
