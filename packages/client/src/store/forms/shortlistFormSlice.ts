import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShortlistFormState {
  opened: boolean;
  isCreateMode: boolean;
  shortlistId: string;
}

const initialState: ShortlistFormState = {
  opened: false,
  isCreateMode: true,
  shortlistId: "",
};

export const shortlistFormSlice = createSlice({
  name: "shortlistForm",
  initialState,
  reducers: {
    setShortlistId: (state, action: PayloadAction<string>) => {
      state.shortlistId = action.payload;
    },
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
  },
});

export default shortlistFormSlice.reducer;
