import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronRight, ChevronDown, } from "lucide-react";
import { useParams } from "react-router-dom";


type Question = {
  id: string;
  text: string;
  answer?: string;
  remark?: string;
  controlTitle?: string | null; 
};

type Control = {
  id: string;
  title: string;
  questions?: Question[];
};

type Domain = {
  id: string;
  name: string;
  controls?: Control[];
  questions?: Question[];
};

export default function AdminAssessmentReviewPage() {
  const { assessmentId } = useParams();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [assessmentName, setAssessmentName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    toolName: "",
    title: "",
    description: "",
    severity: "LOW",
    cvssScore: "",
    cvssVector: "",
    affectedSystems: "",
    affectedUrls: "",
    impact: "",
    recommendation: "",
    evidence: "",
    reference: "",
    domainId: "",
    controlId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [currentDomainIndex]);

  const fetchData = async () => {
    try {
      const res = await apiClient.get(
        `/admin/assessments/${assessmentId}/review`
      );

      if (Array.isArray(res.data)) {
        setDomains(res.data);
      } else {
        setDomains(res.data.domains || []);
        setAssessmentName(res.data.assessmentName || "");
        setCompanyName(res.data.companyName || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const domain = domains[currentDomainIndex];

  // preserve controls info
  const allQuestions = useMemo(() => {
    if (!domain) return [];

    return [
      ...(domain.questions || []).map((q) => ({
        ...q,
        controlTitle: null,
      })),

      ...(domain.controls || []).flatMap((c) =>
        (c.questions || []).map((q) => ({
          ...q,
          controlTitle: c.title,
        }))
      ),
    ];
  }, [domain]);

  const controlsCount = domain?.controls?.length || 0;
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* HEADER */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Assessment Review
          </h1>
          <p className="text-sm text-slate-500">
            Review client responses and add findings
          </p>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && domains.length === 0 && (
          <p className="text-sm text-slate-500">No data available</p>
        )}

        {!loading && domain && (
          <>
            {/* TOP CARD */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {assessmentName || "Assessment"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {companyName || "Client"}
              </p>
            </div>

            {/* DOMAIN CARD */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-blue-100 transition"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}

                  <div>
                    <p className="text-xs text-slate-400">
                      Domain {currentDomainIndex + 1}
                    </p>
                    <h3 className="text-lg font-medium text-slate-900">
                      {domain.name}
                    </h3>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  {controlsCount} controls
                </span>
              </div>

              {/* CONTENT */}
              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="mt-3 rounded-lg bg-slate-50 p-5 border border-slate-100">
                    {allQuestions.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No questions available
                      </p>
                    ) : (
                      <SingleQuestionCarousel questions={allQuestions} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FINDING FORM */}
            {/*add search */}
            <div className="flex items-center  gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                    Search Questions 
                </h2>   
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                    className="border px-3 py-2 rounded-md w-64"
                />
            </div>

            <div className="bg-green-50 rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-medium text-slate-900">
                    Add External Finding
                </h3>
                <p className="text-sm text-slate-500">
                    Add a new finding based on the client's responses
                </p>
                <form className="mt-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Tool Name
                        </label>
                        <input
                            type="text"
                            value={form.toolName}
                            onChange={(e) => setForm({ ...form, toolName: e.target.value })}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Title
                        </label>
                        <input
                            name="text"
                            placeholder="Title of the finding"  
                            value={form.title}
                            onChange={handleChange}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />

                        <select
                        name="severity"
                        value={form.severity}
                        onChange={handleChange} 
                        className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>

                        <input
                            name="cvssScore"
                            placeholder="CVSS Score"  
                            value={form.cvssScore}
                            onChange={handleChange}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                        <div 
                        className="text-sm text-slate-500 mt-1">
                           <label className="block text-sm font-medium text-slate-700">
                           Description
                           </label> 
                           <textarea
                            name="description"
                            placeholder="Description of the finding"  
                            value={form.description}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                        </textarea>
                        </div>
                        <label className="block text-sm font-medium text-slate-700">
                            Recommendation
                        </label>
                        <textarea
                        name="recommendations"
                        placeholder="Recommended remediation steps"
                        value={form.recommendation}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                        <label className="block text-sm font-medium text-slate-700">
                            Evidence
                        </label>
                        <textarea                        name="evidence"
                        placeholder="Evidence supporting the finding"
                        value={form.evidence} 
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                        <label className="block text-sm font-medium text-slate-700">
                            Reference
                        </label>
                        <input  
                        name="reference"
                        placeholder="Reference URL or document"
                        value={form.reference}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />  
                          <label className="block text-sm font-medium text-slate-700">
                            Affected Systems
                        </label>
                        <input
                          name="URLs"
                          placeholder="Comma-separated list of affected URLs or systems"
                          value={form.affectedSystems}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                    >   
                        Add Finding

                    </button>
                </form>
            </div>
          </>
        )}

         {/* NAVIGATION */}
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setCurrentDomainIndex((i) => Math.max(i - 1, 0))
                }
                disabled={currentDomainIndex === 0}
                className="px-5 py-2 text-sm border border-slate-300 rounded-md text-slate-500 disabled:opacity-50 bg-white"
              >
                ← Previous
              </button>

              <span className="text-sm text-slate-500">
                Page {currentDomainIndex + 1} of {domains.length}
              </span>

              <button
                onClick={() =>
                  setCurrentDomainIndex((i) =>
                    Math.min(i + 1, domains.length - 1)
                  )
                }
                disabled={currentDomainIndex === domains.length - 1}
                className="px-5 py-2 text-sm border border-slate-300 rounded-md text-slate-700 disabled:opacity-50 bg-white"
              >
                Next →
              </button>
            </div>

        {!loading && !domain && (
            <p className="text-sm text-slate-500">No domain data available</p>
        )}
      </div>
    </AppLayout>
  );
}

function SingleQuestionCarousel({ questions }: { questions: Question[] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questions]);

  const q = questions[currentQuestionIndex];
  if (!q) return null;

  return (
    <div className="space-y-5">

      {/* SHOW CONTROL */}
      {q.controlTitle && (
        <p className="text-xs text-slate-400">{q.controlTitle}</p>
      )}

      <p className="text-base font-medium text-slate-900">{q.text}</p>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-slate-500">Answer:</span>{" "}
          <span className="font-medium text-slate-900">
            {q.answer || "N/A"}
          </span>
        </p>

        {q.remark && (
          <p>
            <span className="text-slate-500">Remark:</span>{" "}
            <span className="text-slate-700">{q.remark}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3">
        <button
          onClick={() =>
            setCurrentQuestionIndex((i) => Math.max(i - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-500 disabled:opacity-50 bg-white"
        >
          ← Previous
        </button>

        <span className="text-sm text-slate-500">
          {currentQuestionIndex + 1} / {questions.length}
        </span>

        <button
          onClick={() =>
            setCurrentQuestionIndex((i) =>
              Math.min(i + 1, questions.length - 1)
            )
          }
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-700 disabled:opacity-50 bg-white"
        >
          Next →
        </button>
      </div>
    </div>
  );
}