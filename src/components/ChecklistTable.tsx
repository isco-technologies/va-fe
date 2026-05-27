// src/components/ChecklistTable.tsx

import { Pencil, Archive, ExternalLink } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Checklists } from "../api/checklistAPI";

type Props = {
  items: Checklists[];
  onOpenDomains: (checklistId: string) => void;
  onEdit: (item: Checklists) => void;
  onArchive: (id: string) => void;
};

export default function ChecklistTable({
  items,
  onOpenDomains,
  onEdit,
  onArchive,
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full">

        {/* HEADER */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Name
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Description
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Domains
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Controls
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-100">
          {items.map((c) => {
            const archived = c.status === "ARCHIVED";

            return (
              <tr
                key={c.id}
                className="hover:bg-gray-50 transition-colors group"
              >

                {/* NAME */}
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onOpenDomains(c.id)}
                    className="flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800 transition-colors group/link"
                    title="Open domains"
                  >
                    {c.name}
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </button>
                </td>

                {/* DESCRIPTION */}
                <td className="px-5 py-3.5 max-w-xs">
                  <p className="text-sm text-gray-500 truncate">
                    {c.description || (
                      <span className="text-gray-300">—</span>
                    )}
                  </p>
                </td>

                {/* DOMAIN COUNT */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {c.domainCount ?? 0} domains
                  </span>
                </td>

                {/* CONTROL COUNT */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {c.controlCount ?? 0} controls
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={c.status} />
                </td>

                {/* ACTIONS */}
                <td className="px-5 py-3.5">
                  <div className="flex justify-end items-center gap-2  group-hover:opacity-100 transition-opacity">

                    {/* EDIT */}
                    <button
                      onClick={() => onEdit(c)}
                      disabled={archived}
                      title={archived ? "Cannot edit archived checklist" : "Edit checklist"}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        archived
                          ? "cursor-not-allowed opacity-40 border-gray-200 text-gray-400"
                          : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    {/* ARCHIVE */}
                    {!archived && (
                      <button
                        onClick={() => onArchive(c.id)}
                        title="Archive checklist"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}