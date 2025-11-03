import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface StrategyFormState {
  opened: boolean;
  isCreateMode: boolean;
  strategyId: string | null;
}

const initialState: StrategyFormState = {
  opened: false,
  isCreateMode: true,
  strategyId: null,
};

export const strategyFormSlice = createSlice({
  name: "strategyForm",
  initialState,
  reducers: {
    setIsCreateMode: (state, action: PayloadAction<boolean>) => {
      state.isCreateMode = action.payload;
    },
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;
    },
    setStrategyId: (state, action: PayloadAction<string | null>) => {
      state.strategyId = action.payload;
    },
  },
});

export default strategyFormSlice.reducer;
