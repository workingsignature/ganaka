import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShortlistsPageState {
  currentShortlistId: string | null;
}

const initialState: ShortlistsPageState = {
  currentShortlistId: null,
};

export const shortlistsPageSlice = createSlice({
  name: "shortlistsPage",
  initialState,
  reducers: {
    setCurrentShortlistId: (state, action: PayloadAction<string | null>) => {
      state.currentShortlistId = action.payload;
    },
  },
});

export default shortlistsPageSlice.reducer;
