import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "../company/companySlice";
import assessmentReducer from "../assessments/assessmentSlice";
import checklistReducer from "../checklists/checklistSlice";
import userReducer from "../users/userSlice";

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    assessments: assessmentReducer,
    checklists: checklistReducer,
    users: userReducer,
  },
});

// Types inferred from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
