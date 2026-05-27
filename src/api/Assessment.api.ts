import axios from "./Axios";

export const fetchAssessmentsAPI = async () => {
  const res = await axios.get("/assessments");
  return res.data;
};

export const createAssessmentAPI = async (data: {
  name: string;
  type: string;
  companyId: string;
  conductedById: string;
}) => {
  const res = await axios.post("/assessments", data);
  return res.data;
};

export const updateAssessmentStatusAPI = async (
  id: string,
  status: string
) => {
  const res = await axios.patch(`/assessments/${id}/status`, { status });
  return res.data;
};
