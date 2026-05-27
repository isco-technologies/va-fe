/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";

type Assessment = {
  id: string;
  checklist: { name: string };
  company: { name: string };
  status: "PENDING" | "IN PROGRESS" | "COMPLETED";
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
  const {id} = useParams <{id: string}>();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  const [openControls, setOpenControls] = useState<Record<string, boolean>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
  fetchAssessments().then((list) => {
    if (id && list.length > 0) {
      const target = list.find((a: Assessment) => a.id === id);
      if (target) openAssessment(target);
    }
  });
}, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchAssessments = async (): Promise<Assessment[]> => {
  try {
    const res = await apiClient.get("/assessments/client");
    const data = res.data;
    const safeArray = Array.isArray(data) ? data
      : Array.isArray(data.assessments) ? data.assessments
      : Array.isArray(data.data) ? data.data : [];
    setAssessments(safeArray);
    return safeArray;
  } catch (err) {
    console.error(err);
    setAssessments([]);
    return [];
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
          questions: domain.questions?.map((q: any) => ({
            ...q,
            answer: domainAnswer?.answer,
            remark: domainAnswer?.remark,
          })),
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

      const refreshed = await apiClient.get("/assessments/client");
      const refreshedData = refreshed.data;

      const safeArray = Array.isArray(refreshedData)
        ? refreshedData
        : Array.isArray(refreshedData.assessments)
        ? refreshedData.assessments
        : Array.isArray(refreshedData.data)
        ? refreshedData.data
        : [];

      setAssessments(safeArray);

      const updatedSelected = safeArray.find(
        (a: Assessment) => a.id === selectedAssessment?.id
      );

      if (updatedSelected) {
        setSelectedAssessment(updatedSelected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(domains.length / itemsPerPage);

  const paginatedDomains = domains.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.checklist?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      a.status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    {selectedAssessment.checklist?.name}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedAssessment.company?.name}
                  </p>
                </div>

                <div className="min-w-[180px]">
                  <p className="text-xs text-slate-500 mb-1">Progress</p>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${selectedAssessment.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedAssessment.progress || 0}%
                  </p>
                </div>
              </div>
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
                {["all", "PENDING", "IN PROGRESS", "COMPLETED"].map((tab) => (
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
                  {filteredAssessments.map((a) => (
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
                            style={{ width: `${a.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {a.progress || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssessments.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No assessments found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}