import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestRun, TestCaseExecution, Defect } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface TestRunState {
  testRuns: TestRun[];
  testCaseExecutions: TestCaseExecution[];
  defects: Defect[];
  loading: boolean;
  error: string | null;
}

const initialState: TestRunState = {
  testRuns: [],
  testCaseExecutions: [],
  defects: [],
  loading: false,
  error: null
};

// Async thunk for fetching all test runs
export const fetchTestRuns = createAsyncThunk(
  'testRuns/fetchTestRuns',
  async () => {
    try {
      const response = await apiRequest('/api/test-runs');
      return response;
    } catch (error) {
      console.error("fetchTestRuns - error:", error);
      throw error;
    }
  }
);

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
    },
    setTestCaseExecutions: (state, action: PayloadAction<TestCaseExecution[]>) => {
      state.testCaseExecutions = action.payload;
    },
    addTestCaseExecution: (state, action: PayloadAction<TestCaseExecution>) => {
      state.testCaseExecutions.push(action.payload);
    },
    updateTestCaseExecution: (state, action: PayloadAction<{ id: string; updates: Partial<TestCaseExecution> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCaseExecutions.findIndex(execution => execution.id === id);
      if (index !== -1) {
        state.testCaseExecutions[index] = { ...state.testCaseExecutions[index], ...updates };
      }
    },
    setDefects: (state, action: PayloadAction<Defect[]>) => {
      state.defects = action.payload;
    },
    addDefect: (state, action: PayloadAction<Defect>) => {
      state.defects.push(action.payload);
    },
    updateDefect: (state, action: PayloadAction<{ id: string; updates: Partial<Defect> }>) => {
      const { id, updates } = action.payload;
      const index = state.defects.findIndex(defect => defect.id === id);
      if (index !== -1) {
        state.defects[index] = { ...state.defects[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestRuns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestRuns.fulfilled, (state, action) => {
        state.loading = false;
        state.testRuns = action.payload;
      })
      .addCase(fetchTestRuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch test runs';
      });
  }
});

export const { 
  setTestRuns, 
  addTestRun, 
  updateTestRun, 
  deleteTestRun, 
  startTestRun, 
  completeTestRun, 
  pauseTestRun,
  setTestCaseExecutions,
  addTestCaseExecution,
  updateTestCaseExecution,
  setDefects,
  addDefect,
  updateDefect
} = testRunSlice.actions;
export default testRunSlice.reducer;