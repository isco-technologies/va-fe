/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/Axios";
import type { User } from "../../types";

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface UsersState {
  users: User[];
  pagination: Pagination;
  isLoading: boolean;
  error?: string;
}

const initialState: UsersState = {
  users: [],
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  },
  isLoading: false,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page, limit }: { page: number; limit: number }) => {
    const res = await apiClient.get("/users", {
      params: { page, limit },
    });

    return res.data;
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (data: any) => {
    const res = await apiClient.post("/users", data);
    return res.data;
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }: { id: string; data: any }) => {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res.data;
  }
);

export const archiveUser = createAsyncThunk(
  "users/archiveUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/users/${id}/archive`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to archive user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;

        const payload = action.payload;

        // Backend returns ARRAY
        if (Array.isArray(payload)) {
          state.users = payload;

          state.pagination = {
            page: 1,
            totalPages: 1,
            total: payload.length,
            limit: payload.length,
          };

          return;
        }

        // Backend returns OBJECT
        state.users = payload.users ?? payload.data ?? [];

        state.pagination = payload.pagination ?? {
          page: 1,
          totalPages: 1,
          total: state.users.length,
          limit: 20,
        };
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // ADD USER
      .addCase(addUser.fulfilled, (state, action) => {
        const newUser = action.payload?.data ?? action.payload;

        if (newUser) {
          state.users.unshift(newUser);
        }
      })

      // UPDATE USER
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload?.data ?? action.payload;

        const index = state.users.findIndex(
          (u) => u.id === updatedUser.id
        );

        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // ARCHIVE USER
      .addCase(archiveUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => u.id !== action.payload
        );
      });
  },
});

export default userSlice.reducer;