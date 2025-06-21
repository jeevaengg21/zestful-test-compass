import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestCase, TestSuite } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface TestState {
  testCases: TestCase[];
  testSuites: TestSuite[];
}

const initialState: TestState = {
  testCases: [],
  testSuites: []
};

// Async thunks for test suites
export const fetchTestSuites = createAsyncThunk(
  'tests/fetchTestSuites',
  async () => {
    const response = await apiRequest('/api/test-suites');
    return response;
  }
);

export const createTestSuiteAsync = createAsyncThunk(
  'tests/createTestSuite',
  async (testSuiteData: Partial<TestSuite>) => {
    const response = await apiRequest('/api/test-suites', {
      method: 'POST',
      body: JSON.stringify(testSuiteData),
    });
    return response;
  }
);

export const updateTestSuiteAsync = createAsyncThunk(
  'tests/updateTestSuite',
  async ({ id, updates }: { id: string; updates: Partial<TestSuite> }) => {
    const response = await apiRequest(`/api/test-suites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response;
  }
);

export const deleteTestSuiteAsync = createAsyncThunk(
  'tests/deleteTestSuite',
  async (id: string) => {
    await apiRequest(`/api/test-suites/${id}`, {
      method: 'DELETE',
    });
    return id;
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setTestCases: (state, action: PayloadAction<TestCase[]>) => {
      state.testCases = action.payload;
    },
    setTestSuites: (state, action: PayloadAction<TestSuite[]>) => {
      state.testSuites = action.payload;
    },
    addTestCase: (state, action: PayloadAction<TestCase>) => {
      state.testCases.push(action.payload);
    },
    addTestSuite: (state, action: PayloadAction<TestSuite>) => {
      state.testSuites.push(action.payload);
    },
    updateTestCase: (state, action: PayloadAction<{ id: string; updates: Partial<TestCase> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCases.findIndex(testCase => testCase.id === id);
      if (index !== -1) {
        state.testCases[index] = { ...state.testCases[index], ...updates };
      }
    },
    updateTestSuite: (state, action: PayloadAction<{ id: string; updates: Partial<TestSuite> }>) => {
      const { id, updates } = action.payload;
      const index = state.testSuites.findIndex(testSuite => testSuite.id === id);
      if (index !== -1) {
        state.testSuites[index] = { ...state.testSuites[index], ...updates };
      }
    },
    deleteTestCase: (state, action: PayloadAction<string>) => {
      state.testCases = state.testCases.filter(testCase => testCase.id !== action.payload);
    },
    deleteTestSuite: (state, action: PayloadAction<string>) => {
      state.testSuites = state.testSuites.filter(testSuite => testSuite.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestSuites.fulfilled, (state, action) => {
        state.testSuites = action.payload;
      })
      .addCase(createTestSuiteAsync.fulfilled, (state, action) => {
        state.testSuites.push(action.payload);
      })
      .addCase(updateTestSuiteAsync.fulfilled, (state, action) => {
        const index = state.testSuites.findIndex(suite => suite.id === action.payload.id);
        if (index !== -1) {
          state.testSuites[index] = action.payload;
        }
      })
      .addCase(deleteTestSuiteAsync.fulfilled, (state, action) => {
        state.testSuites = state.testSuites.filter(suite => suite.id !== action.payload);
      });
  }
});

export const { 
  setTestCases, 
  setTestSuites, 
  addTestCase, 
  addTestSuite, 
  updateTestCase, 
  updateTestSuite, 
  deleteTestCase, 
  deleteTestSuite 
} = testSlice.actions;

export default testSlice.reducer;