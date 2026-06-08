/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Archive, RotateCcw, Loader2, ClipboardList, Users, FileSearch } from "lucide-react";
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

interface ArchivedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  updatedAt: string;
}

interface ArchivedFinding {
  id: string;
  title: string;
  severity: string;
  createdAt: string;
  assessment?: { id: string; name: string; company?: { name: string } };
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH:     "bg-orange-100 text-orange-700 border-orange-200",
  MEDIUM:   "bg-amber-100 text-amber-700 border-amber-200",
  LOW:      "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState<"checklists" | "users" | "findings">("checklists");

  const [checklists, setChecklists] = useState<ArchivedChecklist[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(true);
  const [checklistsError, setChecklistsError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [archivedUsers, setArchivedUsers] = useState<ArchivedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [restoringUserId, setRestoringUserId] = useState<string | null>(null);

  const [archivedFindings, setArchivedFindings] = useState<ArchivedFinding[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(true);
  const [findingsError, setFindingsError] = useState<string | null>(null);

  const fetchArchived = async () => {
    try {
      setChecklistsLoading(true);
      const res = await apiClient.get("/checklists");
      const all = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setChecklists(all.filter((c: any) => c.status === "ARCHIVED"));
    } catch (err: any) {
      setChecklistsError(err?.response?.data?.message || "Failed to load archived checklists.");
    } finally {
      setChecklistsLoading(false);
    }
  };

  const fetchArchivedUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await apiClient.get("/users/archived");
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setArchivedUsers(data);
    } catch (err: any) {
      setUsersError(err?.response?.data?.message || "Failed to load archived users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchArchivedFindings = async () => {
    try {
      setFindingsLoading(true);
      const res = await apiClient.get("/technical-findings/archived");
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setArchivedFindings(data);
    } catch (err: any) {
      setFindingsError(err?.response?.data?.message || "Failed to load archived findings.");
    } finally {
      setFindingsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
    fetchArchivedUsers();
    fetchArchivedFindings();
  }, []);

  const handleRestoreChecklist = async (id: string) => {
    if (!window.confirm("Restore this checklist?")) return;
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

  const handleRestoreUser = async (id: string) => {
    if (!window.confirm("Restore this user?")) return;
    try {
      setRestoringUserId(id);
      await apiClient.patch(`/users/${id}/restore`);
      setArchivedUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to restore user.");
    } finally {
      setRestoringUserId(null);
    }
  };

  const tabs = [
    { key: "checklists", label: "Checklists", count: checklists.length,       icon: ClipboardList },
    { key: "users",      label: "Users",       count: archivedUsers.length,    icon: Users        },
    { key: "findings",   label: "Findings",    count: archivedFindings.length, icon: FileSearch   },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Management</p>
          <h1 className="text-3xl font-bold text-gray-900">Archives</h1>
          <p className="text-sm text-gray-500 mt-1">
            Archived items are read-only. Restore them to make them active again.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* CHECKLISTS TAB */}
      {activeTab === "checklists" && (
        <>
          {checklistsLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-sm">Loading archived checklists…</p>
            </div>
          )}
          {!checklistsLoading && checklistsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {checklistsError}
            </div>
          )}
          {!checklistsLoading && !checklistsError && checklists.length === 0 && (
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
          {!checklistsLoading && !checklistsError && checklists.length > 0 && (
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
                          onClick={() => handleRestoreChecklist(c.id)}
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
        </>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <>
          {usersLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-sm">Loading archived users…</p>
            </div>
          )}
          {!usersLoading && usersError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {usersError}
            </div>
          )}
          {!usersLoading && !usersError && archivedUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No archived users</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Users you archive will appear here and can be restored at any time.
              </p>
            </div>
          )}
          {!usersLoading && !usersError && archivedUsers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">User</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Email</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Role</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Archived</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-gray-500">
                              {u.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                          u.role === "ADMIN"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(u.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleRestoreUser(u.id)}
                          disabled={restoringUserId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition disabled:opacity-50"
                        >
                          {restoringUserId === u.id ? (
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
        </>
      )}

      {/* FINDINGS TAB */}
      {activeTab === "findings" && (
        <>
          {findingsLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-sm">Loading archived findings…</p>
            </div>
          )}
          {!findingsLoading && findingsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {findingsError}
            </div>
          )}
          {!findingsLoading && !findingsError && archivedFindings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <FileSearch className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No archived findings</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Findings are archived automatically when a report is sent to the client.
              </p>
            </div>
          )}
          {!findingsLoading && !findingsError && archivedFindings.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Title</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Severity</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Assessment</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Company</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedFindings.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">{f.title}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          SEVERITY_COLORS[f.severity] ?? "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {f.severity ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{f.assessment?.name ?? "—"}</td>
                      <td className="px-5 py-4 text-gray-500">{f.assessment?.company?.name ?? "—"}</td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}