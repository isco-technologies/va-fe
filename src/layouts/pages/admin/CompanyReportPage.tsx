import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";

type Assessment = {
  assessmentId: string;
  name: string;
  date: string;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

function computeHealth(stats: Assessment) {
  const total =
    stats.critical +
    stats.high +
    stats.medium +
    stats.low;

  if (total === 0) return 100;

  const risk =
    (stats.critical * 40 +
      stats.high * 20 +
      stats.medium * 10 +
      stats.low * 5) /
    total;

  return Math.max(
    0,
    Math.round(100 - risk)
  );
}

const SEVERITY_BADGES = [
  {
    key: "critical" as keyof Assessment,
    label: "Critical",
    badge:
      "bg-red-100 text-red-700",
  },

  {
    key: "high" as keyof Assessment,
    label: "High",
    badge:
      "bg-orange-100 text-orange-700",
  },

  {
    key: "medium" as keyof Assessment,
    label: "Medium",
    badge:
      "bg-amber-100 text-amber-700",
  },

  {
    key: "low" as keyof Assessment,
    label: "Low",
    badge:
      "bg-emerald-100 text-emerald-700",
  },
];

function healthMeta(
  health: number
) {
  if (health >= 75)
    return {
      color:
        "text-emerald-600",
      bar:
        "bg-emerald-500",
      label: "Healthy",
      dot:
        "bg-emerald-500",
    };

  if (health >= 50)
    return {
      color:
        "text-amber-600",
      bar:
        "bg-amber-400",
      label:
        "Moderate",
      dot:
        "bg-amber-400",
    };

  return {
    color: "text-red-600",
    bar: "bg-red-500",
    label: "Critical",
    dot: "bg-red-500",
  };
}

export default function CompanyReportsPage() {
  const { companyId } =
    useParams();

  const [assessments, setAssessments] =
    useState<Assessment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(() => {
    if (!companyId) return;

    apiClient
      .get(
        `/reports/company/${companyId}`
      )

      .then((res) => {
        const data =
          res.data;

        const list: Assessment[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.data
              )
            ? data.data
            : Array.isArray(
                data?.assessments
              )
            ? data.assessments
            : [];

        setAssessments(
          list
        );
      })

      .catch((err) => {
        console.error(
          "Failed to fetch company reports:",
          err
        );

        setAssessments(
          []
        );
      })

      .finally(() =>
        setLoading(false)
      );
  }, [companyId]);

  return (
    <AppLayout>
      {/* HEADER */}

      <div className="mb-8">
        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
          Company Reports
        </p>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Security Assessments
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Review all
          technical findings
          and assessments
          performed for this
          company.
        </p>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400 shadow-sm">
          Loading
          assessments...
        </div>
      ) : assessments.length ===
        0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400 shadow-sm">
          No assessments
          found for this
          company.
        </div>
      ) : (
        <>
          {/* SUMMARY */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Assessments
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {
                  assessments.length
                }
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Critical
              </p>

              <p className="text-3xl font-bold text-red-600">
                {assessments.reduce(
                  (
                    sum,
                    a
                  ) =>
                    sum +
                    a.critical,
                  0
                )}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                High
              </p>

              <p className="text-3xl font-bold text-orange-500">
                {assessments.reduce(
                  (
                    sum,
                    a
                  ) =>
                    sum +
                    a.high,
                  0
                )}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Total Findings
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {assessments.reduce(
                  (
                    sum,
                    a
                  ) =>
                    sum +
                    a.totalFindings,
                  0
                )}
              </p>
            </div>
          </div>

          {/* ASSESSMENTS */}

          <div className="space-y-4">
            {assessments.map(
              (a) => {
                const health =
                  computeHealth(
                    a
                  );

                const meta =
                  healthMeta(
                    health
                  );

                return (
                  <div
                    key={
                      a.assessmentId
                    }
                    onClick={() =>
                      navigate(
                        `/admin/reports/assessment/${a.assessmentId}`
                      )
                    }
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-5">
                      {/* LEFT */}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {
                              a.name
                            }
                          </h2>

                          <span className="text-xs text-gray-400">
                            (
                            {
                              a.totalFindings
                            }{" "}
                            findings)
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${meta.color}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${meta.dot}`}
                            />

                            {
                              meta.label
                            }
                          </span>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                          {new Date(
                            a.date
                          ).toDateString()}
                        </p>

                        {/* SEVERITIES */}

                        <div className="flex flex-wrap gap-2">
                          {SEVERITY_BADGES.map(
                            ({
                              key,
                              label,
                              badge,
                            }) => {
                              const count =
                                a[
                                  key
                                ] as number;

                              if (
                                !count
                              )
                                return null;

                              return (
                                <span
                                  key={
                                    key
                                  }
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge}`}
                                >
                                  {
                                    count
                                  }{" "}
                                  {
                                    label
                                  }
                                </span>
                              );
                            }
                          )}

                          {a.totalFindings ===
                            0 && (
                            <span className="text-xs text-gray-400">
                              No findings
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">
                            Security
                            Health
                          </p>

                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${meta.bar}`}
                              style={{
                                width: `${health}%`,
                              }}
                            />
                          </div>

                          <p
                            className={`text-xs font-semibold mt-1 ${meta.color}`}
                          >
                            {
                              health
                            }
                            %
                          </p>
                        </div>

                        <svg
                          className="w-5 h-5 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={
                            2
                          }
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}