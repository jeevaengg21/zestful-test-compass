
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Passed' | 'Failed' | 'Blocked' | 'Not Run';
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  assignee: string;
  productId: string;
  moduleId: string;
  createdDate: string;
  lastRun: string;
  estimatedTime: number;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  productId: string;
  moduleId: string;
  testCaseIds: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  createdDate: string;
  lastModified: string;
  owner: string;
}

interface TestState {
  testCases: TestCase[];
  testSuites: TestSuite[];
}

const initialState: TestState = {
  testCases: [
    {
      id: "TC001",
      title: "User can login with valid credentials",
      description: "Verify that a user can successfully log in with correct username and password",
      priority: "High",
      status: "Passed",
      steps: [
        "Navigate to login page",
        "Enter valid username",
        "Enter valid password",
        "Click login button"
      ],
      expectedResult: "User should be logged in and redirected to dashboard",
      assignee: "John Doe",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-10",
      lastRun: "2024-01-15",
      estimatedTime: 5
    },
    {
      id: "TC002",
      title: "User cannot login with invalid password",
      description: "Verify that login fails with incorrect password",
      priority: "High",
      status: "Failed",
      steps: [
        "Navigate to login page",
        "Enter valid username",
        "Enter invalid password",
        "Click login button"
      ],
      expectedResult: "Error message should be displayed",
      assignee: "Jane Smith",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-10",
      lastRun: "2024-01-15",
      estimatedTime: 3
    },
    {
      id: "TC003",
      title: "Add item to cart and verify total",
      description: "Test adding items to shopping cart and calculation",
      priority: "Medium",
      status: "Passed",
      steps: [
        "Browse product catalog",
        "Select a product",
        "Add to cart",
        "Verify cart total"
      ],
      expectedResult: "Item should be added and total calculated correctly",
      assignee: "Mike Johnson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-12",
      lastRun: "2024-01-14",
      estimatedTime: 10
    },
    {
      id: "TC004",
      title: "API endpoint returns correct data",
      description: "Verify API endpoint response format and data",
      priority: "Critical",
      status: "Not Run",
      steps: [
        "Send GET request to API endpoint",
        "Verify response status code",
        "Validate response schema",
        "Check data accuracy"
      ],
      expectedResult: "API should return 200 status with valid JSON",
      assignee: "Sarah Wilson",
      productId: "PROD003",
      moduleId: "MOD003",
      createdDate: "2024-01-11",
      lastRun: "Never",
      estimatedTime: 15
    }
  ],
  testSuites: [
    {
      id: "TS001",
      name: "Authentication Test Suite",
      description: "Complete test suite for user authentication features",
      productId: "PROD001",
      moduleId: "MOD001",
      testCaseIds: ["TC001", "TC002"],
      status: "Active",
      createdDate: "2024-01-10",
      lastModified: "2024-01-15",
      owner: "John Doe"
    },
    {
      id: "TS002",
      name: "E-commerce Checkout Suite",
      description: "Test suite covering shopping cart and payment processes",
      productId: "PROD001",
      moduleId: "MOD002",
      testCaseIds: ["TC003"],
      status: "Active",
      createdDate: "2024-01-12",
      lastModified: "2024-01-14",
      owner: "Mike Johnson"
    },
    {
      id: "TS003",
      name: "API Integration Suite",
      description: "Backend API testing suite",
      productId: "PROD003",
      moduleId: "MOD003",
      testCaseIds: ["TC004"],
      status: "Active",
      createdDate: "2024-01-11",
      lastModified: "2024-01-11",
      owner: "Sarah Wilson"
    }
  ]
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    addTestCase: (state, action: PayloadAction<Omit<TestCase, 'id' | 'createdDate' | 'lastRun'>>) => {
      const newTestCase: TestCase = {
        ...action.payload,
        id: `TC${String(state.testCases.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastRun: "Never"
      };
      state.testCases.push(newTestCase);
    },
    updateTestCase: (state, action: PayloadAction<{ id: string; updates: Partial<TestCase> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCases.findIndex(testCase => testCase.id === id);
      if (index !== -1) {
        state.testCases[index] = { ...state.testCases[index], ...updates };
      }
    },
    deleteTestCase: (state, action: PayloadAction<string>) => {
      const testCaseId = action.payload;
      state.testCases = state.testCases.filter(testCase => testCase.id !== testCaseId);
      // Remove from test suites
      state.testSuites.forEach(suite => {
        suite.testCaseIds = suite.testCaseIds.filter(id => id !== testCaseId);
      });
    },
    addTestSuite: (state, action: PayloadAction<Omit<TestSuite, 'id' | 'createdDate' | 'lastModified'>>) => {
      const newTestSuite: TestSuite = {
        ...action.payload,
        id: `TS${String(state.testSuites.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      state.testSuites.push(newTestSuite);
    },
    updateTestSuite: (state, action: PayloadAction<{ id: string; updates: Partial<TestSuite> }>) => {
      const { id, updates } = action.payload;
      const index = state.testSuites.findIndex(testSuite => testSuite.id === id);
      if (index !== -1) {
        state.testSuites[index] = {
          ...state.testSuites[index],
          ...updates,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
    },
    deleteTestSuite: (state, action: PayloadAction<string>) => {
      state.testSuites = state.testSuites.filter(testSuite => testSuite.id !== action.payload);
    },
    addTestCaseToSuite: (state, action: PayloadAction<{ suiteId: string; testCaseId: string }>) => {
      const { suiteId, testCaseId } = action.payload;
      const suite = state.testSuites.find(s => s.id === suiteId);
      if (suite && !suite.testCaseIds.includes(testCaseId)) {
        suite.testCaseIds.push(testCaseId);
        suite.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    removeTestCaseFromSuite: (state, action: PayloadAction<{ suiteId: string; testCaseId: string }>) => {
      const { suiteId, testCaseId } = action.payload;
      const suite = state.testSuites.find(s => s.id === suiteId);
      if (suite) {
        suite.testCaseIds = suite.testCaseIds.filter(id => id !== testCaseId);
        suite.lastModified = new Date().toISOString().split('T')[0];
      }
    }
  }
});

export const {
  addTestCase,
  updateTestCase,
  deleteTestCase,
  addTestSuite,
  updateTestSuite,
  deleteTestSuite,
  addTestCaseToSuite,
  removeTestCaseFromSuite
} = testSlice.actions;

export default testSlice.reducer;
