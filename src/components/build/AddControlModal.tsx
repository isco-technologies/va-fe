import { useState, useEffect } from "react";
import apiClient from "../../api/Axios";

type Props = {
  open: boolean;
  checklistId: string;
  domainId: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddControlModal({
  open,
  domainId,
  onClose,
  onSaved,
}: Props) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [riskWeight, setRiskWeight] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setCode("");
      setTitle("");
      setRiskWeight(1);
      setError(null);
    }
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const isValid = code.trim().length > 0 && title.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setError(null);

      await apiClient.post(
        `/domains/${domainId}/controls`,
        {
          code: code.trim(),
          title: title.trim(),
          riskWeight: Number(riskWeight) > 0 ? Number(riskWeight) : 1,
        }
      );

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Add control error:", err?.response?.data || err);
      setError(
        err?.response?.data?.message ||
          "Failed to add control. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Add Control</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. AC-01"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. User Access Management"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Risk Weight</label>
            <input
              type="number"
              value={riskWeight}
              onChange={(e) => setRiskWeight(Number(e.target.value))}
              min={1}
              className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}