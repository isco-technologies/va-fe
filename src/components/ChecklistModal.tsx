/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";

import type {
  Checklists,
} from "../api/checklistAPI";

type Props = {
  open: boolean;

  onClose: () => void;

  onSubmit: (data: {
    name: string;
    description?: string | null;
  }) => void;

  initial?: Checklists | null;

  title: string;
};

export default function ChecklistModal({
  open,
  onClose,
  onSubmit,
  initial,
  title,
}: Props) {
  // POPULATE FORM

  const initialForm = useMemo(() => {
    if (!open) return null;

    // EDIT MODE

    if (initial) {
      return {
        name:
          initial.name || "",

        description:
          initial.description || "",
      };
    }

    // CREATE MODE

    else {
      return {
        name: "",
        description: "",
      };
    }
  }, [initial, open]);

  // FORM STATE

  const [form, setForm] =
    useState({
      name: "",
      description: "",
    });

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    }
  }, [initialForm]);

  // CLOSE MODAL

  if (!open) return null;

  // SUBMIT

  const handleSubmit = () => {
    if (!form.name.trim()) {
      window.alert(
        "Checklist name is required"
      );

      return;
    }

    onSubmit({
      name:
        form.name.trim(),

      description:
        form.description.trim()
          ? form.description.trim()
          : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-4 p-5">
          {/* NAME */}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  name:
                    e.target.value,
                }))
              }
              placeholder="e.g. Cybersecurity Audit Checklist"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              value={
                form.description
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  description:
                    e.target.value,
                }))
              }
              placeholder="Short checklist description..."
              rows={5}
            />
          </div>

          {/* INFO */}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
            Newly created
            checklists start as
            <span className="ml-1 font-semibold">
              INACTIVE
            </span>
            and become
            <span className="mx-1 font-semibold">
              ACTIVE
            </span>
            once assigned to an
            assessment.
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}