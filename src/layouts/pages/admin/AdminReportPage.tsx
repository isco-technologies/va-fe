import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";


type Company = {
  id: string;
  name: string;
  industry?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: string;
  createdAt?: string;
  reportProgress?: number;
  assessmentCount?: number;
};

type FilterKey = "all" | "high" | "low";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",  label: "All" },
  { key: "high", label: "Ready" },
  { key: "low",  label: "Low" },
];

export default function AdminReportPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/companies")
      .then((res) => {
        const data = res.data;
        const list: Company[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setCompanies(list);
      })
      .catch((err) => { console.error("Failed to fetch companies:", err); setCompanies([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies
    .filter((c) => {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.industry ?? "").toLowerCase().includes(q);
    })
    .filter((c) => {
      const p = c.reportProgress ?? 0;
      if (filter === "high") return p >= 80;
      if (filter === "low")  return p < 50;
      return true;
    });

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-400 mt-1">Select a company to view their assessment report</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies or industries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white shadow-sm"
          />
        </div>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`h-9 px-4 rounded-xl text-sm border transition-all ${filter === key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Industry</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Contacts</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Loading companies…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  {companies.length === 0 ? "No companies found" : "No companies match your search"}
                </td>
              </tr>
            ) : (
              filtered.map((company) => (
                <tr
                  key={company.id}
                  onClick={() => navigate(`/admin/reports/company/${company.id}`)}
                  className="border-t border-gray-100 hover:bg-green-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">{company.name}</td>
                  <td className="px-6 py-4 text-gray-500">{company.industry || ""}</td>
                  <td className="px-6 py-4 text-gray-500">{company.contactPhone || ""}</td>
                  <td className="px-6 py-4 text-gray-500">{company.contactEmail || ""}</td>
                  <td className="px-6 py-4 text-gray-400 uppercase text-xs tracking-wider">
                    {company.status || "ACTIVE"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              {search || filter !== "all" ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `${companies.length} companies`}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}