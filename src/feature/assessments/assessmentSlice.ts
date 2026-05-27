import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {fetchAssessmentsAPI,createAssessmentAPI,} from "../../api/Assessment.api";

export type AssessmentStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface Assessment {
  risk: string;
  id: string;
  name: string;
  status: AssessmentStatus;

  company: {
    id: string;
    name: string;
  };

  checklist: {
    id: string;
    name: string;
  };

  progress?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";

  createdAt: string;
}

interface AssessmentState {
  details: any;
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  isLoading: false,
  error: null,
  details: undefined
};

export const fetchAssessments = createAsyncThunk<
  Assessment[],
  void,
  { rejectValue: string }
>("assessments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await fetchAssessmentsAPI();
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch assessments"
    );
  }
});

export const createAssessment = createAsyncThunk<
  Assessment,
  { name: string; companyId: string; checklistId: string },
  { rejectValue: string }
>("assessments/create", async (data, { rejectWithValue }) => {
  try {
    return await createAssessmentAPI(data);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create assessment"
    );
  }
});

const assessmentSlice = createSlice({
  name: "assessments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessments = action.payload ?? [];
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching assessments";
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessments.unshift(action.payload);
      });
  },
});

export default assessmentSlice.reducer;
