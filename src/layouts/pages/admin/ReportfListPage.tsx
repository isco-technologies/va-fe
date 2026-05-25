/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import {useNavigate,useParams,} from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import {FileText,ChevronRight,CalendarDays,Search,AlertCircle,} from "lucide-react";

type Finding = {
  id: string;
  title: string;
  severity: string;
  category?: string;
  createdAt: string;
};

const severityStyles: Record<
  string,
  string
> = {
  CRITICAL:
    "bg-red-50 text-red-700 border-red-200",

  HIGH:
    "bg-orange-50 text-orange-700 border-orange-200",

  MEDIUM:
    "bg-amber-50 text-amber-700 border-amber-200",

  LOW:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AssessmentReportsListPage() {

  const navigate =
    useNavigate();

  const { assessmentId } =
    useParams();

  const [loading, setLoading] =
    useState(true);

  const [findings, setFindings] =
    useState<Finding[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    if (!assessmentId)
      return;

    fetchFindings();

  }, [assessmentId]);

  const fetchFindings =
    async () => {

      try {

        setLoading(true);

        const res =
          await apiClient.get(
            `/technical-findings/assessment/${assessmentId}`
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

        setFindings(data);

      } catch (err) {

        console.error(
          "Failed to fetch findings:",
          err
        );

        setFindings([]);

      } finally {

        setLoading(false);
      }
    };

  // SEARCH FILTER

  const filtered =
    useMemo(() => {

      const q =
        search.toLowerCase();

      return findings.filter(
        (finding) =>
          finding.title
            ?.toLowerCase()
            .includes(q)
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
              Each finding is
              treated as an
              individual report.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm min-w-[220px]">

            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              Total Reports
            </p>

            <h3 className="text-3xl font-bold text-gray-900 mt-2">
              {filtered.length}
            </h3>
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
            placeholder="Search reports..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 shadow-sm transition"
          />
        </div>

        {/* REPORTS */}

        <div className="space-y-5">

          {loading ? (

            <div className="bg-white border border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center">

              <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin mb-4" />

              <p className="text-sm text-gray-400">
                Loading reports...
              </p>
            </div>

          ) : filtered.length ===
            0 ? (

            <div className="bg-white border border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center">

              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">

                <AlertCircle
                  size={24}
                  className="text-gray-400"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-700">
                No Reports Found
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                No generated reports
                available yet.
              </p>
            </div>

          ) : (

            filtered.map(
              (finding) => {

                const severityClass =
                  severityStyles[
                    finding.severity
                  ] ||
                  severityStyles.LOW;

                return (

                  <div
                    key={finding.id}
                    className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                      {/* LEFT */}

                      <div className="flex items-start gap-5">

                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

                          <FileText
                            size={24}
                            className="text-indigo-500"
                          />
                        </div>

                        <div>

                          <h3 className="text-xl font-semibold text-gray-900">
                            {finding.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 mt-3">

                            <div className="inline-flex items-center gap-2 text-sm text-gray-500">

                              <CalendarDays
                                size={15}
                              />

                              {new Date(
                                finding.createdAt
                              ).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month:
                                    "long",
                                  year:
                                    "numeric",
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )}
                            </div>

                            {finding.category && (

                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">

                                {
                                  finding.category
                                }
                              </span>
                            )}
                          </div>

                          {/* SEVERITY */}

                          <div className="flex flex-wrap items-center gap-2 mt-4">

                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${severityClass}`}
                            >
                              {
                                finding.severity
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/reports/view/${finding.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition shadow-sm"
                        >
                          Open Report

                          <ChevronRight
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}