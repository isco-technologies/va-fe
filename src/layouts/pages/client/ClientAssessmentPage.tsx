import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";

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
};

export default function ClientAssessmentPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get("/assessments/client");

      const data = res.data;

      const safeArray =
        Array.isArray(data)
          ? data
          : Array.isArray(data.assessments)
          ? data.assessments
          : Array.isArray(data.data)
          ? data.data
          : [];

      setAssessments(safeArray);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setAssessments([]);
    }
  };

  // ================= OPEN =================
  const openAssessment = async (assessment: Assessment) => {
    try {
      setLoading(true);
      setSelectedAssessment(assessment);

      const res = await apiClient.get(
        `/assessments/${assessment.id}/details`
      );

      const data = res.data;

      const safeDomains =
        Array.isArray(data)
          ? data
          : Array.isArray(data.domains)
          ? data.domains
          : [];

      setDomains(safeDomains);
    } catch (err) {
      console.error("Error loading details:", err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= ANSWER =================
  const handleAnswer = async (questionId: string, value: string) => {
    try {
      await apiClient.post("/answers", {
        questionId,
        answer: value,
      });

      setDomains((prev) =>
        prev.map((d) => ({
          ...d,
          controls: d.controls.map((c) => ({
            ...c,
            questions: c.questions.map((q) =>
              q.id === questionId ? { ...q, answer: value } : q
            ),
          })),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FILTER =================
  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.checklist?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      activeTab === "all" ||
      (activeTab === "draft" && a.status === "DRAFT") ||
      (activeTab === "in_progress" && a.status === "IN_PROGRESS") ||
      (activeTab === "completed" && a.status === "COMPLETED");

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6">

        {/* = DETAIL VIEW = */}
        {selectedAssessment ? (
          <div>
            <button
              onClick={() => setSelectedAssessment(null)}
              className="mb-4 text-blue-600 hover:underline"
            >
              ← Back to assessments
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedAssessment.checklist?.name}
            </h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              domains.map((domain) => (
                <div key={domain.id} className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {domain.name}
                  </h3>

                  {domain.controls.map((control) => (
                    <div
                      key={control.id}
                      className="border p-4 mb-3 rounded-lg bg-white shadow-sm"
                    >
                      <p className="font-medium mb-2">
                        {control.code} - {control.title}
                      </p>

                      {control.questions.map((q) => (
                        <div
                          key={q.id}
                          className="flex justify-between items-center mt-2"
                        >
                          <span>{q.text}</span>

                          <div className="flex gap-2">
                            {["YES", "NO", "NA"].map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  handleAnswer(q.id, opt)
                                }
                                className={`px-3 py-1 border rounded-md text-sm ${
                                  q.answer === opt
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ) : (
          <div>

            {/* = HEADER = */}
            <div className="flex items-center justify-between mb-4 gap-4">

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search by company or checklist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* TABS */}
              <div className="flex gap-6 border-b whitespace-nowrap">
                {["all", "draft", "in_progress", "completed"].map(
                  (tab) => (
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
                  )
                )}
              </div>

            </div>

            {/* = INFO = */}
            <div className="bg-yellow-50 border border-yellow-200 text-sm px-4 py-2 rounded mb-4">
              Showing assigned assessments for your company
            </div>

            {/* = TABLE = */}
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
                  {filteredAssessments.length > 0 ? (
                    filteredAssessments.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => openAssessment(a)}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          {a.company?.name}
                        </td>

                        <td className="px-4 py-3">
                          {a.checklist?.name}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              a.status === "COMPLETED"
                                ? "bg-green-100 text-green-600"
                                : a.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 w-48">
                          <div className="w-full bg-gray-200 h-2 rounded">
                            <div
                              className="bg-indigo-600 h-2 rounded"
                              style={{
                                width: `${a.progress || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {a.progress || 0}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No assessments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  );
}