import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import {FileText,ShieldAlert,AlertTriangle,AlertCircle,Search,ChevronRight,} from "lucide-react";

type ReportingAssessment = {
  assessmentId: string;
  assessmentName: string;
  companyId: string;
  companyName: string;
  findingsCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;

  reportStatus:
    | "NOT_STARTED"
    | "RELEASED";

  reportReleased: boolean;

  updatedAt?: string;
};

const STATUS_STYLES: Record<
  string,
  string
> = {
  NOT_STARTED:
    "bg-gray-100 text-gray-600 border-gray-200",

  DRAFT:
    "bg-amber-50 text-amber-700 border-amber-200",

  COMPLETED:
    "bg-indigo-50 text-indigo-700 border-indigo-200",

  RELEASED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AdminReportPage() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [assessments, setAssessments] =
    useState<
      ReportingAssessment[]
    >([]);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments =
    async () => {
      try {
        setLoading(true);

        const res =
          await apiClient.get(
            "/reports/ready-assessments"
          );

        const data =
          Array.isArray(
            res.data
          )
            ? res.data
            : Array.isArray(
                res.data?.data
              )
            ? res.data.data
            : [];

        setAssessments(data);
      } catch (err) {
        console.error(
          "Failed to fetch reporting assessments:",
          err
        );

        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

  const filtered =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return assessments.filter(
        (a) =>
          a.companyName
            ?.toLowerCase()
            .includes(q) ||
          a.assessmentName
            ?.toLowerCase()
            .includes(q)
      );
    }, [assessments, search]);

  const totalFindings =
    filtered.reduce(
      (sum, a) =>
        sum +
        (a.findingsCount || 0),
      0
    );

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold mb-2">
              Reporting
            </p>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Companies Ready
              For Reporting
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Companies with
              completed findings
              ready for report
              generation and
              release.
            </p>
          </div>

          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-3 min-w-[320px]">

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                    Assessments
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {
                      filtered.length
                    }
                  </h3>
                </div>

                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileText
                    size={20}
                    className="text-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                    Findings
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {
                      totalFindings
                    }
                  </h3>
                </div>

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <ShieldAlert
                    size={20}
                    className="text-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <div className="relative">

          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search company or assessment..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
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
                    Company
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Assessment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Findings
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Report Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">

                        <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />

                        <p className="text-sm text-gray-400">
                          Loading
                          assessments...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">

                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">

                          <AlertCircle
                            size={24}
                            className="text-gray-400"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-gray-700">
                            No
                            assessments
                            found
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            No
                            assessments
                            are ready
                            for
                            reporting
                            yet.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(
                    (
                      assessment
                    ) => {
                      const statusStyle =
                        STATUS_STYLES[
                          assessment
                            .reportStatus
                        ];

                      return (
                        <tr
                          key={
                            assessment.assessmentId
                          }
                          className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors"
                        >

                          {/* COMPANY */}

                          <td className="px-6 py-5">

                            <div>
                              <p className="font-semibold text-gray-900">
                                {
                                  assessment.companyName
                                }
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Client
                                Organization
                              </p>
                            </div>
                          </td>

                          {/* ASSESSMENT */}

                          <td className="px-6 py-5">

                            <div>
                              <p className="font-medium text-gray-800">
                                {
                                  assessment.assessmentName
                                }
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Security
                                Assessment
                              </p>
                            </div>
                          </td>

                          {/* FINDINGS */}

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                              <ShieldAlert
                                size={13}
                                className="text-red-500"
                              />
                              <span className="font-semibold text-gray-800">
                                {
                                  assessment.findingsCount
                                }
                              </span>
                            </div>
                          </td>
                          {/* SEVERITY */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {assessment.critical >
                                0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                  <AlertTriangle
                                    size={10}
                                  />
                                  {
                                    assessment.critical
                                  }{" "}
                                  Critical
                                </span>
                              )}

                              {assessment.high >
                                0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                  {
                                    assessment.high
                                  }{" "}
                                  High
                                </span>
                              )}
                              {assessment.medium >
                                0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  {
                                    assessment.medium
                                  }{" "}
                                  Medium
                                </span>
                              )}

                              {assessment.low >
                                0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {
                                    assessment.low
                                  }{" "}
                                  Low
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}
                            >
                              {assessment.reportStatus.replace(
                                "_",
                                " "
                              )}
                            </span>
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/reports/edit/${assessment.assessmentId}`
                                )
                              }
                              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                            >
                              {assessment.reportStatus ===
                              "NOT_STARTED"
                                ? "Create Report"

                                : assessment.reportStatus ===
                                  "RELEASED"
                                ? "View Report"
                                : "Open"}
                              <ChevronRight
                                size={14}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          {!loading &&
            filtered.length >
              0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">

                <p className="text-xs text-gray-400">

                  {
                    filtered.length
                  }{" "}
                  assessment
                  {filtered.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  ready for
                  reporting

                </p>
              </div>
            )}
        </div>
      </div>
    </AppLayout>
  );
}