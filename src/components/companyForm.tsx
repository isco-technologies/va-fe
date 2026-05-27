import React, { useEffect, useState } from "react";
import type { Company } from "../../src/types";

interface Props {
  company?: Company;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">
  ) => void;
}

const CompanyForm: React.FC<Props> = ({
  company,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name);
      setIndustry(company.industry || "");
      setDescription(company.description || "");
    } else {
      setName("");
      setIndustry("");
      setDescription("");
    }
  }, [company]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      industry,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {company ? "Edit Company" : "Add Company"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
