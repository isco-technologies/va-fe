import type { Company } from "../../src/types";
import { Pencil } from "lucide-react";

interface Props {
  company: Company;
  onEdit: () => void;
}

const CompanyCard = ({ company, onEdit }: Props) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex justify-between">
      <div>
        <h3 className="font-semibold text-lg">{company.name}</h3>
        <p className="text-sm text-gray-500">{company.industry}</p>
      </div>

      <button onClick={onEdit} className="text-indigo-600">
        <Pencil className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CompanyCard;
