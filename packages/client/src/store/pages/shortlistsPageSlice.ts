import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShortlistsPageState {
  selectedShortlistsIds: string[];
}

const initialState: ShortlistsPageState = {
  selectedShortlistsIds: [],
};

export const shortlistsPageSlice = createSlice({
  name: "shortlistsPage",
  initialState,
  reducers: {
    toggleSelectedShortlistId: (state, action: PayloadAction<string>) => {
      if (state.selectedShortlistsIds.includes(action.payload)) {
        state.selectedShortlistsIds = state.selectedShortlistsIds.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedShortlistsIds = [
          ...state.selectedShortlistsIds,
          action.payload,
        ];
      }
    },
    clearSelectedShortlistsIds: (state) => {
      state.selectedShortlistsIds = [];
    },
  },
});

export default shortlistsPageSlice.reducer;
