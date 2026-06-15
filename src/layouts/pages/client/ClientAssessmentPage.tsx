/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronDown, ChevronRight, ArrowLeft,Check } from "lucide-react";
import { useParams } from "react-router-dom";

type Assessment = {
  id: string;
  checklist: { name: string };
  company: { name: string };
  status: "PENDING" | "IN PROGRESS" | "COMPLETED";
  progress: number;
};
type Question = { id: string; text: string; answer?: string; remark?: string };
type Control  = { id: string; code: string; title: string; questions: Question[] };
type Domain   = { id: string; name: string; controls: Control[]; questions: Question[] };

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  COMPLETED:     { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "IN PROGRESS": { label: "In Progress", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200",   dot: "bg-indigo-500" },
  PENDING:       { label: "Pending",     cls: "bg-amber-50 text-amber-700 border border-amber-200",      dot: "bg-amber-400"  },
};

// Backend enum uses underscores (e.g. "IN_PROGRESS"); normalize to match STATUS_CONFIG keys/tabs
const normalizeStatus = (status: string) => status.replace(/_/g, " ");

export default function ClientAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab]       = useState("all");
  const [search, setSearch]             = useState("");
  const [assessments, setAssessments]   = useState<Assessment[]>([]);
  const [selected, setSelected]         = useState<Assessment | null>(null);
  const [domains, setDomains]           = useState<Domain[]>([]);
  const [loading, setLoading]           = useState(false);
  const [openDomains, setOpenDomains]   = useState<Record<string, boolean>>({});
  const [openControls, setOpenControls] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    fetchAssessments().then((list) => {
      if (id && list.length > 0) {
        const target = list.find((a: Assessment) => a.id === id);
        if (target) openAssessment(target);
      }
    });
  }, [id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  const fetchAssessments = async (): Promise<Assessment[]> => {
    try {
      const res = await apiClient.get("/assessments/client");
      const data = res.data;
      const arr = Array.isArray(data) ? data
        : Array.isArray(data.assessments) ? data.assessments
        : Array.isArray(data.data) ? data.data : [];
      setAssessments(arr);
      return arr;
    } catch { setAssessments([]); return []; }
  };

  const openAssessment = async (assessment: Assessment) => {
    try {
      setLoading(true);
      setSelected(assessment);
      const [detailsRes, answersRes] = await Promise.all([
        apiClient.get(`/assessments/${assessment.id}/details`),
        apiClient.get(`/assessment-answers/${assessment.id}`),
      ]);
      const details = detailsRes.data;
      const answers = answersRes.data.data || [];
      const safeDomains = Array.isArray(details) ? details : Array.isArray(details.domains) ? details.domains : [];
      const answerMap: Record<string, { answer: string; remark?: string }> = {};
      answers.forEach((a: any) => {
        if (a.control) answerMap[`control-${a.control.id}`] = { answer: a.answer, remark: a.remark };
        if (a.domain)  answerMap[`domain-${a.domain.id}`]   = { answer: a.answer, remark: a.remark };
      });
      setDomains(safeDomains.map((domain: any) => ({
        ...domain,
        questions: domain.questions?.map((q: any) => ({ ...q, ...answerMap[`domain-${domain.id}`] })),
        controls: domain.controls.map((control: any) => ({
          ...control,
          questions: control.questions.map((q: any) => ({ ...q, ...answerMap[`control-${control.id}`] })),
        })),
      })));
      setCurrentPage(1);
    } catch { setDomains([]); }
    finally { setLoading(false); }
  };

  const handleAnswer = async (questionId: string, value: string, remark?: string, controlId?: string, domainId?: string) => {
    try {
      await apiClient.post("/assessment-answers", {
        assessmentId: selected?.id, questionId, answer: value, remark, controlId, domainId,
      });
      setDomains((prev) => prev.map((d) => ({
        ...d,
        questions: d.questions?.map((q) => q.id === questionId ? { ...q, answer: value, remark: remark ?? q.remark } : q),
        controls: d.controls.map((c) => ({
          ...c,
          questions: c.questions.map((q) => q.id === questionId ? { ...q, answer: value, remark: remark ?? q.remark } : q),
        })),
      })));
      const refreshed = await apiClient.get("/assessments/client");
      const arr = Array.isArray(refreshed.data) ? refreshed.data : Array.isArray(refreshed.data.data) ? refreshed.data.data : [];
      setAssessments(arr);
      const updated = arr.find((a: Assessment) => a.id === selected?.id);
      if (updated) setSelected(updated);
    } catch { /* noop */ }
  };

  const totalPages       = Math.ceil(domains.length / itemsPerPage);
  const paginatedDomains = domains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredAssessments = assessments.filter((a) => {
    const matchSearch = a.company?.name?.toLowerCase().includes(search.toLowerCase()) || a.checklist?.name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || normalizeStatus(a.status).toLowerCase() === activeTab.toLowerCase();
    return matchSearch && matchTab;
  });

  // ─── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (selected) {
    const cfg  = STATUS_CONFIG[normalizeStatus(selected.status)] || STATUS_CONFIG.PENDING;
    const prog = selected.progress || 0;

    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

          <button onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft size={14} /> Back to assessments
          </button>

          {/* HEADER */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Assessment</p>
                <h1 className="text-xl font-bold text-gray-900">{selected.checklist?.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{selected.company?.name}</p>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-gray-500">Progress</p>
                <p className="text-xs font-bold text-gray-700">{prog}%</p>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${prog === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: `${prog}%` }} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          ) : (
            <>
              {paginatedDomains.map((domain) => (
                <div key={domain.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                  <button type="button"
                    onClick={() => setOpenDomains((p) => ({ ...p, [domain.id]: !p[domain.id] }))}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${openDomains[domain.id] ? "bg-indigo-500" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                        {openDomains[domain.id]
                          ? <ChevronDown size={13} className="text-white" />
                          : <ChevronRight size={13} className="text-gray-500" />}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Domain</p>
                        <p className="font-semibold text-gray-900 text-sm">{domain.name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{domain.controls.length} controls</span>
                  </button>

                  {openDomains[domain.id] && (
                    <div className="border-t border-gray-100 px-6 py-4 space-y-3">

                      {domain.questions?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Domain Questions</p>
                          {domain.questions.map((q) => (
                            <QuestionCard key={q.id} q={q}
                              onAnswer={(val, remark) => handleAnswer(q.id, val, remark, undefined, domain.id)}
                              onRemarkChange={(remark) => setDomains((prev) => prev.map((d) => ({
                                ...d, questions: d.questions?.map((qq) => qq.id === q.id ? { ...qq, remark } : qq),
                              })))}
                            />
                          ))}
                        </div>
                      )}

                      {domain.controls.map((control) => (
                        <div key={control.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button type="button"
                            onClick={() => setOpenControls((p) => ({ ...p, [control.id]: !p[control.id] }))}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                          >
                            <div className="flex items-center gap-2">
                              {openControls[control.id]
                                ? <ChevronDown size={13} className="text-gray-400" />
                                : <ChevronRight size={13} className="text-gray-400" />}
                              <span className="text-[10px] font-mono text-indigo-500 font-semibold">{control.code}</span>
                              <span className="text-sm font-medium text-gray-800">{control.title}</span>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">{control.questions.length}Q</span>
                          </button>

                          {openControls[control.id] && (
                            <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50/40">
                              {control.questions.map((q) => (
                                <QuestionCard key={q.id} q={q}
                                  onAnswer={(val, remark) => handleAnswer(q.id, val, remark, control.id)}
                                  onRemarkChange={(remark) => setDomains((prev) => prev.map((d) => ({
                                    ...d, controls: d.controls.map((c) => ({
                                      ...c, questions: c.questions.map((qq) => qq.id === q.id ? { ...qq, remark } : qq),
                                    })),
                                  })))}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                  <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
                  >
                    <ArrowLeft size={13} /> Previous
                  </button>
                  <span className="text-sm text-gray-500">Domain {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AppLayout>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-sm text-gray-400 mt-1">Select an assessment below to begin or continue.</p>
        </div>

        {/* SEARCH + TABS */}
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: "all", label: "All" },
              { key: "PENDING", label: "Pending" },
              { key: "IN PROGRESS", label: "In Progress" },
              { key: "COMPLETED", label: "Completed" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""}</span>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Checklist</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-48">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((a, idx) => {
                const cfg  = STATUS_CONFIG[normalizeStatus(a.status)] || STATUS_CONFIG.PENDING;
                const prog = a.progress || 0;
                return (
                  <tr key={a.id} onClick={() => openAssessment(a)}
                    className={`cursor-pointer hover:bg-indigo-50/40 transition ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{a.company?.name}</td>
                    <td className="px-6 py-4 text-gray-600">{a.checklist?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${prog === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                            style={{ width: `${prog}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{prog}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAssessments.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No assessments found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── QUESTION CARD ─────────────────────────────────────────────────────────────

function QuestionCard({ q, onAnswer, onRemarkChange }: {
  q: Question;
  onAnswer: (val: string, remark?: string) => void;
  onRemarkChange: (remark: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  const submitRemark = () => {
    if (!q.remark?.trim()) return;
    onAnswer(q.answer || "", q.remark);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ANSWER_STYLES: Record<string, string> = {
    YES: "bg-emerald-500 border-emerald-500 text-white",
    NO:  "bg-red-500 border-red-500 text-white",
    NA:  "bg-gray-400 border-gray-400 text-white",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      <p className="text-sm text-gray-700 leading-relaxed">{q.text}</p>
      <div className="flex gap-2">
        {["YES", "NO", "NA"].map((opt) => (
          <button key={opt} type="button" onClick={() => onAnswer(opt, q.remark)}
            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition ${
              q.answer === opt
                ? ANSWER_STYLES[opt]
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          value={q.remark || ""}
          placeholder="Add a remark and press Enter…"
          onChange={(e) => onRemarkChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitRemark(); } }}
          onBlur={submitRemark}
          className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 focus:bg-white"
        />
        {saved && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600">
            <Check size={13} />
          </div>
        )}
      </div>
    </div>
  );
}