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

// Async thunk for creating a new test run
export const createTestRunAsync = createAsyncThunk(
  'testRuns/createTestRunAsync',
  async (testRunData: Omit<TestRun, 'id'>) => {
    try {
      console.log("Creating test run with data:", testRunData);
      const response = await apiRequest('/api/test-runs', {
        method: 'POST',
        body: testRunData,
      });
      console.log("createTestRunAsync - response:", response);
      return response;
    } catch (error) {
      console.error("createTestRunAsync - error:", error);
      throw error;
    }
  }
);

// Async thunk for updating a test run
export const updateTestRunAsync = createAsyncThunk(
  'testRuns/updateTestRunAsync',
  async ({ id, updates, testCaseIds }: { id: string, updates: Partial<TestRun>, testCaseIds?: string[] }) => {
    try {
      const response = await apiRequest(`/api/test-runs/${id}`, {
        method: 'PATCH',
        body: { updates, testCaseIds },
      });
      return { id, updates: response };
    } catch (error) {
      console.error("updateTestRunAsync - error:", error);
      throw error;
    }
  }
);

// Async thunk for fetching test case executions for a test run
export const fetchTestCaseExecutions = createAsyncThunk(
  'testRuns/fetchTestCaseExecutions',
  async (testRunId: string) => {
    try {
      console.log(`Fetching test case executions for test run: ${testRunId}`);
      const response = await apiRequest(`/api/test-case-executions?testRunId=${testRunId}`);
      console.log(`Fetched ${response.length} test case executions for test run ${testRunId}:`, response);
      return response;
    } catch (error) {
      console.error("fetchTestCaseExecutions - error:", error);
      throw error;
    }
  }
);

// Async thunk for creating test case executions for a test run
export const generateTestCaseExecutionsAsync = createAsyncThunk(
  'testRuns/generateTestCaseExecutionsAsync',
  async ({ testRunId, testCases }: { testRunId: string, testCases: any[] }, { dispatch, getState }) => {
    try {
      console.log(`Generating executions for ${testCases.length} test cases in run ${testRunId}`);
      
      // Log test cases to help with debugging
      console.log('Test cases to generate executions for:', JSON.stringify(testCases, null, 2));
      
      // Create execution records for each test case
      const executions = testCases.map(testCase => ({
        testRunId,
        testCaseId: testCase.id,
        status: 'Not Executed' as const,
        priority: testCase.priority || 'Medium',
        order: testCase.order || 0
      }));
      
      console.log('Generated execution records:', JSON.stringify(executions, null, 2));
      
      // Make API call to create the executions
      const response = await apiRequest('/api/test-case-executions/batch', {
        method: 'POST',
        body: { executions },
      });
      
      console.log(`Created ${response.length} test case executions for test run ${testRunId}`);
      return response;
    } catch (error) {
      console.error("generateTestCaseExecutionsAsync - error:", error);
      throw error;
    }
  }
);

// Async thunk for fetching all test cases for a specific test suite
export const fetchTestCasesForSuite = createAsyncThunk(
  'testRuns/fetchTestCasesForSuite',
  async (suiteId: string) => {
    try {
      console.log(`Fetching test cases for suite: ${suiteId}`);
      const response = await apiRequest(`/api/test-suites/${suiteId}/test-cases`);
      console.log(`Fetched ${response.length} test cases for suite ${suiteId}`);
      return response;
    } catch (error) {
      console.error("fetchTestCasesForSuite - error:", error);
      throw error;
    }
  }
);

// Async thunk for updating a test case execution
export const updateTestCaseExecutionAsync = createAsyncThunk(
  'testRuns/updateTestCaseExecutionAsync',
  async ({ id, updates }: { id: string, updates: Partial<TestCaseExecution> }) => {
    try {
      console.log(`Updating test case execution ${id} with:`, updates);
      const response = await apiRequest(`/api/test-case-executions/${id}`, {
        method: 'PATCH',
        body: updates,
      });
      console.log(`Updated test case execution ${id}:`, response);
      return { id, updates: response };
    } catch (error) {
      console.error("updateTestCaseExecutionAsync - error:", error);
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
      })
      // Handle the createTestRunAsync action
      .addCase(createTestRunAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestRunAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.testRuns.push(action.payload);
      })
      .addCase(createTestRunAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create test run';
      })
      // Handle the updateTestRunAsync action
      .addCase(updateTestRunAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTestRunAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.testRuns.findIndex(run => run.id === id);
        if (index !== -1) {
          state.testRuns[index] = { ...state.testRuns[index], ...updates };
        }
      })
      .addCase(updateTestRunAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update test run';
      })
      // Handle fetching test case executions
      .addCase(fetchTestCaseExecutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestCaseExecutions.fulfilled, (state, action) => {
        state.loading = false;
        state.testCaseExecutions = action.payload;
      })
      .addCase(fetchTestCaseExecutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch test case executions';
      })
      // Handle generating test case executions
      .addCase(generateTestCaseExecutionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTestCaseExecutionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.testCaseExecutions = [...state.testCaseExecutions, ...action.payload];
      })
      .addCase(generateTestCaseExecutionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate test case executions';
      })
      // Handle fetching test cases for a suite
      .addCase(fetchTestCasesForSuite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestCasesForSuite.fulfilled, (state, action) => {
        state.loading = false;
        // Do not overwrite all test case executions with test cases
        // state.testCaseExecutions = action.payload;
      })
      .addCase(fetchTestCasesForSuite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch test cases for suite';
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