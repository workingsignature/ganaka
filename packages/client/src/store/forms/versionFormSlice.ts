import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface VersionFormState {
  opened: boolean;
  isCreateMode: boolean;
  strategyId: string;
  versionId: string;
}

const initialState: VersionFormState = {
  opened: false,
  isCreateMode: true,
  strategyId: "",
  versionId: "",
};

export const versionFormSlice = createSlice({
  name: "versionForm",
  initialState,
  reducers: {
    setStrategyId: (state, action: PayloadAction<string>) => {
      state.strategyId = action.payload;
    },
    setVersionId: (state, action: PayloadAction<string>) => {
      state.versionId = action.payload;
    },
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
  },
});

export default versionFormSlice.reducer;
