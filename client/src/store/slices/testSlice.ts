import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestCase, TestSuite } from '@shared/schema';

interface TestState {
  testCases: TestCase[];
  testSuites: TestSuite[];
}

const initialState: TestState = {
  testCases: [],
  testSuites: []
};

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