/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {fetchAssessmentsAPI,createAssessmentAPI,fetchAssessmentDetailsAPI,} from "../../api/Assessment.api";

export type AssessmentStatus =

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

interface AssessmentDetails {
  id: string;
  company: { id: string; name: string };
  checklist: { id: string; name: string };
  domains: any[];
}

interface AssessmentState {
  details: unknown;
  assessment: AssessmentDetails | null;
  domains: any[];
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  assessment: null,
  domains: [],
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
  } catch (err: unknown) {
    return rejectWithValue(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch assessments"
    );
  }
});

export const fetchAssessmentDetails = createAsyncThunk<
  AssessmentDetails,
  string,
  { rejectValue: string }
>("assessments/fetchDetails", async (id, { rejectWithValue }) => {
  try {
    return await fetchAssessmentDetailsAPI(id);
  } catch (err: unknown) {
    return rejectWithValue(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch assessment details"
    );
  }
});

export const createAssessment = createAsyncThunk<
  Assessment,
  { name: string; type: string; companyId: string; conductedById: string; checklistId: string   },
  { rejectValue: string }
>("assessments/create", async (data, { rejectWithValue }) => {
  try {
    return await createAssessmentAPI(data);
  } catch (err: unknown) {
    return rejectWithValue(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create assessment"
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
      .addCase(fetchAssessmentDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessment = action.payload;
        state.domains = action.payload.domains;
      })
      .addCase(fetchAssessmentDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching assessment details";
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessments.unshift(action.payload);
      });
  },
});

export default assessmentSlice.reducer;