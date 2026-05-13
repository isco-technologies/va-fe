/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Clipboard,ShieldAlert,AlertTriangle,CheckCircle2,Plus,} from "lucide-react";
import AppLayout from "../../appLayout";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";

import {fetchAssessments,createAssessment,} from "../../../feature/assessments/assessmentSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import { fetchChecklists } from "../../../feature/checklists/checklistSlice";

const Assessments = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { assessments } = useAppSelector(
    (state) => state.assessments
  );

  const { companies } = useAppSelector(
    (state) => state.companies
  );

  const checklists = useAppSelector(
    (state) => state.checklists.items
  );

  const [search, setSearch] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("ALL");

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedCompany, setSelectedCompany] =
    useState("");

  const [selectedChecklist, setSelectedChecklist] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchCompanies());
    dispatch(fetchChecklists());
  }, [dispatch]);

  // CREATE

  const handleCreate =
    async () => {
      if (
        !selectedCompany ||
        !selectedChecklist
      )
        return;

      try {
        setCreating(true);

        const result =
          await dispatch(
            createAssessment({
              companyId:
                selectedCompany,
              checklistId:
                selectedChecklist,
              name: "",
            })
          );

        const payload =
          result.payload as any;

        if (payload?.id) {
          navigate(
            `/admin/assessments/${payload.id}/review`
          );
        }
      } finally {
        setCreating(false);
      }
    };

  // STATS

  const calculateStats = (assessment: any) => {const findings = assessment.findings || [];
const critical =
    findings.filter(
      (f: any) =>
        f.severity ===
        "CRITICAL"
    ).length;

  const high = findings.filter(
(f: any) =>
        f.severity ===
        "HIGH"
    ).length;

  const medium =
    findings.filter(
      (f: any) =>
        f.severity ===
        "MEDIUM"
    ).length;

  const low =
    findings.filter(
      (f: any) =>
        f.severity ===
        "LOW"
    ).length;

  return {
    total:
      findings.length,
    critical,
    high,
    medium,
    low,

    // USE BACKEND VALUE
    progress:
      assessment.progress || 0,
  };
};

  // FILTERS

  const filtered =
    useMemo(() => {
      let data =
        assessments;

      if (
        activeTab !== "ALL"
      ) {
        data = data.filter(
          (a: any) =>
            a.status ===
            activeTab
        );
      }

      return data.filter(
        (a: any) => {
          const q =
            search.toLowerCase();

          return (
            a.company?.name
              ?.toLowerCase()
              .includes(q) ||
            a.checklist?.name
              ?.toLowerCase()
              .includes(q)
          );
        }
      );
    }, [
      assessments,
      activeTab,
      search,
    ]);

  // OVERVIEW STATS

  const totalAssessments =
    assessments.length;

  const totalCritical =
    assessments.reduce(
      (
        sum: number,
        a: any
      ) =>
        sum +
        calculateStats(a)
          .critical,
      0
    );

  const totalHigh =
    assessments.reduce(
      (
        sum: number,
        a: any
      ) =>
        sum +
        calculateStats(a)
          .high,
      0
    );

  const completedReports =
    assessments.filter(
      (a: any) =>
        a.status ===
        "COMPLETED"
    ).length;

  // TABS

  const tabs = [
    {
      key: "ALL",
      label: "All",
      count:
        assessments.length,
    },

    {
      key: "PENDING",
      label: "Pending",
      count:
        assessments.filter(
          (a: any) =>
            a.status ===
            "PENDING"
        ).length,
    },

    {
      key: "IN PROGRESS",
      label: "In Progress",
      count:
        assessments.filter(
          (a: any) =>
            a.status ===
            "IN PROGRESS"
        ).length,
    },

    {
      key: "COMPLETED",
      label: "Completed",
      count:
        assessments.filter(
          (a: any) =>
            a.status ===
            "COMPLETED"
        ).length,
    },

    {
      key: "REPORTING",
      label: "Reporting",
      count:
        assessments.filter(
          (a: any) =>
            a.status ===
            "REPORTING"
        ).length,
    },
  ];

  const statusStyle = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "REPORTING":
        return "bg-indigo-100 text-indigo-700";

      case "IN PROGRESS":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen space-y-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Vulnerability Assessment Platform
            </p>

            <h1 className="text-4xl font-bold text-gray-900 mt-1">
              Assessments
            </h1>
          </div>

          <button
            onClick={() =>
              setOpenModal(true)
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Total Assessments
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {
                    totalAssessments
                  }
                </h2>
              </div>

              <Clipboard className="w-10 h-10 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Critical Findings
                </p>

                <h2 className="text-4xl font-bold text-red-600 mt-3">
                  {
                    totalCritical
                  }
                </h2>
              </div>

              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  High Findings
                </p>

                <h2 className="text-4xl font-bold text-orange-500 mt-3">
                  {
                    totalHigh
                  }
                </h2>
              </div>

              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Completed Reports
                </p>

                <h2 className="text-4xl font-bold text-green-600 mt-3">
                  {
                    completedReports
                  }
                </h2>
              </div>

              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col lg:flex-row gap-4 justify-between">

          <div className="flex gap-2 flex-wrap">

            {tabs.map(
              (tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(
                      tab.key
                    )
                  }
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition flex items-center gap-2 ${
                    activeTab ===
                    tab.key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab ===
                      tab.key
                        ? "bg-white/20"
                        : "bg-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            )}
          </div>

          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="border border-gray-200 rounded-2xl px-4 py-2 w-full lg:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* TABLE */}

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b">

              <tr>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Company
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Assessment
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Findings
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Critical
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  High
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Progress
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(
                (a: any) => {
                  const stats =
                    calculateStats(
                      a
                    );

                  return (
                    <tr
                      key={a.id}
                      onClick={() =>
                        navigate(
                          `/admin/assessments/${a.id}/review`
                        )
                      }
                      className="border-b hover:bg-gray-50 cursor-pointer transition"
                    >

                      <td className="px-5 py-5 font-semibold text-gray-800">
                        {a.company
                          ?.name ||
                          "—"}
                      </td>

                      <td className="px-5 py-5 text-gray-700">
                        {a.checklist
                          ?.name ||
                          "—"}
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {
                          stats.total
                        }
                      </td>

                      <td className="px-5 py-5">
                        <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                          {
                            stats.critical
                          }
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                          {
                            stats.high
                          }
                        </span>
                      </td>

                      {/* PROGRESS */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{
                                width: `${stats.progress}%`,
                              }}
                            />
                          </div>

                          <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                            {
                              stats.progress
                            }
                            %
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}

              {filtered.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-10 text-gray-400"
                  >
                    No assessments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}

        {openModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                New Assessment
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    Company
                  </label>

                  <select
                    value={
                      selectedCompany
                    }
                    onChange={(e) =>
                      setSelectedCompany(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                  >
                    <option value="">
                      Select company
                    </option>

                    {companies?.map(
                      (c: any) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    Checklist
                  </label>

                  <select
                    value={
                      selectedChecklist
                    }
                    onChange={(e) =>
                      setSelectedChecklist(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                  >
                    <option value="">
                      Select checklist
                    </option>

                    {checklists?.map(
                      (c: any) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">

                <button
                  onClick={() =>
                    setOpenModal(
                      false
                    )
                  }
                  className="px-5 py-2 rounded-2xl border border-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCreate
                  }
                  disabled={
                    creating
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-2xl transition"
                >
                  {creating
                    ? "Creating..."
                    : "Create Assessment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Assessments;