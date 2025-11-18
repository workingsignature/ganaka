import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface KeyFormState {
  opened: boolean;
  isCreateMode: boolean;
  keyId: string | null;
}

const initialState: KeyFormState = {
  opened: false,
  isCreateMode: true,
  keyId: null,
};

export const keyFormSlice = createSlice({
  name: "keyForm",
  initialState,
  reducers: {
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
    setKeyId: (state, action: PayloadAction<string | null>) => {
      state.keyId = action.payload;
    },
  },
});

export default keyFormSlice.reducer;

