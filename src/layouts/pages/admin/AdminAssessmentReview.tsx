import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { useParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Field = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "file";
  options?: string[];
  required?: boolean;
};

// ─── Template ─────────────────────────────────────────────────────────────────

const template: { fields: Field[] } = {
  fields: [
    { id: "title", label: "Title", type: "text", required: true },
    {
      id: "severity",
      label: "Severity",
      type: "select",
      options: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    { id: "toolName", label: "Tool Name", type: "text", required: true },
    { id: "cvssScore", label: "CVSS Score", type: "number" },
    { id: "description", label: "Description", type: "textarea" },
    { id: "impact", label: "Impact", type: "textarea" },
    { id: "recommendation", label: "Recommendation", type: "textarea" },
    { id: "evidence", label: "Evidence", type: "textarea" },
    { id: "reference", label: "Reference", type: "text" },
    { id: "affectedSystems", label: "Affected Systems", type: "text" },
    { id: "attachment", label: "Attachment", type: "file" },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAssessmentReviewPage() {
  const { assessmentId } = useParams();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [assessmentName, setAssessmentName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [customFields, setCustomFields] = useState<Field[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [findings, setFindings] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [newField, setNewField] = useState<{
    id: string;
    label: string;
    type: Field["type"];
    required: boolean;
  }>({
    id: "",
    label: "",
    type: "text",
    required: false,
  });

  const requiredFields = template.fields
    .filter((field) => field.required)
    .map((field) => field.id);

  const [selectedFields, setSelectedFields] = useState<string[]>(requiredFields);
  const [values, setValues] = useState<Record<string, any>>({});

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  useEffect(() => {
    setIsOpen(false);
  }, [currentDomainIndex]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/admin/assessments/${assessmentId}/review`);

      if (Array.isArray(res.data)) {
        setDomains(res.data);
      } else {
        setDomains(res.data.domains || []);
        setAssessmentName(res.data.assessmentName || "");
        setCompanyName(res.data.companyName || "");
      }

      const findingsRes = await apiClient.get(
        `/technical-findings/assessment/${assessmentId}`
      );
      setFindings(findingsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch review data:", err);
    } finally {
      setLoading(false);
    }
  };

//derived
  const domain = domains[currentDomainIndex];

  const allQuestions = useMemo(() => {
    if (!domain) return [];

    const domainQuestions =
      domain.questions?.map((q) => ({ ...q, controlTitle: null })) || [];

    const controlQuestions =
      domain.controls?.flatMap((control) =>
        (control.questions || []).map((q) => ({
          ...q,
          controlTitle: control.title,
        }))
      ) || [];

    return [...domainQuestions, ...controlQuestions];
  }, [domain]);

  // Handlers 
  const addField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) return;
    setSelectedFields((prev) => [...prev, fieldId]);
  };

  const removeField = (fieldId: string) => {
    if (requiredFields.includes(fieldId)) return;
    setSelectedFields((prev) => prev.filter((id) => id !== fieldId));
    setValues((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
  };

  const updateValue = (fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("assessmentId", assessmentId || "");
      formData.append("domainId", domain?.id || "");
      formData.append("templateId", "default-template");

      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      const res = await apiClient.post("/technical-findings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset form values, keep selected fields
      setValues({});
      setSubmitSuccess(true);

      // Refresh findings list
      setFindings((prev) => [res.data.data, ...prev]);

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomField = () => {
    if (!newField.label.trim()) return;
    const field: Field = {
      ...newField,
      id: newField.label.toLowerCase().replace(/\s+/g, "-"),
    };
    setCustomFields((prev) => [...prev, field]);
    setSelectedFields((prev) => [...prev, field.id]);
    setNewField({ id: "", label: "", type: "text", required: false });
    setShowCustomModal(false);
  };

  

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* HEADER */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Assessment Review
          </h1>
          <p className="text-sm text-slate-500">
            Review client responses and add technical findings.
          </p>
        </div>

        {loading && (
          <div className="bg-white border rounded-xl p-6 text-sm text-slate-500">
            Loading assessment review...
          </div>
        )}

        {!loading && domains.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-sm text-slate-500">
            No review data found for this assessment.
          </div>
        )}

        {!loading && domain && (
          <>
            {/* TOP CARD */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {assessmentName || "Assessment"}
              </h2>
              <p className="text-sm text-slate-500">
                {companyName || "No company name"}
              </p>
            </div>

            {/* DOMAIN CARD */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex justify-between items-center p-5 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown size={20} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-500" />
                  )}
                  <div>
                    <p className="text-xs text-slate-400">
                      Domain {currentDomainIndex + 1} of {domains.length}
                    </p>
                    <h3 className="font-medium text-slate-900">{domain.name}</h3>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {allQuestions.length} question(s)
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 p-5">
                  <SingleQuestionCarousel questions={allQuestions} />
                </div>
              )}
            </div>

            {/* ADD CUSTOM FIELDS BUTTON */}
            <div className="ml-auto flex justify-end">
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Fields
              </button>
            </div>

            {/* CUSTOM FIELD MODAL */}
            {showCustomModal && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                  <h3 className="font-medium text-slate-900">Add Custom Field</h3>

                  <input
                    placeholder="Field name"
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                    value={newField.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setNewField((prev) => ({
                        ...prev,
                        label,
                        id: label.toLowerCase().replace(/\s+/g, "-"),
                      }));
                    }}
                  />

                  <select
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                    value={newField.type}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        type: e.target.value as Field["type"],
                      }))
                    }
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Add Field
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FIELD SELECTOR */}
            <div className="bg-green-50 p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-medium text-slate-900 mb-3">
                Select Finding Fields
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...template.fields, ...customFields].map((field) => {
                  const selected = selectedFields.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      disabled={selected}
                      onClick={() => addField(field.id)}
                      className={`px-3 py-1.5 border rounded-full text-sm transition ${
                        selected
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white hover:bg-blue-50 text-slate-700"
                      }`}
                    >
                      {selected ? "✓" : "+"} {field.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FINDINGS FORM */}
            <form
              onSubmit={handleSubmit}
              className="bg-green-100 p-5 rounded-xl border border-green-200 space-y-4"
            >
              <div>
                <h3 className="font-medium text-slate-900">Add Finding</h3>
                <p className="text-sm text-slate-500">
                  Add technical assessment findings for this domain.
                </p>
              </div>

              {/* SUCCESS BANNER */}
              {submitSuccess && (
                <div className="bg-green-600 text-white text-sm px-4 py-3 rounded-lg">
                  Finding added successfully.
                </div>
              )}

              {/* ERROR BANNER */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
                  <span>{submitError}</span>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="ml-4 text-red-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {selectedFields.map((fieldId) => {
                const field =
                  template.fields.find((f) => f.id === fieldId) ||
                  customFields.find((f) => f.id === fieldId);

                if (!field) return null;

                const isRequired = requiredFields.includes(field.id);

                return (
                  <div
                    key={field.id}
                    className="relative bg-white p-4 rounded-lg border border-slate-200"
                  >
                    {!isRequired && (
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      {field.label}
                      {isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    {field.type === "text" && (
                      <input
                        value={values[field.id] || ""}
                        required={field.required}
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                        onChange={(e) => updateValue(field.id, e.target.value)}
                      />
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={values[field.id] || ""}
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                        onChange={(e) => updateValue(field.id, e.target.value)}
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={values[field.id] || ""}
                        rows={4}
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                        onChange={(e) => updateValue(field.id, e.target.value)}
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        value={values[field.id] || ""}
                        required={field.required}
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                        onChange={(e) => updateValue(field.id, e.target.value)}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "file" && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            updateValue(field.id, file);
                          }}
                        />
                        {values[field.id] && (
                          <p className="text-xs text-slate-500">
                            Selected: {values[field.id].name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {submitting ? "Saving..." : "Add Finding"}
              </button>
            </form>

            {/* DOMAIN NAVIGATION */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                disabled={currentDomainIndex === 0}
                onClick={() =>
                  setCurrentDomainIndex((i) => Math.max(i - 1, 0))
                }
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Previous Domain
              </button>

              <p className="text-sm text-slate-500">
                {currentDomainIndex + 1} / {domains.length}
              </p>

              <button
                type="button"
                disabled={currentDomainIndex === domains.length - 1}
                onClick={() =>
                  setCurrentDomainIndex((i) =>
                    Math.min(i + 1, domains.length - 1)
                  )
                }
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next Domain →
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}



function SingleQuestionCarousel({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No client questions found for this domain.
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-400">
              Question {index + 1} of {questions.length}
            </p>
            {question.controlTitle && (
              <p className="text-xs font-medium text-indigo-600 mt-1">
                Control: {question.controlTitle}
              </p>
            )}
          </div>

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              question.answer === "YES"
                ? "bg-green-100 text-green-700"
                : question.answer === "NO"
                ? "bg-red-100 text-red-700"
                : question.answer === "NA"
                ? "bg-slate-200 text-slate-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {question.answer || "Not answered"}
          </span>
        </div>

        <p className="font-medium text-slate-900 mb-3">{question.text}</p>

        <div className="text-sm text-slate-600">
          <span className="font-medium">Remark:</span>{" "}
          {question.remark || "No remark provided"}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
        >
          ← Previous Question
        </button>

        <button
          type="button"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
          className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}