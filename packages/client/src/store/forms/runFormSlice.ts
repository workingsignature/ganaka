import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RunFormState {
  opened: boolean;
  isCreateMode: boolean;
}

const initialState: RunFormState = {
  opened: false,
  isCreateMode: true,
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
  },
});

export default runFormSlice.reducer;
