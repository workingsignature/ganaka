import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShortlistsPageState {
  selectedShortlists: { id: string; name: string }[];
}

const initialState: ShortlistsPageState = {
  selectedShortlists: [],
};

export const shortlistsPageSlice = createSlice({
  name: "shortlistsPage",
  initialState,
  reducers: {
    toggleSelectedShortlist: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      if (
        state.selectedShortlists.some(
          (shortlist) => shortlist.id === action.payload.id
        )
      ) {
        state.selectedShortlists = state.selectedShortlists.filter(
          (shortlist) => shortlist.id !== action.payload.id
        );
      } else {
        state.selectedShortlists = [
          ...state.selectedShortlists,
          action.payload,
        ];
      }
    },
  },
});

export default shortlistsPageSlice.reducer;
