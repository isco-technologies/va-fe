import {createAsyncThunk,createSlice,} from "@reduxjs/toolkit";
import type {PayloadAction,} from "@reduxjs/toolkit";
import type {Checklists,CreateChecklistDto,UpdateChecklistDto,} from "../../api/checklistAPI";
import {getChecklists,createChecklist,updateChecklist,archiveChecklist,} from "../../api/checklistAPI";

type ChecklistState = {
  data: Checklists[];
  items: Checklists[];
  isLoading: boolean;
  error: string | null;
  search: string;
};

const initialState: ChecklistState =
  {
    items: [],
    isLoading: false,
    error: null,
    search: "",
    data: [],
  };

// FETCH

export const fetchChecklists =
  createAsyncThunk(
    "checklists/fetchAll",

    async () => {
      return await getChecklists();
    }
  );

// CREATE

export const addChecklist =
  createAsyncThunk(
    "checklists/create",

    async (
      payload: CreateChecklistDto
    ) => {
      return await createChecklist(
        payload
      );
    }
  );

// UPDATE

export const editChecklist =
  createAsyncThunk(
    "checklists/update",

    async ({
      id,
      payload,
    }: {
      id: string;

      payload: UpdateChecklistDto;
    }) => {
      return await updateChecklist(
        id,
        payload
      );
    }
  );

// ARCHIVE

export const archiveChecklistThunk =
  createAsyncThunk(
    "checklists/archive",

    async (id: string) => {
      return await archiveChecklist(
        id
      );
    }
  );

const checklistSlice =
  createSlice({
    name: "checklists",

    initialState,

    reducers: {
      setChecklistSearch(
        state,
        action: PayloadAction<string>
      ) {
        state.search =
          action.payload;
      },
    },

    extraReducers: (builder) => {
      builder

        // FETCH

        .addCase(
          fetchChecklists.pending,
          (state) => {
            state.isLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          fetchChecklists.fulfilled,
          (state, action) => {
            state.isLoading =
              false;

            state.items =
              action.payload;
          }
        )

        .addCase(
          fetchChecklists.rejected,
          (state, action) => {
            state.isLoading =
              false;

            state.error =
              action.error
                .message ||
              "Failed to fetch checklists";
          }
        )

        // CREATE

        .addCase(
          addChecklist.fulfilled,
          (state, action) => {
            state.items = [
              action.payload,
              ...state.items,
            ];
          }
        )

        // UPDATE

        .addCase(
          editChecklist.fulfilled,
          (state, action) => {
            state.items =
              state.items.map(
                (c) =>
                  c.id ===
                  action.payload.id
                    ? action.payload
                    : c
              );
          }
        )

        // ARCHIVE

        .addCase(
          archiveChecklistThunk.fulfilled,
          (state, action) => {
            state.items =
              state.items.map(
                (c) =>
                  c.id ===
                  action.payload.id
                    ? action.payload
                    : c
              );
          }
        );
    },
  });

export const {
  setChecklistSearch,
} = checklistSlice.actions;

export default checklistSlice.reducer;