/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { ChevronRight, ChevronDown, X, Plus, CheckCircle2, AlertCircle, ChevronLeft, Settings2 } from "lucide-react";
import { useParams } from "react-router-dom";

// TYPES

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
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "file"
    | "subtopic"
    | "severity";
  options?: string[];
  required?: boolean;
};

// TEMPLATE

const template: { fields: Field[] } = {
  fields: [
    {
      id: "title",
      label: "Title",
      type: "text",
      required: true,
    },
    {
      id: "severity",
      label: "Severity",
      type: "severity",
      required: true,
    },
    {
      id: "affectedSystems",
      label: "Affected Systems",
      type: "text",
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
    },
    {
      id: "impact",
      label: "Impact",
      type: "textarea",
    },
    {
      id: "recommendation",
      label: "Recommendation",
      type: "textarea",
    },
    {
      id: "cvssScore",
      label: "CVSS Score",
      type: "number",
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      options: [
        "NETWORK",
        "WEB",
        "CLOUD",
        "INFRASTRUCTURE",
        "ACCESS CONTROL",
        "DATA PROTECTION",
        "GOVERNANCE",
        "ENDPOINT SECURITY",
      ],
    },
    {
      id: "toolName",
      label: "Tool Name",
      type: "text",
    },
    {
      id: "evidence",
      label: "Evidence",
      type: "textarea",
    },
    {
      id: "reference",
      label: "Reference",
      type: "text",
    },
    {
      id: "attachment",
      label: "Attachment",
      type: "file",
    },
  ],
};

// STYLES

const ANSWER_STYLES: Record<string, string> = {
  YES: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  NO:  "bg-red-100 text-red-700 border border-red-200",
  NA:  "bg-gray-100 text-gray-500 border border-gray-200",
};

// INPUTS

const inputCls =
  "w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition";

const selectCls =
  "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition";

// PAGE

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
  const [showFieldSelector, setShowFieldSelector] = useState(false);
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
    type: "subtopic",
    required: false,
  });

  const requiredFields = template.fields
    .filter((f) => f.required)
    .map((f) => f.id);

  const [selectedFields, setSelectedFields] = useState<string[]>(requiredFields);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => { fetchData(); }, [assessmentId]);
  useEffect(() => { setIsOpen(false); }, [currentDomainIndex]);

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
    } catch (err) {
      console.error("Failed to fetch review data:", err);
    } finally {
      setLoading(false);
    }
  };

  const domain = domains[currentDomainIndex];

  const allQuestions = useMemo(() => {
    if (!domain) return [];

    const domainQuestions = domain.questions?.map((q) => ({
      ...q,
      controlTitle: null,
    })) || [];

    const controlQuestions = domain.controls?.flatMap((control) =>
      (control.questions || []).map((q) => ({
        ...q,
        controlTitle: control.title,
      }))
    ) || [];

    return [...domainQuestions, ...controlQuestions];
  }, [domain]);

  // FIELD ACTIONS

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

  // SUBMIT

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("assessmentId", assessmentId || "");

      // Only title goes as a static field
      const staticFields = ["title", "toolName"];

      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (value instanceof File) return;
        if (staticFields.includes(key)) formData.append(key, String(value));
      });

      // DYNAMIC FIELDS — everything else in insertion order
      const dynamicEntries: {
        label: string;
        value: string | null;
        type: string;
        subtopic: string | null;
      }[] = [];

      let walkSubtopic: string | null = null;

      selectedFields.forEach((fieldId) => {
        const field = allFields.find((f) => f.id === fieldId);
        if (!field || staticFields.includes(fieldId)) return;

        // SUBTOPIC — section divider
        if (field.type === "subtopic") {
          walkSubtopic = field.label;
          dynamicEntries.push({
            label: field.label,
            value: null,
            type: "subtopic",
            subtopic: null,
          });
          return;
        }

        const value = values[fieldId];
        if (value === undefined || value === null || value === "") return;

        // FILE
        if (value instanceof File) {
          formData.append(field.id, value);
          dynamicEntries.push({
            label: field.label,
            value: value.name,
            type: "attachment",
            subtopic: walkSubtopic,
          });
          return;
        }

        // NORMAL
        dynamicEntries.push({
          label: field.label,
          value: String(value),
          type: field.type,
          subtopic: walkSubtopic,
        });
      });

      formData.append("dynamicFields", JSON.stringify(dynamicEntries));

      await apiClient.post("/technical-findings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setValues({});
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // CUSTOM FIELD

  const handleAddCustomField = () => {
    if (!newField.label.trim()) return;

    const field: Field = {
      ...newField,
      id: newField.label.toLowerCase().replace(/\s+/g, "-"),
    };

    setCustomFields((prev) => [...prev, field]);
    setSelectedFields((prev) => [...prev, field.id]);
    setNewField({ id: "", label: "", type: "subtopic", required: false });
    setShowCustomModal(false);
  };

  const allFields = [...template.fields, ...customFields];
  const optionalFields = allFields.filter((f) => !requiredFields.includes(f.id));

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
              Assessment Review
            </p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {assessmentName || "Assessment"}
            </h1>
            {companyName && (
              <p className="text-sm text-gray-400 mt-0.5">{companyName}</p>
            )}
          </div>

          {/* DOMAIN STEPPER */}

          {!loading && domains.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                disabled={currentDomainIndex === 0}
                onClick={() => setCurrentDomainIndex((i) => Math.max(i - 1, 0))}
                className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition text-gray-500"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-sm text-gray-600 font-medium min-w-[80px] text-center">
                {currentDomainIndex + 1} / {domains.length}
              </span>
              <button
                type="button"
                disabled={currentDomainIndex === domains.length - 1}
                onClick={() => setCurrentDomainIndex((i) => Math.min(i + 1, domains.length - 1))}
                className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition text-gray-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* STATES */}

        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            Loading assessment review...
          </div>
        )}

        {!loading && domains.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            No assessment data found.
          </div>
        )}

        {!loading && domain && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* LEFT — domain questions */}

            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isOpen ? "bg-indigo-500" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                      {isOpen
                        ? <ChevronDown size={16} className="text-white" />
                        : <ChevronRight size={16} className="text-gray-500" />
                      }
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                        Assessment Review
                      </p>
                      <h3 className="font-semibold text-gray-900 text-sm mt-0.5">
                        {domain.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {allQuestions.length}Q
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 p-5">
                    <SingleQuestionCarousel questions={allQuestions} />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — form only */}

            <div className="xl:col-span-3">

              <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* FORM HEADER */}

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900">Assessment Findings</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Create technical findings discovered during this assessment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFieldSelector((p) => !p)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      showFieldSelector
                        ? "bg-indigo-500 border-indigo-400 text-white"
                        : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Settings2 size={13} />
                    Fields
                  </button>
                </div>

                {/* OPTIONAL FIELDS SELECTOR */}

                {showFieldSelector && (
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-mono">
                      Optional Fields
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {optionalFields.map((field) => {
                        const selected = selectedFields.includes(field.id);
                        return (
                          <button
                            key={field.id}
                            type="button"
                            onClick={() => selected ? removeField(field.id) : addField(field.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                              selected
                                ? "bg-indigo-500 border-indigo-400 text-white"
                                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 bg-white"
                            }`}
                          >
                            {selected ? <CheckCircle2 size={11} /> : <Plus size={11} />}
                            {field.label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(true)}
                      className="text-xs text-indigo-500 hover:text-indigo-600 transition"
                    >
                      + Add custom field
                    </button>
                  </div>
                )}

                {/* BANNERS */}

                {submitSuccess && (
                  <div className="mx-6 mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
                    <CheckCircle2 size={15} />
                    Finding added successfully.
                  </div>
                )}

                {submitError && (
                  <div className="mx-6 mt-4 flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} />
                      {submitError}
                    </div>
                    <button type="button" onClick={() => setSubmitError(null)}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* FIELDS */}

                <div className="px-6 py-5 space-y-4">
                  {selectedFields.map((fieldId) => {
                    const field = allFields.find((f) => f.id === fieldId);
                    if (!field) return null;

                    const isRequired = requiredFields.includes(field.id);

                    // SUBTOPIC divider
                    if (field.type === "subtopic") {
                      return (
                        <div key={field.id} className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                              {field.label}
                            </span>
                            <div className="flex-1 h-px bg-indigo-200" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="ml-3 text-gray-300 hover:text-red-400 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={field.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {field.label}
                            {isRequired && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          {!isRequired && (
                            <button
                              type="button"
                              onClick={() => removeField(field.id)}
                              className="text-gray-300 hover:text-red-400 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* TEXT */}
                        {field.type === "text" && (
                          <input
                            value={values[field.id] || ""}
                            required={field.required}
                            className={inputCls}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            onChange={(e) => updateValue(field.id, e.target.value)}
                          />
                        )}

                        {/* NUMBER */}
                        {field.type === "number" && (
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={values[field.id] || ""}
                            className={inputCls}
                            placeholder="0.0 – 10.0"
                            onChange={(e) => updateValue(field.id, e.target.value)}
                          />
                        )}

                        {/* TEXTAREA */}
                        {field.type === "textarea" && (
                          <textarea
                            rows={3}
                            value={values[field.id] || ""}
                            className={`${inputCls} resize-none`}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            onChange={(e) => updateValue(field.id, e.target.value)}
                          />
                        )}

                        {/* SELECT */}
                        {field.type === "select" && (
                          <select
                            value={values[field.id] || ""}
                            required={field.required}
                            className={selectCls}
                            onChange={(e) => updateValue(field.id, e.target.value)}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}

                        {/* SEVERITY */}
                        {field.type === "severity" && (
                          <select
                            value={values[field.id] || ""}
                            required={field.required}
                            className={selectCls}
                            onChange={(e) => updateValue(field.id, e.target.value)}
                          >
                            <option value="">Select Severity</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        )}

                        {/* FILE */}
                        {field.type === "file" && (
                          <div>
                            <input
                              type="file"
                              className={inputCls}
                              onChange={(e) => updateValue(field.id, e.target.files?.[0])}
                            />
                            {values[field.id] && (
                              <p className="text-xs text-gray-400 mt-1">
                                Selected: {values[field.id].name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SUBMIT */}

                <div className="px-6 pb-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
                  >
                    {submitting ? "Saving..." : "Add Finding"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>

      {/* CUSTOM FIELD MODAL */}

      {showCustomModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Custom Field</h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {newField.type === "subtopic" ? "Sub-topic Name" : "Field Name"}
                </label>
                <input
                  placeholder={newField.type === "subtopic" ? "e.g. Network Details" : "e.g. CVE ID"}
                  className={inputCls}
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
                {newField.type === "subtopic" && (
                  <p className="text-xs text-gray-400">
                    Appears as a section divider in the form. No input field is attached.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </label>
                <select
                  className={selectCls}
                  value={newField.type}
                  onChange={(e) =>
                    setNewField((prev) => ({
                      ...prev,
                      type: e.target.value as Field["type"],
                    }))
                  }
                >
                  <option value="subtopic">Sub-topic</option>
                  <option value="textarea">Textarea</option>
                  <option value="number">Number</option>
                  <option value="severity">Severity</option>
                  <option value="file">Attachment</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <button
                type="button"
                onClick={handleAddCustomField}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Add Field
              </button>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// QUESTION CAROUSEL

function SingleQuestionCarousel({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No client questions found for this domain.
      </div>
    );
  }

  const question = questions[index];
  const answerStyle = question.answer
    ? ANSWER_STYLES[question.answer] || ANSWER_STYLES.NA
    : "bg-gray-100 text-gray-400 border border-gray-200";

  return (
    <div className="space-y-4">

      {/* PROGRESS */}

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-1">
          <div
            className="bg-indigo-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-mono shrink-0">
          {index + 1}/{questions.length}
        </span>
      </div>

      {/* CARD */}

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
        {question.controlTitle && (
          <p className="text-xs font-medium text-indigo-500 font-mono">
            {question.controlTitle}
          </p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{question.text}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${answerStyle}`}>
            {question.answer || "Not answered"}
          </span>
          {question.remark && (
            <span className="text-xs text-gray-400 truncate">"{question.remark}"</span>
          )}
        </div>
      </div>

      {/* NAV */}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition text-gray-500"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {questions.slice(0, Math.min(questions.length, 8)).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-indigo-400" : "w-1.5 bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
          {questions.length > 8 && (
            <span className="text-gray-300 text-xs self-end">…</span>
          )}
        </div>

        <button
          type="button"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition text-gray-500"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}