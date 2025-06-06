
import { create } from 'zustand';

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
  estimatedTime: number; // in minutes
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  productId: string;
  moduleId: string;
  testCaseIds: string[]; // References to test cases
  status: 'Active' | 'Inactive' | 'Archived';
  createdDate: string;
  lastModified: string;
  owner: string;
}

interface TestStore {
  testCases: TestCase[];
  testSuites: TestSuite[];
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdDate' | 'lastRun'>) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  addTestSuite: (testSuite: Omit<TestSuite, 'id' | 'createdDate' | 'lastModified'>) => void;
  updateTestSuite: (id: string, updates: Partial<TestSuite>) => void;
  deleteTestSuite: (id: string) => void;
  getTestCasesByProduct: (productId: string) => TestCase[];
  getTestCasesByModule: (moduleId: string) => TestCase[];
  getTestSuitesByProduct: (productId: string) => TestSuite[];
  getTestSuitesByModule: (moduleId: string) => TestSuite[];
  getTestCasesInSuite: (suiteId: string) => TestCase[];
  addTestCaseToSuite: (suiteId: string, testCaseId: string) => void;
  removeTestCaseFromSuite: (suiteId: string, testCaseId: string) => void;
}

export const useTestStore = create<TestStore>((set, get) => ({
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
  ],
  addTestCase: (testCaseData) =>
    set((state) => ({
      testCases: [
        ...state.testCases,
        {
          ...testCaseData,
          id: `TC${String(state.testCases.length + 1).padStart(3, '0')}`,
          createdDate: new Date().toISOString().split('T')[0],
          lastRun: "Never"
        }
      ]
    })),
  updateTestCase: (id, updates) =>
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, ...updates } : testCase
      )
    })),
  deleteTestCase: (id) =>
    set((state) => ({
      testCases: state.testCases.filter((testCase) => testCase.id !== id),
      testSuites: state.testSuites.map((suite) => ({
        ...suite,
        testCaseIds: suite.testCaseIds.filter((tcId) => tcId !== id)
      }))
    })),
  addTestSuite: (testSuiteData) =>
    set((state) => ({
      testSuites: [
        ...state.testSuites,
        {
          ...testSuiteData,
          id: `TS${String(state.testSuites.length + 1).padStart(3, '0')}`,
          createdDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0]
        }
      ]
    })),
  updateTestSuite: (id, updates) =>
    set((state) => ({
      testSuites: state.testSuites.map((testSuite) =>
        testSuite.id === id 
          ? { 
              ...testSuite, 
              ...updates, 
              lastModified: new Date().toISOString().split('T')[0] 
            } 
          : testSuite
      )
    })),
  deleteTestSuite: (id) =>
    set((state) => ({
      testSuites: state.testSuites.filter((testSuite) => testSuite.id !== id)
    })),
  getTestCasesByProduct: (productId) => {
    return get().testCases.filter((testCase) => testCase.productId === productId);
  },
  getTestCasesByModule: (moduleId) => {
    return get().testCases.filter((testCase) => testCase.moduleId === moduleId);
  },
  getTestSuitesByProduct: (productId) => {
    return get().testSuites.filter((testSuite) => testSuite.productId === productId);
  },
  getTestSuitesByModule: (moduleId) => {
    return get().testSuites.filter((testSuite) => testSuite.moduleId === moduleId);
  },
  getTestCasesInSuite: (suiteId) => {
    const suite = get().testSuites.find((s) => s.id === suiteId);
    if (!suite) return [];
    return get().testCases.filter((tc) => suite.testCaseIds.includes(tc.id));
  },
  addTestCaseToSuite: (suiteId, testCaseId) =>
    set((state) => ({
      testSuites: state.testSuites.map((suite) =>
        suite.id === suiteId
          ? {
              ...suite,
              testCaseIds: [...new Set([...suite.testCaseIds, testCaseId])],
              lastModified: new Date().toISOString().split('T')[0]
            }
          : suite
      )
    })),
  removeTestCaseFromSuite: (suiteId, testCaseId) =>
    set((state) => ({
      testSuites: state.testSuites.map((suite) =>
        suite.id === suiteId
          ? {
              ...suite,
              testCaseIds: suite.testCaseIds.filter((id) => id !== testCaseId),
              lastModified: new Date().toISOString().split('T')[0]
            }
          : suite
      )
    }))
}));
