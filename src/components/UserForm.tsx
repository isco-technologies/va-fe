import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import type { User, Company, UserRole } from "../types";

interface UserFormProps {
  user?: User;
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    role: UserRole;
    companyId?: string;
  }) => Promise<void>;
}

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Company Admin" },
  { value: "AUDITOR", label: "Auditor" },
  { value: "CLIENT", label: "Client" },
];

const UserForm: React.FC<UserFormProps> = ({
  user,
  companies = [],
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    companyId?: string;
  }>({
    name: "",
    email: "",
    role: "CLIENT",
    companyId: undefined,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "CLIENT",
        companyId: user.company?.id || undefined,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "CLIENT",
        companyId: undefined,
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (formData.role === "SUPER_ADMIN") {
      setFormData((prev) => ({
        ...prev,
        companyId: undefined,
      }));
    }
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      companyId:
        formData.role === "SUPER_ADMIN" ? undefined : formData.companyId,
    };

    await onSubmit(payload);
    onClose();
  };

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {user ? "Edit User" : "Add User"}
          </h2>

          <button onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.name}
              placeholder="Full Name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="form-label">Email:</label>
            <input
              type="email"
              required
              className="w-full border rounded-md px-3 py-2"
              value={formData.email}
              placeholder="user@isco.co.rw"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="form-label">Role</label>
            <Select
              options={roleOptions}
              value={roleOptions.find((r) => r.value === formData.role)}
              onChange={(opt) =>
                setFormData({
                  ...formData,
                  role: (opt?.value as UserRole) || "CLIENT",
                })
              }
            />
          </div>

          {formData.role !== "SUPER_ADMIN" && (
            <div>
              <label className="form-label">Company</label>
              <Select
                options={companyOptions}
                placeholder="Select company"
                value={
                  companyOptions.find(
                    (opt) => opt.value === formData.companyId
                  ) || null
                }
                onChange={(opt) =>
                  setFormData({
                    ...formData,
                    companyId: opt?.value,
                  })
                }
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {user ? "Update User" : "Create User"}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;