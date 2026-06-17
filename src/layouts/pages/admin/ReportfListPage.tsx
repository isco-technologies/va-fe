/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  AlertCircle,
} from "lucide-react";

type Finding = {
  id: string;
  title: string;
  severity: string;
  category?: string;
  createdAt: string;
};

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AssessmentReportsListPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!assessmentId) return;
    fetchFindings();
  }, [assessmentId]);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/technical-findings/assessment/${assessmentId}`
      );
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setFindings(data);
    } catch (err) {
      console.error("Failed to fetch findings:", err);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return findings.filter((finding) =>
      finding.title?.toLowerCase().includes(q)
    );
  }, [findings, search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold mb-2">
              Reports Timeline
            </p>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Generated Reports
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Each finding is treated as an individual report.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm self-start lg:self-auto"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 shadow-sm transition"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Finding
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
                        <p className="text-sm text-gray-400">
                          Loading reports...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <AlertCircle size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            No reports found
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            No generated reports available yet.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((finding) => {
                    const severityClass =
                      severityStyles[finding.severity] ||
                      severityStyles.LOW;

                    return (
                      <tr
                        key={finding.id}
                        className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors"
                      >
                        {/* FINDING */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <FileText size={18} className="text-indigo-500" />
                            </div>
                            <p className="font-semibold text-gray-900">
                              {finding.title}
                            </p>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td className="px-6 py-5">
                          {finding.category ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                              {finding.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* SEVERITY */}
                        <td className="px-6 py-5">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${severityClass}`}
                          >
                            {finding.severity}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-5 text-gray-500">
                          {new Date(finding.createdAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() =>
                              navigate(`/admin/reports/view/${finding.id}`)
                            }
                            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                          >
                            Open Report
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {filtered.length} report
                {filtered.length !== 1 ? "s" : ""} generated
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}