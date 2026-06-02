/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Axios from "../../api/Axios";
import type { Company } from "../../types";

interface CompanyState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  isLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk<
  Company[],
  void,
  { rejectValue: string }
>("companies/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await Axios.get("/companies");

    if (!Array.isArray(res.data)) {
      return rejectWithValue("Invalid companies response from server");
    }

    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(
      ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to fetch companies"
    );
  }
});

export const addCompany = createAsyncThunk<
  Company,
  Omit<Company, "id" | "createdAt" | "updatedAt">,
  { rejectValue: string }
>("companies/add", async (data, { rejectWithValue }) => {
  try {
    const res = await Axios.post("/companies", data);
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(
      ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to add company"
    );
  }
});

export const updateCompany = createAsyncThunk<
  Company,
  { id: string; data: Partial<Company> },
  { rejectValue: string }
>("companies/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await Axios.put(`/companies/${id}`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update company"
    );
  }
});

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCompanies.fulfilled,
        (state, action: PayloadAction<Company[]>) => {
          state.isLoading = false;
          state.companies = action.payload;
        }
      )
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load companies";
        state.companies = [];
      })
      .addCase(addCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      });
  },
});

export default companySlice.reducer;
