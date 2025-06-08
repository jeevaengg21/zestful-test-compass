import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestRun } from '@shared/schema';

interface TestRunState {
  testRuns: TestRun[];
}

const initialState: TestRunState = {
  testRuns: []
};

const testRunSlice = createSlice({
  name: 'testRuns',
  initialState,
  reducers: {
    setTestRuns: (state, action: PayloadAction<TestRun[]>) => {
      state.testRuns = action.payload;
    },
    addTestRun: (state, action: PayloadAction<TestRun>) => {
      state.testRuns.push(action.payload);
    },
    updateTestRun: (state, action: PayloadAction<{ id: string; updates: Partial<TestRun> }>) => {
      const { id, updates } = action.payload;
      const index = state.testRuns.findIndex(run => run.id === id);
      if (index !== -1) {
        state.testRuns[index] = { ...state.testRuns[index], ...updates };
      }
    },
    deleteTestRun: (state, action: PayloadAction<string>) => {
      state.testRuns = state.testRuns.filter(run => run.id !== action.payload);
    }
  }
});

export const { setTestRuns, addTestRun, updateTestRun, deleteTestRun } = testRunSlice.actions;
export default testRunSlice.reducer;