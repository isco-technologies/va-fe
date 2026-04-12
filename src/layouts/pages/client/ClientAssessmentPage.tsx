import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronDown, ChevronRight } from "lucide-react";

type Assessment = {
  id: string;
  checklist: { name: string };
  company: { name: string };
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
};

type Question = {
  id: string;
  text: string;
  answer?: string;
  remark?: string;
};

type Control = {
  id: string;
  code: string;
  title: string;
  questions: Question[];
};

type Domain = {
  id: string;
  name: string;
  controls: Control[];
  questions: Question[];
};

export default function ClientAssessmentPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  const [openControls, setOpenControls] = useState<Record<string, boolean>>({});
  //const [answers, setAnswers] = useState<Record<string, { answer: string; remark?: string }>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get("/assessments/client");
      const data = res.data;

      const safeArray = Array.isArray(data)
        ? data
        : Array.isArray(data.assessments)
        ? data.assessments
        : Array.isArray(data.data)
        ? data.data
        : [];
        
        //
        const updated = await Promise.all(
        safeArray.map(async (a: any) => {
          try {
            const [detailsRes, answersRes] = await Promise.all([
              apiClient.get(`/assessments/${a.id}/details`),
              apiClient.get(`/assessment-answers/${a.id}`),
            ]);

            const domains =
              detailsRes.data.domains || detailsRes.data || [];

            const answers = answersRes.data.data || [];

            const progress = calculateProgress(domains, answers);

            return { ...a, progress };
          } catch {
            return { ...a, progress: 0 };
          }
        })
      );

      setAssessments(updated);
    } catch (err) {
      console.error(err);
      setAssessments([]);
    }
  };

  const openAssessment = async (assessment: Assessment) => {
  try {
    setLoading(true);
    setSelectedAssessment(assessment);

    const [detailsRes, answersRes] = await Promise.all([
      apiClient.get(`/assessments/${assessment.id}/details`),
      apiClient.get(`/assessment-answers/${assessment.id}`),
    ]);

    const details = detailsRes.data;
    const answers = answersRes.data.data || []; 

    const safeDomains = Array.isArray(details)
      ? details
      : Array.isArray(details.domains)
      ? details.domains
      : [];

    
    const answerMap: Record<string, { answer: string; remark?: string }> = {};

    answers.forEach((a: any) => {
      if (a.control) {
        answerMap[`control-${a.control.id}`] = {
          answer: a.answer,
          remark: a.remark,
        };
      }
      if (a.domain) {
        answerMap[`domain-${a.domain.id}`] = {
          answer: a.answer,
          remark: a.remark,
        };
      }
    });

    
    const mappedDomains = safeDomains.map((domain: any) => {
      const domainAnswer = answerMap[`domain-${domain.id}`];

      return {
        ...domain,

        // DOMAIN QUESTIONS
        questions: domain.questions?.map((q: any) => ({
          ...q,
          answer: domainAnswer?.answer,
          remark: domainAnswer?.remark,
        })),

        // CONTROLS
        controls: domain.controls.map((control: any) => {
          const controlAnswer = answerMap[`control-${control.id}`];

          return {
            ...control,
            questions: control.questions.map((q: any) => ({
              ...q,
              answer: controlAnswer?.answer,
              remark: controlAnswer?.remark,
            })),
          };
        }),
      };
    });

    setDomains(mappedDomains);
    setCurrentPage(1);
  } catch (err) {
    console.error(err);
    setDomains([]);
  } finally {
    setLoading(false);
  }
};

  const handleAnswer = async (
    questionId: string,
    value: string,
    remark?: string,
    controlId?: string,
    domainId?: string
  ) => {
    try {
      await apiClient.post("/assessment-answers", {
        assessmentId: selectedAssessment?.id,
        questionId,
        answer: value,
        remark,
        controlId,
        domainId,
      });

      setDomains((prev) =>
        prev.map((d) => ({
          ...d,
          questions: d.questions?.map((q) =>
            q.id === questionId
              ? { ...q, answer: value, remark: remark ?? q.remark }
              : q
          ),
          controls: d.controls.map((c) => ({
            ...c,
            questions: c.questions.map((q) =>
              q.id === questionId
                ? { ...q, answer: value, remark: remark ?? q.remark }
                : q
            ),
          })),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(domains.length / itemsPerPage);

  const paginatedDomains = domains.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
const calculateProgress = (domains: any[], answers: any[]) => {
  if (!domains.length) return 0;

  let total = 0;
  let answered = 0;

  const answerMap: Record<string, boolean> = {};

  answers.forEach((a) => {
    if (a.control) answerMap[`control-${a.control.id}`] = true;
    if (a.domain) answerMap[`domain-${a.domain.id}`] = true;
  });

  domains.forEach((d) => {
    // Domain-level
    if (d.questions?.length > 0) {
      total += 1;
      if (answerMap[`domain-${d.id}`]) answered += 1;
    }

    // Controls
    d.controls.forEach((c: any) => {
      total += 1;
      if (answerMap[`control-${c.id}`]) answered += 1;
    });
  });

  return total === 0 ? 0 : Math.round((answered / total) * 100);
};


  return (
    <AppLayout>
      <div className="p-6">
        {selectedAssessment ? (
          <div>
            <button
              onClick={() => setSelectedAssessment(null)}
              className="px-3 py-1 rounded text-sm mb-4 bg-blue-500 text-white hover:bg-blue-600"
            >
              ← Back to assessments
            </button>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h1 className="text-xl font-semibold text-slate-800">
                {selectedAssessment.checklist?.name}
              </h1>
            </div>

            {loading ? (
              <p className="border-t p-4 rounded bg-gray-100">Loading...</p>
            ) : (
              <div className="mb-4 text-sm text-slate-500">
                {paginatedDomains.map((domain, index) => (
                  <div
                    key={domain.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4"
                  >
                    <div
                      className="flex justify-between items-center px-5 py-4 cursor-pointer"
                      onClick={() =>
                        setOpenDomains((prev) => ({
                          ...prev,
                          [domain.id]: !prev[domain.id],
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        {openDomains[domain.id] ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}

                        <div>
                          <p className="text-sm text-slate-500">
                            Domain {index + 1}
                          </p>
                          <p className="font-semibold text-slate-800">
                            {domain.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-slate-500">
                        Controls: {domain.controls.length}
                      </div>
                    </div>

                    {openDomains[domain.id] && (
                      <div className="px-5 pb-4">
                        {domain.questions?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-400 mb-2">
                              Domain Questions
                            </p>

                            {domain.questions.map((q) => (
                              <div
                                key={q.id}
                                className="border rounded-lg p-4 mb-3 bg-slate-50"
                              >
                                <p className="text-sm mb-2">{q.text}</p>

                                <div className="flex gap-2 mb-2">
                                  {["YES", "NO", "NA"].map((opt) => (
                                    <button
                                      key={opt}
                                      onClick={() =>
                                        handleAnswer(
                                          q.id,
                                          opt,
                                          q.remark,
                                          undefined,
                                          domain.id
                                        )
                                      }
                                      className={`px-3 py-1 rounded-md border text-sm ${
                                        q.answer === opt
                                          ? "bg-indigo-600 text-white border-indigo-600"
                                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>

                                <input
                                  value={q.remark || ""}
                                  onChange={(e) => {
                                    const remark = e.target.value;

                                    setDomains((prev) =>
                                      prev.map((d) => ({
                                        ...d,
                                        questions: d.questions?.map((qq) =>
                                          qq.id === q.id
                                            ? { ...qq, remark }
                                            : qq
                                        ),
                                      }))
                                    );
                                  }}
                                  onBlur={() =>
                                    handleAnswer(
                                      q.id,
                                      q.answer || "",
                                      q.remark,
                                      undefined,
                                      domain.id
                                    )
                                  }
                                  placeholder="Optional remark..."
                                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {domain.controls.map((control) => (
                          <div
                            key={control.id}
                            className="border rounded-lg p-4 mb-3"
                          >
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() =>
                                setOpenControls((prev) => ({
                                  ...prev,
                                  [control.id]: !prev[control.id],
                                }))
                              }
                            >
                              <div className="flex items-center gap-2">
                                {openControls[control.id] ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}

                                <p className="font-medium">
                                  {control.code} - {control.title}
                                </p>
                              </div>
                            </div>

                            {openControls[control.id] && (
                              <div className="mt-3">
                                {control.questions.map((q) => (
                                  <div
                                    key={q.id}
                                    className="border-t pt-3 mt-3"
                                  >
                                    <p className="text-sm mb-2">{q.text}</p>

                                    <div className="flex gap-2 mb-2">
                                      {["YES", "NO", "NA"].map((opt) => (
                                        <button
                                          key={opt}
                                          onClick={() =>
                                            handleAnswer(
                                              q.id,
                                              opt,
                                              q.remark,
                                              control.id
                                            )
                                          }
                                          className={`px-3 py-1 rounded-md border text-sm ${
                                            q.answer === opt
                                              ? "bg-indigo-600 text-white border-indigo-600"
                                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>

                                    <input
                                      value={q.remark || ""}
                                      onChange={(e) => {
                                        const remark = e.target.value;

                                        setDomains((prev) =>
                                          prev.map((d) => ({
                                            ...d,
                                            controls: d.controls.map((c) => ({
                                              ...c,
                                              questions: c.questions.map(
                                                (qq) =>
                                                  qq.id === q.id
                                                    ? { ...qq, remark }
                                                    : qq
                                              ),
                                            })),
                                          }))
                                        );
                                      }}
                                      onBlur={() =>
                                        handleAnswer(
                                          q.id,
                                          q.answer || "",
                                          q.remark,
                                          control.id
                                        )
                                      }
                                      placeholder="Optional remark..."
                                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded text-sm disabled:opacity-50"
                    >
                      ← Previous
                    </button>

                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded text-sm disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-3 py-2 border rounded-md"
              />

              <div className="flex gap-6 border-b whitespace-nowrap">
                {["all", "draft", "in_progress", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Checklist</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                  </tr>
                </thead>

                <tbody>
                  {assessments.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => openAssessment(a)}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">{a.company?.name}</td>
                      <td className="px-4 py-3">{a.checklist?.name}</td>
                      <td className="px-4 py-3">{a.status}</td>
                      <td className="px-4 py-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}