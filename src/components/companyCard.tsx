import { useState } from "react";
import type { Company } from "../types";
import { Pencil, Info } from "lucide-react";
import apiClient from "../api/Axios";

interface Props {
  company: Company;
  onEdit: () => void;
}

const CompanyCard = ({
  company,
  onEdit,
}: Props) => {
  const [showInfo, setShowInfo] =
    useState(false);

  const [status, setStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >(company.status);

  const [isUpdating, setIsUpdating] =
    useState(false);

  // ================= TOGGLE STATUS =================

  const handleToggleStatus =
    async () => {
      try {
        setIsUpdating(true);

        const newStatus =
          status === "ACTIVE"
            ? "INACTIVE"
            : "ACTIVE";

        await apiClient.patch(
          `/companies/${company.id}/status`,
          {
            status: newStatus,
          }
        );

        setStatus(newStatus);
      } catch (error) {
        console.error(
          "Failed to update company status",
          error
        );
      } finally {
        setIsUpdating(false);
      }
    };

  return (
    <>
      <div className="bg-white shadow rounded-xl p-5 flex justify-between items-start hover:shadow-md transition">

        {/* ================= COMPANY INFO ================= */}
        <div>
          <div className="flex items-center gap-3">

            <h3 className="font-semibold text-lg text-gray-800">
              {company.name}
            </h3>

            {/* Status Badge */}
            <button
              onClick={
                handleToggleStatus
              }
              disabled={isUpdating}
              className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
                status === "ACTIVE"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              } ${
                isUpdating
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isUpdating
                ? "..."
                : status}
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Industry:{" "}
            {company.industry ||
              "N/A"}
          </p>

          <p className="text-sm text-gray-500">
            Created:{" "}
            {new Date(
              company.createdAt
            ).toLocaleDateString()}
          </p>

          {company.description && (
            <p className="text-sm text-gray-500 mt-1">
              {company.description}
            </p>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex gap-3">

          {/* Edit */}
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <Pencil className="h-5 w-5" />
          </button>

          {/* Info */}
          <button
            onClick={() =>
              setShowInfo(true)
            }
            className="text-orange-600 hover:text-orange-800"
          >
            <Info className="h-5 w-5" />
          </button>

        </div>
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold">
                Company Details
              </h2>

              <button
                onClick={() =>
                  setShowInfo(false)
                }
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">

              <p>
                <strong>Name:</strong>{" "}
                {company.name}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    status ===
                    "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {status}
                </span>
              </p>

              <p>
                <strong>Industry:</strong>{" "}
                {company.industry ||
                  "N/A"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {company.description ||
                  "N/A"}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(
                  company.createdAt
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {company.email ||
                  "N/A"}
                {company.contactEmail &&
                  ` (${company.contactEmail})`}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {company.phone ||
                  "N/A"}
                {company.contactPhone &&
                  ` (${company.contactPhone})`}
              </p>

              {company.address && (
                <p>
                  <strong>Address:</strong>{" "}
                  {company.address}
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CompanyCard;