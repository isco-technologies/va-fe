/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";

const SEVERITY: Record<
  string,
  {
    text: string;
    badge: string;
    border: string;
    bg: string;
  }
> = {
  CRITICAL: {
    text: "text-red-600",
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    bg: "bg-red-50",
  },

  HIGH: {
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    border: "border-orange-200",
    bg: "bg-orange-50",
  },

  MEDIUM: {
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },

  LOW: {
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  },
};

const CATEGORY_TITLES: Record<
  string,
  string
> = {
  NETWORK:
    "Network & Systems Findings",

  WEB:
    "Web Application Findings",

  GOVERNANCE:
    "Governance Findings",
};

export default function AssessmentReportPage() {
  const { assessmentId } =
    useParams();

  const [findings, setFindings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) return;

    apiClient
      .get(
        `/reports/assessment/${assessmentId}`
      )

      .then((res) => {
        const data =
          res.data?.data || {};

        const grouped =
          data.groupedFindings ||
          {};

        const flattened =
          Object.values(grouped).flat();

        setFindings(
          flattened as any[]
        );
      })

      .catch((err) => {
        console.error(err);
        setFindings([]);
      })

      .finally(() =>
        setLoading(false)
      );
  }, [assessmentId]);

  const stats = {
    CRITICAL:
      findings.filter(
        (f) =>
          f.severity ===
          "CRITICAL"
      ).length,

    HIGH:
      findings.filter(
        (f) =>
          f.severity === "HIGH"
      ).length,

    MEDIUM:
      findings.filter(
        (f) =>
          f.severity ===
          "MEDIUM"
      ).length,

    LOW:
      findings.filter(
        (f) =>
          f.severity === "LOW"
      ).length,
  };

  const filteredFindings =
    useMemo(() => {
      if (!filter)
        return findings;

      return findings.filter(
        (f) =>
          f.severity === filter
      );
    }, [findings, filter]);

  const groupedFindings =
    useMemo(() => {
      const grouped: Record<
        string,
        any[]
      > = {};

      filteredFindings.forEach(
        (f) => {
          const category =
            f.category ||
            "OTHER";

          if (
            !grouped[category]
          ) {
            grouped[
              category
            ] = [];
          }

          grouped[
            category
          ].push(f);
        }
      );

      return grouped;
    }, [filteredFindings]);

  const renderRow = (
    label: string,
    value: any
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return (
      <div className="grid grid-cols-[220px_1fr] gap-4 py-2 border-b border-gray-100">

        <p className="text-sm font-semibold text-gray-700">
          {label}
        </p>

        <p className="text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
          {typeof value === "object"
            ? JSON.stringify(
                value,
                null,
                2
              )
            : String(value)}
        </p>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Vulnerability Assessment
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Assessment Report
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Assessment ID:{" "}
            {assessmentId}
          </p>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            Loading findings...
          </div>
        ) : (
          <>
            {/* SUMMARY */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase text-gray-400">
                  Total Findings
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {findings.length}
                </h2>
              </div>

              {Object.entries(stats).map(
                ([key, value]) => {
                  const s =
                    SEVERITY[key];

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setFilter(
                          filter === key
                            ? null
                            : key
                        )
                      }
                      className={`bg-white border rounded-2xl p-5 text-left transition ${
                        filter === key
                          ? "ring-2 ring-indigo-200"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="text-xs uppercase text-gray-400">
                        {key}
                      </p>

                      <h2
                        className={`text-4xl font-bold mt-2 ${s.text}`}
                      >
                        {value}
                      </h2>
                    </button>
                  );
                }
              )}
            </div>

            {/* RISK RATING */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">

              <h2 className="text-xl font-semibold text-gray-900 mb-5">
                Risk Rating
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-gray-500 font-semibold">
                        Severity
                      </th>

                      <th className="text-left py-3 text-gray-500 font-semibold">
                        CVSS Score
                      </th>

                      <th className="text-left py-3 text-gray-500 font-semibold">
                        Recommendation
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      {
                        label:
                          "Critical",
                        color:
                          "text-red-600",
                        score:
                          "9.0 - 10.0",
                        rec:
                          "Immediate remediation required",
                      },

                      {
                        label:
                          "High",
                        color:
                          "text-orange-600",
                        score:
                          "7.0 - 8.9",
                        rec:
                          "Fix immediately",
                      },

                      {
                        label:
                          "Medium",
                        color:
                          "text-amber-600",
                        score:
                          "4.0 - 6.9",
                        rec:
                          "Prioritize remediation",
                      },

                      {
                        label:
                          "Low",
                        color:
                          "text-emerald-600",
                        score:
                          "0.1 - 3.9",
                        rec:
                          "Address during next update cycle",
                      },
                    ].map((r) => (
                      <tr
                        key={
                          r.label
                        }
                        className="border-b border-gray-50"
                      >
                        <td
                          className={`py-4 font-semibold ${r.color}`}
                        >
                          {r.label}
                        </td>

                        <td className="py-4">
                          {r.score}
                        </td>

                        <td className="py-4 text-gray-600">
                          {r.rec}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FINDINGS */}

            <div className="space-y-10">

              {Object.entries(
                groupedFindings
              ).map(
                ([
                  category,
                  items,
                ]) => (
                  <div
                    key={category}
                  >

                    {/* CATEGORY */}

                    <div className="mb-5">

                      <h2 className="text-2xl font-bold text-gray-900">
                        {CATEGORY_TITLES[
                          category
                        ] ||
                          `${category} Findings`}
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        {
                          items.length
                        }{" "}
                        finding
                        {items.length !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    {/* FINDING CARDS */}

                    <div className="space-y-6">

                      {items.map(
                        (f) => {
                          const s =
                            SEVERITY[
                              f
                                .severity
                            ] ||
                            SEVERITY.LOW;

                          let dynamicFields =
                            {};

                          try {
                            dynamicFields =
                              typeof (
                                f.dynamicFields ||
                                f.dynamic_fields
                              ) ===
                              "string"
                                ? JSON.parse(
                                    f.dynamicFields ||
                                      f.dynamic_fields
                                  )
                                : (
                                    f.dynamicFields ||
                                    f.dynamic_fields ||
                                    {}
                                  );
                          } catch {
                            dynamicFields =
                              {};
                          }

                          return (
                            <div
                              key={
                                f.id
                              }
                              className={`bg-white border-l-4 ${s.border} rounded-2xl shadow-sm p-7`}
                            >

                              {/* TOP */}

                              <div className="flex items-start justify-between gap-4 mb-6">

                                <div>

                                  <h3 className="text-2xl font-semibold text-gray-900">
                                    {
                                      f.title
                                    }
                                  </h3>

                                  <div className="flex flex-wrap gap-2 mt-3">

                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${s.badge}`}
                                    >
                                      {
                                        f.severity
                                      }
                                    </span>

                                    {f.category && (
                                      <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                        {
                                          f.category
                                        }
                                      </span>
                                    )}

                                    {f.toolName && (
                                      <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                        {
                                          f.toolName
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {f.cvssScore && (
                                  <div className={`border rounded-2xl px-5 py-3 text-center ${s.bg}`}>

                                    <p className="text-[10px] uppercase text-gray-400">
                                      CVSS
                                    </p>

                                    <p className={`text-3xl font-bold ${s.text}`}>
                                      {Number(
                                        f.cvssScore
                                      ).toFixed(
                                        1
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* CONTENT */}

                              <div className="space-y-1">

                                {renderRow(
                                  "Description",
                                  f.description
                                )}

                                {renderRow(
                                  "Impact",
                                  f.impact
                                )}

                                {renderRow(
                                  "Recommendation",
                                  f.recommendation
                                )}

                                {renderRow(
                                  "Evidence",
                                  f.evidence
                                )}

                                {renderRow(
                                  "Affected Systems",
                                  f.affectedSystems
                                )}

                                {renderRow(
                                  "Affected URLs",
                                  f.affectedUrls
                                )}

                                {/* DYNAMIC FIELDS */}

                                {Object.entries(
                                  dynamicFields
                                ).map(
                                  ([
                                    key,
                                    value,
                                  ]) =>
                                    renderRow(
                                      key
                                        .replace(
                                          /[-_]/g,
                                          " "
                                        )
                                        .replace(
                                          /\b\w/g,
                                          (
                                            c
                                          ) =>
                                            c.toUpperCase()
                                        ),

                                      value
                                    )
                                )}
                              </div>

                              {/* FOOTER */}

                              <div className="flex flex-wrap justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">

                                <div className="flex flex-wrap gap-3">

                                  {f.cvssVector && (
                                    <span className="font-mono bg-gray-100 border border-gray-200 rounded px-2 py-1">
                                      {
                                        f.cvssVector
                                      }
                                    </span>
                                  )}
                                </div>

                                {f.createdAt && (
                                  <span>
                                    Created{" "}
                                    {new Date(
                                      f.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}