import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RunFormState {
  opened: boolean;
  isCreateMode: boolean;
  strategyId: string;
  versionId: string;
  runId: string;
}

const initialState: RunFormState = {
  opened: false,
  isCreateMode: true,
  strategyId: "",
  versionId: "",
  runId: "",
};

export const runFormSlice = createSlice({
  name: "runForm",
  initialState,
  reducers: {
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
    setStrategyId: (state, action: PayloadAction<string>) => {
      state.strategyId = action.payload;
    },
    setVersionId: (state, action: PayloadAction<string>) => {
      state.versionId = action.payload;
    },
    setRunId: (state, action: PayloadAction<string>) => {
      state.runId = action.payload;
    },
  },
});

export default runFormSlice.reducer;
