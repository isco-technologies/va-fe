/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Clipboard,ShieldAlert,AlertTriangle,CheckCircle2,Plus,ChevronLeft,ChevronRight,} from "lucide-react";
import AppLayout from "../../appLayout";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchAssessments,createAssessment,} from "../../../feature/assessments/assessmentSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import { fetchChecklists } from "../../../feature/checklists/checklistSlice";

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  COMPLETED:    { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  IN_PROGRESS:  { label: "In Progress", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200",    dot: "bg-indigo-500" },
  PENDING:      { label: "Pending",     cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400"  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status?.replace(" ", "_")] || STATUS_CONFIG.PENDING;

const Assessments = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { assessments } = useAppSelector((state) => state.assessments);
  const { companies } = useAppSelector((state) => state.companies);
  const checklists = useAppSelector((state) => state.checklists.items);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchCompanies());
    dispatch(fetchChecklists());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  // CREATE
  const handleCreate = async () => {
    if (!selectedCompany || !selectedChecklist) return;
    try {
      setCreating(true);
      const result = await dispatch(
        createAssessment({
          companyId: selectedCompany,
          checklistId: selectedChecklist,
          name: "",
          type: "",
          conductedById: ""
        })
      );
      const payload = result.payload as any;
      if (payload?.id) {
        navigate(`/admin/assessments/${payload.id}/review`);
      }
    } finally {
      setCreating(false);
    }
  };

  // STATS — critical/high/medium/low/findingsCount now come pre-computed
  // from the backend (AssessmentService.getAll), since severity actually
  // lives inside each finding's dynamicFields, not the raw finding.severity
  // column (which is always null and can't be used here).
  const calculateStats = (assessment: any) => {
    return {
      total: assessment.findingsCount ?? (assessment.findings?.length || 0),
      critical: assessment.critical || 0,
      high: assessment.high || 0,
      medium: assessment.medium || 0,
      low: assessment.low || 0,
      progress: assessment.progress || 0,
    };
  };

  // FILTERS
  const filtered = useMemo(() => {
    let data = assessments;
    if (activeTab !== "ALL") {
      data = data.filter((a: any) => a.status === activeTab);
    }
    return data.filter((a: any) => {
      const q = search.toLowerCase();
      return (
        a.company?.name?.toLowerCase().includes(q) ||
        a.checklist?.name?.toLowerCase().includes(q)
      );
    });
  }, [assessments, activeTab, search]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // OVERVIEW STATS
  const totalAssessments = assessments.length;
  const totalCritical = assessments.reduce((sum: number, a: any) => sum + calculateStats(a).critical, 0);
  const totalHigh = assessments.reduce((sum: number, a: any) => sum + calculateStats(a).high, 0);
  const completedReports = assessments.filter((a: any) => a.status === "COMPLETED").length;

  // TABS
  const tabs = [
    { key: "ALL", label: "All", count: assessments.length },
    { key: "PENDING", label: "Pending", count: assessments.filter((a: any) => a.status === "PENDING").length },
    { key: "IN_PROGRESS", label: "In Progress", count: assessments.filter((a: any) => a.status?.replace(" ", "_") === "IN_PROGRESS").length },
    { key: "COMPLETED", label: "Completed", count: assessments.filter((a: any) => a.status === "COMPLETED").length },
  ];

  // Page number buttons with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
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
            <h1 className="text-4xl font-bold text-gray-900 mt-1">Assessments</h1>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-indigo-500" />
                Total Assessments
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalAssessments}</h2>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {completedReports} completed
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Critical Findings
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalCritical}</h2>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {totalCritical} critical
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                High Findings
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalHigh}</h2>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              {totalHigh} high severity
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Completed Reports
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{completedReports}</h2>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {totalAssessments - completedReports} in progress
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? "bg-white/20" : "bg-white"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-2 w-full lg:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Company</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Assessment</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Findings</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Critical</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">High</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Progress</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a: any, idx: number) => {
                const stats = calculateStats(a);
                const cfg = getStatusConfig(a.status);
                return (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/admin/assessments/${a.id}/review`)}
                    className={`hover:bg-gray-50 cursor-pointer transition ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <td className="px-5 py-5 font-semibold text-gray-800">{a.company?.name || "—"}</td>
                    <td className="px-5 py-5 text-gray-700">{a.checklist?.name || "—"}</td>
                    <td className="px-5 py-5 font-semibold">{stats.total}</td>
                    <td className="px-5 py-5">
                      <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">{stats.critical}</span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">{stats.high}</span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 w-40">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stats.progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-9 text-right">{stats.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-gray-400">
                    No assessments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-8 h-8 rounded-lg text-sm border transition ${
                        page === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Assessment</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                  >
                    <option value="">Select company</option>
                    {companies?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Checklist</label>
                  <select
                    value={selectedChecklist}
                    onChange={(e) => setSelectedChecklist(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                  >
                    <option value="">Select checklist</option>
                    {checklists?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-5 py-2 rounded-2xl border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-2xl transition"
                >
                  {creating ? "Creating..." : "Create Assessment"}
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