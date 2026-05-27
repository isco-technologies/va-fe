/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import apiClient from "../../../api/Axios";
import AppLayout from "../../appLayout";

// ---------------------------------------------------------------------------
// Types — matched to actual API response shape
// ---------------------------------------------------------------------------
type AssessmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface ClientAssessment {
  id: string;
  checklist: { name: string };
  company: { name: string };
  status: AssessmentStatus;
  progress: number; // 0–100 from backend
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  AssessmentStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Not Started",
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

// Fallback so an unexpected status never crashes the card
function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as AssessmentStatus] ?? {
    label: status,
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  };
}

// ---------------------------------------------------------------------------
// Assessment card
// ---------------------------------------------------------------------------
function AssessmentCard({
  assessment,
  onStart,
}: {
  assessment: ClientAssessment;
  onStart: (id: string) => void;
}) {
  const cfg = getStatusConfig(assessment.status);
  const pct = Math.min(100, Math.max(0, assessment.progress ?? 0));
  const isCompleted = assessment.status === "COMPLETED";

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "border-gray-200 opacity-80"
          : "border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
      }`}
      onClick={() => !isCompleted && onStart(assessment.id)}
    >
      {/* Status stripe */}
      {isCompleted && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-emerald-400" />
      )}
      {assessment.status === "IN_PROGRESS" && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-amber-400" />
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                isCompleted ? "bg-emerald-50" : "bg-indigo-50"
              }`}
            >
              <ClipboardList
                className={`w-5 h-5 ${isCompleted ? "text-emerald-600" : "text-indigo-600"}`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {assessment.checklist?.name ?? "Unnamed Assessment"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {assessment.company?.name}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs font-semibold text-gray-600">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        {!isCompleted && (
          <div className="mt-4 flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all duration-150">
              {assessment.status === "PENDING" ? "Start Assessment" : "Continue"}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<ClientAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await apiClient.get("/assessments/client");
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setAssessments(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load assessments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const handleStart = (id: string) => {
    navigate(`/client/assessment/${id}`);
  };

  const active = assessments.filter((a) => a.status !== "COMPLETED");
  const completed = assessments.filter((a) => a.status === "COMPLETED");

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Assessments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Select an assessment below to begin or continue.
          </p>
        </div>
        {!loading && !error && (
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{assessments.length}</p>
            <p className="text-xs text-gray-400">Assigned</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            <p className="text-sm">Loading your assessments…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No assessments assigned yet</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Your administrator will assign assessments to you. Check back soon.
            </p>
          </div>
        )}

        {/* Active */}
        {!loading && !error && active.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Pending
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {active.map((a) => (
                <AssessmentCard key={a.id} assessment={a} onStart={handleStart} />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {!loading && !error && completed.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Completed
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {completed.map((a) => (
                <AssessmentCard key={a.id} assessment={a} onStart={handleStart} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}