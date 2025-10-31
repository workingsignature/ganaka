import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface VersionFormState {
  opened: boolean;
  isCreateMode: boolean;
}

const initialState: VersionFormState = {
  opened: false,
  isCreateMode: true,
};

export const versionFormSlice = createSlice({
  name: "versionForm",
  initialState,
  reducers: {
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
  },
});

export default versionFormSlice.reducer;
