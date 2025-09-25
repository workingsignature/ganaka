import { createSlice } from "@reduxjs/toolkit";

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
});

export default appSlice.reducer;
