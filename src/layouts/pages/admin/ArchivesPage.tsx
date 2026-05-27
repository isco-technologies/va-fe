/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Archive, RotateCcw, Loader2, ClipboardList } from "lucide-react";
import apiClient from "../../../api/Axios";
import AppLayout from "../../appLayout";

interface ArchivedChecklist {
  id: string;
  name: string;
  description?: string;
  domainCount: number;
  controlCount: number;
  updatedAt: string;
}

export default function ArchivesPage() {
  const [checklists, setChecklists] = useState<ArchivedChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/checklists");
      const all = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setChecklists(all.filter((c: any) => c.status === "ARCHIVED"));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load archives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string) => {
    if (!window.confirm("Restore this checklist? It will become Inactive and editable again.")) return;
    try {
      setRestoringId(id);
      await apiClient.patch(`/checklists/${id}/restore`);
      setChecklists((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to restore checklist.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
            Checklist Management
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Archives</h1>
          <p className="text-sm text-gray-500 mt-1">
            Archived checklists are read-only. Restore them to make them editable again.
          </p>
        </div>
        {!loading && !error && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-400">{checklists.length}</p>
            <p className="text-xs text-gray-400">Archived</p>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          <p className="text-sm">Loading archives…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && checklists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Archive className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No archived checklists</p>
          <p className="text-xs text-gray-400 max-w-xs">
            Checklists you archive will appear here and can be restored at any time.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && checklists.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Checklist</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Domains</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Controls</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Archived</th>
                <th className="px-5 py-4 text-right font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {checklists.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">{c.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                      {c.domainCount} domains
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                      {c.controlCount} controls
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(c.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRestore(c.id)}
                      disabled={restoringId === c.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition disabled:opacity-50"
                    >
                      {restoringId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}