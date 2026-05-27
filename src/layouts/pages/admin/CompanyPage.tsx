import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Rows, Building2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import { fetchCompanies,addCompany,updateCompany,} from "../../../feature/company/companySlice";
import CompanyCard from "../../../components/companyCard";
import CompanyForm from "../../../components/companyForm";
import type { Company } from "../../../types";
import AppLayout from "../../appLayout";

type Option = {
  value: string;
  label: string;
};

const CompanyPage = () => {
  const dispatch = useAppDispatch();

  const { companies, isLoading, error } = useAppSelector(
    (state) => state.companies
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [viewMode, setViewMode] = useState<"grid" | "row">("grid");

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const industryOptions: Option[] = Array.from(
  new Set(companies.map((c) => c.industry))
)
  .filter(
    (industry): industry is string =>
      typeof industry === "string"
  )
  .map((industry) => ({
    value: industry,
    label:
      industry.charAt(0).toUpperCase() +
      industry.slice(1),
  }));

  const handleAddEdit = async (
    companyData: Omit<Company, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (selectedCompany) {
        await dispatch(
          updateCompany({ id: selectedCompany.id, data: companyData })
        ).unwrap();
        toast.success("Company updated successfully");
      } else {
        await dispatch(addCompany(companyData)).unwrap();
        toast.success("Company created successfully");
      }
      setIsFormOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      toast.error(err as string);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesIndustry = industryFilter
      ? company.industry === industryFilter.value
      : true;
    return matchesSearch && matchesIndustry;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  // Unique industries count for stats
  const uniqueIndustries = new Set(companies.map((c) => c.industry)).size;

  return (
    <AppLayout>
      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your client organizations
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCompany(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Companies
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {companies.length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Industries
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {uniqueIndustries}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 hidden sm:block">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Showing
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {filteredCompanies.length}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  results
                </span>
              </p>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-3 items-center">

              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* INDUSTRY FILTER */}
              <div className="w-52">
                <Select
                  options={industryOptions}
                  value={industryFilter}
                  onChange={(option) => {
                    setIndustryFilter(option as Option | null);
                    setCurrentPage(1);
                  }}
                  placeholder="All industries"
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "14px",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      minHeight: "38px",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#d1d5db" },
                    }),
                    placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                  }}
                />
              </div>

              {/* VIEW TOGGLE — pushed right */}
              <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("row")}
                  title="List view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "row"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Rows className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* EMPTY STATE */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No companies found</p>
              <p className="text-gray-400 text-xs mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          ) : viewMode === "grid" ? (

            // GRID VIEW
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={() => {
                    setSelectedCompany(company);
                    setIsFormOpen(true);
                  }}
                />
              ))}
            </div>

          ) : (

            // ROW / TABLE VIEW
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Company
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Industry
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar initials */}
                          <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-indigo-600">
                              {company.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {company.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {company.industry ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {company.contactPhone || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {company.contactEmail || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsFormOpen(true);
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {/* Page number pills */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          page === currentPage
                            ? "bg-indigo-600 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      <CompanyForm
        company={selectedCompany || undefined}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleAddEdit}
      />
    </AppLayout>
  );
};

export default CompanyPage;