/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../appLayout";
import { getClientReports } from "../../../api/reports";
import { FileText, ArrowRight } from "lucide-react";

const PER_PAGE = 6;

export default function ClientReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const response = await getClientReports();
      setReports(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(reports.length / PER_PAGE);
  const paginated  = useMemo(
    () => reports.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [reports, page]
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        <div>
          <h1 className="text-xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Released security assessment reports</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-gray-400">No released reports available.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {paginated.map((report, idx) => (
                <div key={report.id}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-indigo-50/40 transition cursor-pointer group ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  onClick={() => navigate(`/client/reports/${report.assessmentId}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {report.assessmentName || report.title || "Unnamed Assessment"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {report.company && (
                          <span className="text-xs text-gray-400 truncate">
                            {typeof report.company === "string" ? report.company : report.company?.name}
                          </span>
                        )}
                        {report.reportSentAt && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400">
                              {new Date(report.reportSentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      Released
                    </span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition" />
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}