// src/components/StatusBadge.tsx
import type { ChecklistStatus } from "../api/checklistAPI";

export default function StatusBadge({ status }: { status: ChecklistStatus }) {
  const styles =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : status === "INACTIVE"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-slate-200 text-slate-700";

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles}`}>
      {status}
    </span>
  );
}