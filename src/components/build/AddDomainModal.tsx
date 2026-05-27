import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => Promise<void> | void;
  initialData?: {
    name: string;
    description?: string;
  };
};

export default function AddDomainModal({
  open,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate when editing
  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setError(null);
    }
  }, [open, initialData]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const isValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setError(null);

      await onSave({
        name: name.trim(),
        description: description.trim(),
      });

      onClose();
    } catch (err: any) {
      setError("Failed to save domain.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Domain" : "Add New Domain"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">
              Domain Name
            </label>
            <input
              type="text"
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Access Control"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Description (optional)
            </label>
            <textarea
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short explanation..."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Domain"
              : "Save Domain"}
          </button>
        </div>
      </div>
    </div>
  );
}