import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard } from "lucide-react";
import AppLayout from "../../appLayout";
import { useAppDispatch } from "../../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../../feature/hooks/useAppSelector";
import {fetchAssessments,createAssessment,} from "../../../feature/assessments/assessmentSlice";
import { fetchCompanies } from "../../../feature/company/companySlice";
import { fetchChecklists } from "../../../feature/checklists/checklistSlice";


const Assessments = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


  // Redux State
  const { assessments, isLoading } = useAppSelector(
    (state) => state.assessments
  );

  const { companies } = useAppSelector((state) => state.companies);
  const checklists = useAppSelector((state) => state.checklists.items);

  
  // Local State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [openModal, setOpenModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedChecklists, setSelectedChecklists] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [creating, setCreating] = useState(false);

  
  // Fetch Data
  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchCompanies());
    dispatch(fetchChecklists());
  }, [dispatch]);

  
  // Create Assessment
  const handleCreate = async () => {
    if (!selectedCompany || !selectedChecklists) return;

    try {
      setCreating(true);

      const result = await dispatch(
        createAssessment({
          companyId: selectedCompany,
          checklistId: selectedChecklists,
          name: ""
        })
      );

      const payload = result.payload;
      const id =
        payload && typeof payload !== "string" && (payload as any).id
          ? (payload as any).id
          : undefined;

      if (id) {
        setOpenModal(false);
        navigate(`/assessments/${id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  // Filter Logic
  const filtered = assessments.filter((a) => {
    const matchesSearch =
      a.company.name.toLowerCase().includes(search.toLowerCase()) ||
      a.checklist.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* ================= Header ================= */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Clipboard className="w-6 h-6" />
            Assessments
          </h1>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            New Assessment
          </button>
        </div>

        {/* ================= Filters ================= */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 rounded-md w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* ================= Table ================= */}
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
              {filtered.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/assessments/${assessment.id}`)
                  }
                >
                  <td className="px-4 py-3">
                    {assessment.company.name}
                  </td>

                  <td className="px-4 py-3">
                    {assessment.checklist.name}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        assessment.status === "COMPLETED"
                          ? "bg-green-100 text-green-600"
                          : assessment.status === "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 w-48">
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div
                        className="bg-indigo-600 h-2 rounded"
                        style={{
                          width: `${assessment.progress || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {assessment.progress || 0}%
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        assessment.risk === "HIGH"
                          ? "bg-red-100 text-red-600"
                          : assessment.risk === "MEDIUM"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {assessment.risk || "LOW"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* ================= Modal ================= */}
      {openModal && (
        <div className="fixed inset-0 bg-gray-300/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Create Assessment
            </h2>

            {/* Company */}
            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              {companies?.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              
              ))}
            </select>

            {/* Checklist */}
            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedChecklists}
              onChange={(e) => setSelectedChecklists(e.target.value)}
            >
              <option value="">Select Checklist</option>
              {checklists?.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                disabled={
                  !selectedCompany ||
                  !selectedChecklists ||
                  creating
                }
                onClick={handleCreate}
                className={`px-4 py-2 rounded-md text-white ${
                  !selectedCompany || !selectedChecklists
                    ? "bg-gray-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
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