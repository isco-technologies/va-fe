/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../appLayout";
import { getClientReports } from "../../../api/reports";

export default function ClientReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AppLayout>
      <div className="p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">My Reports</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Released security assessment reports
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-[#9CA3AF]">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center">
            <p className="text-[#6B7280]">No released reports available.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#111827]">
                      {report.assessmentName || report.title || "—"}
                    </h2>

                    {report.assessmentStatus && (
                      <p className="text-sm text-[#6B7280] mt-1">
                        {String(report.assessmentStatus)}
                      </p>
                    )}

                    {report.company && (
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        {typeof report.company === "string"
                          ? report.company
                          : report.company?.name || "—"}
                      </p>
                    )}

                    <p className="text-xs text-[#9CA3AF] mt-3">
                      Released:{" "}
                      {report.reportSentAt
                        ? new Date(report.reportSentAt).toLocaleString()
                        : report.generatedAt
                        ? new Date(report.generatedAt).toLocaleString()
                        : "N/A"}
                    </p>

                    {report.generatedBy && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        By: {report.generatedBy}
                      </p>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shrink-0">
                    Released
                  </span>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() =>
                      navigate(`/client/reports/${report.id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-[#111827] text-white text-sm hover:bg-[#1F2937] transition"
                  >
                    Open Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}