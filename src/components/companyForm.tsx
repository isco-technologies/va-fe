import React, { useEffect, useState } from "react";
import type { Company } from "../types";
import Select from "react-select";

interface Props {
  company?: Company;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">
  ) => void;
}

const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government" },
];

const CompanyForm: React.FC<Props> = ({
  company,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name);
      setIndustry(
        company.industry
          ? { value: company.industry, label: company.industry }
          : null
      );
      setDescription(company.description || "");
      setContactEmail(String(company.contactEmail || ""));
      setContactPhone(String(company.contactPhone || ""));
      setAddress(String(company.address || ""));
    } else {
      setName("");
      setIndustry(null);
      setDescription("");
      setContactEmail("");
      setContactPhone("");
      setAddress("");
    }
  }, [company]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name,
      industry: industry?.value || "",
      description,
      contactEmail,
      contactPhone,
      address,
      email: contactEmail,
      phone: contactPhone,
      location: address,
      status: "active",
      contacts: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <h2 className="text-xl font-semibold mb-4">
          {company ? "Edit Company" : "Add Company"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Company Name */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Industry Select */}
          <Select
            options={industryOptions}
            value={industry}
            onChange={(option) => setIndustry(option)}
            placeholder="Select industry"
          />

          {/* Description */}
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Email */}
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          {/* Phone */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />

          {/* Address */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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