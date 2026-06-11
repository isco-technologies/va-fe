/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronRight, Loader2, Search } from "lucide-react";
import apiClient from "../../../api/Axios";
import AppLayout from "../../appLayout";

type AssessmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface ClientAssessment {
  id: string;
  checklist: { name: string };
  company: { name: string };
  status: AssessmentStatus;
  progress: number;
}

const STATUS_CONFIG: Record<AssessmentStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:     { label: "Not Started", color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200",   icon: <Clock className="w-3 h-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  icon: <AlertCircle className="w-3 h-3" /> },
  COMPLETED:   { label: "Completed",   color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",icon: <CheckCircle2 className="w-3 h-3" /> },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as AssessmentStatus] ?? STATUS_CONFIG.PENDING;
}

function AssessmentCard({ assessment, onStart }: { assessment: ClientAssessment; onStart: (id: string) => void }) {
  const cfg = getStatusConfig(assessment.status);
  const pct = Math.min(100, Math.max(0, assessment.progress ?? 0));
  const isCompleted = assessment.status === "COMPLETED";

  return (
    <div
      onClick={() => !isCompleted && onStart(assessment.id)}
      className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isCompleted ? "border-gray-200" : "border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
      }`}
    >
      {/* top stripe */}
      <div className={`h-0.5 w-full ${isCompleted ? "bg-emerald-400" : assessment.status === "IN_PROGRESS" ? "bg-amber-400" : "bg-gray-200"}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted ? "bg-emerald-50" : "bg-indigo-50"}`}>
              <ClipboardList className={`w-4 h-4 ${isCompleted ? "text-emerald-600" : "text-indigo-500"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{assessment.checklist?.name ?? "Unnamed"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{assessment.company?.name}</p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.icon}{cfg.label}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Progress</span>
            <span className="text-[11px] font-semibold text-gray-600">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-3 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-1.5 transition-all">
              {assessment.status === "PENDING" ? "Start Assessment" : "Continue"}
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<ClientAssessment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    apiClient.get("/assessments/client")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setAssessments(data);
      })
      .catch((err: any) => setError(err?.response?.data?.message || "Failed to load assessments."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return assessments;
    const q = search.toLowerCase();
    return assessments.filter(
      (a) => a.checklist?.name?.toLowerCase().includes(q) || a.company?.name?.toLowerCase().includes(q)
    );
  }, [assessments, search]);

  // Reset to page 1 when search changes
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const active    = paginated.filter((a) => a.status !== "COMPLETED");
  const completed = paginated.filter((a) => a.status === "COMPLETED");

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Assessments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Select an assessment below to begin or continue.</p>
        </div>
        {!loading && !error && (
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{assessments.length}</p>
            <p className="text-xs text-gray-400">Assigned</p>
          </div>
        )}
      </div>

      {/* SEARCH */}
      {!loading && !error && assessments.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assessments…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition"
          />
        </div>
      )}

      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-sm">Loading your assessments…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No assessments assigned yet</p>
            <p className="text-xs text-gray-400 max-w-xs">Your administrator will assign assessments to you. Check back soon.</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && assessments.length > 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No assessments match "{search}".</div>
        )}

        {!loading && !error && active.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Pending</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((a) => <AssessmentCard key={a.id} assessment={a} onStart={(id) => navigate(`/client/assessment/${id}`)} />)}
            </div>
          </section>
        )}

        {!loading && !error && completed.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Completed</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {completed.map((a) => <AssessmentCard key={a.id} assessment={a} onStart={(id) => navigate(`/client/assessment/${id}`)} />)}
            </div>
          </section>
        )}
        {/* PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition ${page === i + 1 ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}