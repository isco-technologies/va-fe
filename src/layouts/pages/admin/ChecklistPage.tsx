import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, ClipboardList, Archive, Layers } from "lucide-react";
import AppLayout from "../../appLayout";
import ChecklistTable from "../../../components/ChecklistTable";
import ChecklistModal from "../../../components/ChecklistModal";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchChecklists,addChecklist,editChecklist,setChecklistSearch,} from "../../../feature/checklists/checklistSlice";
import type { Checklists } from "../../../api/checklistAPI";
import ApiClient from "../../../api/Axios";

export default function ChecklistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, isLoading, error, search } = useAppSelector(
    (s) => s.checklists
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Checklists | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "INACTIVE" | "ACTIVE" | "ARCHIVED">("ALL");

  useEffect(() => {
    dispatch(fetchChecklists());
  }, [dispatch]);

  // DERIVED COUNTS
  const counts = useMemo(() => ({
    total: items.length,
    active: items.filter((c) => c.status === "ACTIVE").length,
    inactive: items.filter((c) => c.status === "INACTIVE").length,
    archived: items.filter((c) => c.status === "ARCHIVED").length,
  }), [items]);

  // FILTER
  // FILTER
const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  return items.filter((c) => {
    const matchesSearch =
      !q ||
      (c.name?.toLowerCase() || "").includes(q) ||
      String(c.description || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "ALL"
        ? c.status !== "ARCHIVED"          
        : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}, [items, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Checklists) => {
    if (item.status === "ARCHIVED") {
      window.alert("Archived checklists cannot be edited.");
      return;
    }
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (data: {
    name: string;
    description?: string | null;
  }) => {
    try {
      if (editing) {
        await dispatch(
          editChecklist({ id: editing.id, payload: { name: data.name, description: data.description } })
        ).unwrap();
      } else {
        await dispatch(
          addChecklist({ name: data.name, description: data.description, status: "INACTIVE" })
        ).unwrap();
      }
      dispatch(fetchChecklists());
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("Error saving checklist:", err);
      window.alert("Failed to save checklist.");
    }
  };

  const handleArchive = async (id: string) => {
  const ok = window.confirm("Archive this checklist?");
  if (!ok) return;
  try {
    await ApiClient.patch(`/checklists/${id}/archive`);
    dispatch(fetchChecklists());
  } catch (err: any) {
    console.error("Error archiving checklist:", err);
    window.alert(err?.response?.data?.message || "Failed to archive checklist.");
  }
};

  const openDomains = (checklistId: string) => {
    navigate(`/admin/checklists/${checklistId}/domains`);
  };

  const statusTabs: { label: string; value: typeof statusFilter; count: number }[] = [
    { label: "All", value: "ALL", count: counts.total },
    { label: "Active", value: "ACTIVE", count: counts.active },
    { label: "Inactive", value: "INACTIVE", count: counts.inactive },
    { label: "Archived", value: "ARCHIVED", count: counts.archived },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Checklist Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Build checklists, then add domains, controls, and questions.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Checklist
          </button>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-indigo-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
            </div>
            <p className="text-2xl font-semibold text-indigo-600">{counts.active}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inactive</p>
            </div>
            <p className="text-2xl font-semibold text-amber-600">{counts.inactive}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="h-4 w-4 text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Archived</p>
            </div>
            <p className="text-2xl font-semibold text-gray-400">{counts.archived}</p>
          </div>
        </div>

        {/* FILTER / SEARCH BAR */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => dispatch(setChecklistSearch(e.target.value))}
                placeholder="Search name or description..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* STATUS TABS */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      statusFilter === tab.value
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* REFRESH */}
            <button
              onClick={() => dispatch(fetchChecklists())}
              title="Refresh"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
            <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No checklists found</p>
            <p className="text-gray-400 text-xs mt-1">
              {search ? "Try adjusting your search" : "Create your first checklist to get started"}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Checklist
              </button>
            )}
          </div>
        )}

        {/* TABLE */}
        {!isLoading && !error && filtered.length > 0 && (
          <ChecklistTable
            items={filtered}
            onOpenDomains={openDomains}
            onEdit={openEdit}
            onArchive={handleArchive}
          />
        )}

        {/* MODAL */}
        <ChecklistModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSubmit={handleSubmit}
          initial={editing}
          title={editing ? "Edit Checklist" : "Create Checklist"}
        />
      </div>
    </AppLayout>
  );
}