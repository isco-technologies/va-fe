import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard } from "lucide-react";
import AppLayout from "../../appLayout";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchAssessments,createAssessment} from "../../../feature/assessments/assessmentSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import { fetchChecklists } from "../../../feature/checklists/checklistSlice";

const Assessments = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { assessments} = useAppSelector(
    (state) => state.assessments
  );

  const { companies } = useAppSelector((state) => state.companies);
  const checklists = useAppSelector((state) => state.checklists.items);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedChecklists, setSelectedChecklists] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchCompanies());
    dispatch(fetchChecklists());
  }, [dispatch]);

  // CREATE
  const handleCreate = async () => {
    if (!selectedCompany || !selectedChecklists) return;

    try {
      setCreating(true);

      const result = await dispatch(
        createAssessment({
          companyId: selectedCompany,
          checklistId: selectedChecklists,
          name: "",
        })
      );

      const payload = result.payload;
      const id =
        payload && typeof payload !== "string" && (payload as any).id;

      if (id) {
        setOpenModal(false);
        navigate(`/admin/assessments/${id}/review`);
      }
    } finally {
      setCreating(false);
    }
  };

  // SEARCH FILTER
  const filtered = assessments.filter((a) => {
    return (
      a.company.name.toLowerCase().includes(search.toLowerCase()) ||
      a.checklist.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // GROUPING
  const assigned = filtered.filter(
    (a) => a.status === "IN_PROGRESS" || a.status === "COMPLETED"
  );

  const notStarted = filtered.filter((a) => a.status === "DRAFT");

  // STATUS BADGE
  const getStatusStyle = (status: string) => {
    if (status === "COMPLETED") return "bg-green-100 text-green-600";
    if (status === "IN_PROGRESS") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-200 text-gray-700";
  };

  // RENDER TABLE
  const renderTable = (data: any[]) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Checklist</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Risk</th>
          </tr>
        </thead>

        <tbody>
          {data.map((a) => (
            <tr
              key={a.id}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/admin/assessments/${a.id}/review`)}
            >
              <td className="px-4 py-3">{a.company.name}</td>
              <td className="px-4 py-3">{a.checklist.name}</td>

              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>
              </td>

              <td className="px-4 py-3 w-48">
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-indigo-600 h-2 rounded"
                    style={{ width: `${a.progress || 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {a.progress || 0}%
                </span>
              </td>

              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                  {a.risk || "LOW"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          No data available
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Clipboard className="w-6 h-6" />
            Assessments
          </h1>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            New Assessment
          </button>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded-md w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ASSIGNED */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Assigned Assessments
          </h2>
          {renderTable(assigned)}
        </div>

        {/* NOT STARTED */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Not Started
          </h2>
          {renderTable(notStarted)}
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-gray-300/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Create Assessment
            </h2>

            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedChecklists}
              onChange={(e) => setSelectedChecklists(e.target.value)}
            >
              <option value="">Select Checklist</option>
              {checklists?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                disabled={!selectedCompany || !selectedChecklists}
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Assessments;