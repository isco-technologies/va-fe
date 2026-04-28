import { useState } from "react";
import type { Company } from "../types";
import { Pencil, Info } from "lucide-react";

interface Props {
  company: Company;
  onEdit: () => void;
}

const CompanyCard = ({ company, onEdit }: Props) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-white shadow rounded-xl p-5 flex justify-between items-start hover:shadow-md transition">

        {/* Company info */}
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            {company.name}
          </h3>

          <p className="text-sm text-gray-500">
            Industry: {company.industry}
          </p>

          <p className="text-sm text-gray-500">
            Created: {new Date(company.createdAt).toLocaleDateString()}
          </p>

          {company.description && (
            <p className="text-sm text-gray-500 mt-1">
              {company.description}
            </p>
          )}
        </div>

        {/* Actions */}
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
            onClick={() => setShowInfo(true)}
            className="text-orange-600 hover:text-orange-800"
          >
            <Info className="h-5 w-5" />
          </button>

        </div>
      </div>

      {/* Company Details Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Company Details
              </h2>

              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">

              <p>
                <strong>Name:</strong> {company.name}
              </p>

              <p>
                <strong>Industry:</strong> {company.industry}
              </p>

              <p>
                <strong>Description:</strong> {company.description || "N/A"}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(company.createdAt).toLocaleDateString()}
              </p>

              {/* Example extra fields */}
              
                <p>
                  <strong>Email:</strong> {company.email}
                  {company.contactEmail && ` (${company.contactEmail})`}
                </p>
              
                <p>
                  <strong>Phone:</strong> {company.phone}
                  {company.contactPhone && ` (${company.contactPhone})`}
                </p>
              

              {/*company.address && (
                <p>
                  <strong>Address:</strong> {company.address}
                </p>
              )*/}

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CompanyCard;