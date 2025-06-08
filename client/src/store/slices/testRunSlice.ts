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
    },
    startTestRun: (state, action: PayloadAction<string>) => {
      const index = state.testRuns.findIndex(run => run.id === action.payload);
      if (index !== -1) {
        state.testRuns[index] = { ...state.testRuns[index], status: 'In Progress', startDate: new Date() };
      }
    },
    completeTestRun: (state, action: PayloadAction<{ id: string; status: 'Passed' | 'Failed' }>) => {
      const { id, status } = action.payload;
      const index = state.testRuns.findIndex(run => run.id === id);
      if (index !== -1) {
        state.testRuns[index] = { ...state.testRuns[index], status, endDate: new Date() };
      }
    },
    pauseTestRun: (state, action: PayloadAction<string>) => {
      const index = state.testRuns.findIndex(run => run.id === action.payload);
      if (index !== -1) {
        state.testRuns[index] = { ...state.testRuns[index], status: 'Paused' };
      }
    }
  }
});

export const { setTestRuns, addTestRun, updateTestRun, deleteTestRun, startTestRun, completeTestRun, pauseTestRun } = testRunSlice.actions;
export default testRunSlice.reducer;