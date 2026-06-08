/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../../api/Axios";
import AppLayout from "../../appLayout";
import DomainRow from "../../../components/build/DomainRow";
import ChecklistPreview from "../../../components/build/PreviewModal";
import AddDomainModal from "../../../components/build/AddDomainModal";
import Pagination from "../../../components/Pagination";

type Checklist = {
  id: string;
  name: string;
  description?: string;
  status?: string;
};

type Question = {
  id: string;
  text: string;
};

type Control = {
  id: string;
  code: string;
  title: string;
  riskWeight: number;
  questions?: Question[];
};

type Domain = {
  id: string;
  name: string;
  description?: string;
  controls?: Control[];
  createdAt: string;
};

export default function ChecklistDomainPage() {
  const { checklistId } = useParams();

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const [query, setQuery] = useState("");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);

  // Track which domains are open so they survive re-fetches
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set());

  const handleToggleDomain = (id: string, isOpen: boolean) => {
  setOpenDomains(prev => {
    const next = new Set(prev);
    if (isOpen) {
      next.add(id);
    } else {
      next.delete(id);
    }
    return next;
  });
};
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchAll = async () => {
    if (!checklistId) return;
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([
        apiClient.get(`/checklists/${checklistId}`),
        apiClient.get(`/checklists/${checklistId}/domains`),
      ]);
      setChecklist(cRes.data);
      setDomains(dRes.data);
    } catch (err: any) {
      console.error("Fetch error:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomain = async (data: { name: string; description?: string }) => {
    if (!checklistId) return;
    try {
      await apiClient.post(`/checklists/${checklistId}/domains`, {
        checklistId,
        name: data.name,
        description: data.description || "",
      });
      await fetchAll();
    } catch (err: any) {
      console.error("Add domain error:", err?.response?.data || err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [checklistId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, showEmptyOnly]);

  const filteredDomains = useMemo(() => {
    const q = query.trim().toLowerCase();
    return domains.filter((d) => {
      const hasText =
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        (d.controls || []).some((c) =>
          `${c.code} ${c.title}`.toLowerCase().includes(q) ||
          (c.questions || []).some((qq) => qq.text.toLowerCase().includes(q))
        );
      const isEmpty =
        (d.controls?.length || 0) === 0 ||
        (d.controls || []).every((c) => (c.questions?.length || 0) === 0);
      return hasText && (!showEmptyOnly || isEmpty);
    });
  }, [domains, query, showEmptyOnly]);

  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
  const paginatedDomains = filteredDomains.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredDomains.length, totalPages]);

  return (
    <AppLayout>
      <div className="p-8 bg-slate-50 min-h-screen">

        {/* HEADER */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {checklist ? checklist.name : "Loading checklist..."}
            </h1>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {previewMode ? "Back to Checklists" : "Preview"}
            </button>
          </div>

          {!previewMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div>
                <label className="text-xs text-slate-500">Search</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="Search domain / control / question..."
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showEmptyOnly}
                    onChange={(e) => setShowEmptyOnly(e.target.checked)}
                  />
                  Show incomplete only
                </label>
              </div>
              <div className="flex items-end justify-end gap-3">
                <p className="text-sm text-slate-500">
                  Domains: <span className="font-medium text-slate-700">{filteredDomains.length}</span>
                </p>
                <button
                  onClick={() => setShowDomainModal(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  Add Domain
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {previewMode ? (
          <ChecklistPreview checklistName={checklist?.name || ""} domains={domains} />
        ) : loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="flex flex-col min-h-[60vh]">
            <div className="flex-1 space-y-4">
              {paginatedDomains.map((d, index) => (
                <DomainRow
                  key={d.id}
                  domain={d}
                  index={(currentPage - 1) * itemsPerPage + index}
                  onChanged={fetchAll}
                  checklistId={checklist?.id || ""}
                  defaultOpen={openDomains.has(d.id)}
                  onToggle={handleToggleDomain}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <AddDomainModal
        open={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        onSave={handleSaveDomain}
      />
    </AppLayout>
  );
}