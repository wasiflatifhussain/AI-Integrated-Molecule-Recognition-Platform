import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: false,
  },
  reducers: {
    truthify: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      console.log("bingo");
      state.value = true
    },
    falsify: (state) => {
      state.value = false
    },
  },
})

// Action creators are generated for each case reducer function
export const { truthify, falsify } = counterSlice.actions

export default counterSlice.reducer