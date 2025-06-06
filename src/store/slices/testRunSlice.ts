
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestRun {
  id: string;
  name: string;
  description: string;
  testPlanId: string;
  testSuiteIds: string[];
  assignedTo: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  environment: 'Development' | 'Testing' | 'Staging' | 'Production';
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress: number; // percentage 0-100
  totalTestCases: number;
  executedTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  blockedTestCases: number;
  skippedTestCases: number;
  estimatedHours: number;
  actualHours?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface TestCaseExecution {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: 'Not Run' | 'Passed' | 'Failed' | 'Blocked' | 'Skipped';
  executedBy?: string;
  executedDate?: string;
  executionTime?: number; // in minutes
  actualResult?: string;
  notes?: string;
  defectIds: string[];
  screenshots: string[];
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
  testRunId: string;
  testCaseExecutionId: string;
  assignedTo?: string;
  reportedBy: string;
  reportedDate: string;
  resolvedDate?: string;
  reproductionSteps: string[];
  expectedResult: string;
  actualResult: string;
}

interface TestRunState {
  testRuns: TestRun[];
  testCaseExecutions: TestCaseExecution[];
  defects: Defect[];
}

const initialState: TestRunState = {
  testRuns: [
    {
      id: "TR001",
      name: "E-Commerce Authentication Run",
      description: "Complete authentication functionality testing for e-commerce platform",
      testPlanId: "TP001",
      testSuiteIds: ["TS001"],
      assignedTo: "Carol Brown",
      status: "Completed",
      priority: "High",
      environment: "Testing",
      startDate: "2024-02-01",
      endDate: "2024-02-03",
      actualStartDate: "2024-02-01",
      actualEndDate: "2024-02-03",
      progress: 100,
      totalTestCases: 6,
      executedTestCases: 6,
      passedTestCases: 5,
      failedTestCases: 1,
      blockedTestCases: 0,
      skippedTestCases: 0,
      estimatedHours: 24,
      actualHours: 26,
      createdBy: "John Doe",
      createdDate: "2024-01-30",
      lastModified: "2024-02-03"
    },
    {
      id: "TR002",
      name: "Shopping Cart & Checkout Testing",
      description: "Comprehensive testing of shopping cart and checkout processes",
      testPlanId: "TP001",
      testSuiteIds: ["TS002"],
      assignedTo: "Mark Anderson",
      status: "In Progress",
      priority: "Critical",
      environment: "Staging",
      startDate: "2024-02-05",
      endDate: "2024-02-08",
      actualStartDate: "2024-02-05",
      progress: 67,
      totalTestCases: 6,
      executedTestCases: 4,
      passedTestCases: 3,
      failedTestCases: 1,
      blockedTestCases: 1,
      skippedTestCases: 0,
      estimatedHours: 32,
      actualHours: 28,
      createdBy: "Jane Smith",
      createdDate: "2024-02-03",
      lastModified: "2024-02-07"
    },
    {
      id: "TR003",
      name: "Mobile App Core Features",
      description: "Testing core mobile application features and UI components",
      testPlanId: "TP001",
      testSuiteIds: ["TS004", "TS005"],
      assignedTo: "David Lee",
      status: "Completed",
      priority: "High",
      environment: "Testing",
      startDate: "2024-01-28",
      endDate: "2024-02-02",
      actualStartDate: "2024-01-28",
      actualEndDate: "2024-02-02",
      progress: 100,
      totalTestCases: 8,
      executedTestCases: 8,
      passedTestCases: 6,
      failedTestCases: 2,
      blockedTestCases: 0,
      skippedTestCases: 0,
      estimatedHours: 40,
      actualHours: 45,
      createdBy: "Jane Smith",
      createdDate: "2024-01-25",
      lastModified: "2024-02-02"
    },
    {
      id: "TR004",
      name: "Payment System Integration",
      description: "End-to-end payment system testing including fraud detection",
      testPlanId: "TP001",
      testSuiteIds: ["TS008", "TS009"],
      assignedTo: "Carol Brown",
      status: "Completed",
      priority: "Critical",
      environment: "Staging",
      startDate: "2024-02-08",
      endDate: "2024-02-12",
      actualStartDate: "2024-02-08",
      actualEndDate: "2024-02-12",
      progress: 100,
      totalTestCases: 7,
      executedTestCases: 7,
      passedTestCases: 7,
      failedTestCases: 0,
      blockedTestCases: 0,
      skippedTestCases: 0,
      estimatedHours: 36,
      actualHours: 32,
      createdBy: "Sarah Wilson",
      createdDate: "2024-02-05",
      lastModified: "2024-02-12"
    },
    {
      id: "TR005",
      name: "CRM System Features",
      description: "Core CRM functionality testing including customer management",
      testPlanId: "TP001",
      testSuiteIds: ["TS011"],
      assignedTo: "David Lee",
      status: "Not Started",
      priority: "Medium",
      environment: "Development",
      startDate: "2024-02-15",
      endDate: "2024-02-18",
      progress: 0,
      totalTestCases: 4,
      executedTestCases: 0,
      passedTestCases: 0,
      failedTestCases: 0,
      blockedTestCases: 0,
      skippedTestCases: 0,
      estimatedHours: 20,
      actualHours: 0,
      createdBy: "Lisa Rodriguez",
      createdDate: "2024-02-10",
      lastModified: "2024-02-10"
    }
  ],
  testCaseExecutions: [
    // Authentication Test Executions
    {
      id: "TCE001",
      testRunId: "TR001",
      testCaseId: "TC001",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-01",
      executionTime: 6,
      actualResult: "User successfully logged in with valid credentials",
      notes: "Test passed as expected",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE002",
      testRunId: "TR001",
      testCaseId: "TC002",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-02-01",
      executionTime: 4,
      actualResult: "Login attempt failed with appropriate error message",
      notes: "Error message was displayed correctly",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE003",
      testRunId: "TR001",
      testCaseId: "TC003",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-02",
      executionTime: 10,
      actualResult: "Password reset successful after following email link",
      notes: "Email delivery was a bit slow but functionality worked",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE004",
      testRunId: "TR001",
      testCaseId: "TC004",
      status: "Failed",
      executedBy: "David Lee",
      executedDate: "2024-02-02",
      executionTime: 18,
      actualResult: "Account remained accessible after 5 failed attempts",
      notes: "Bug found in lockout mechanism",
      defectIds: ["DEF001"],
      screenshots: ["lockout-failure.png"]
    },
    {
      id: "TCE005",
      testRunId: "TR001",
      testCaseId: "TC005",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-03",
      executionTime: 14,
      actualResult: "2FA setup completed successfully",
      notes: "QR code scanning worked as expected",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE006",
      testRunId: "TR001",
      testCaseId: "TC046",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-03",
      executionTime: 12,
      actualResult: "Session timeout handled correctly with re-auth prompt",
      notes: "Re-authentication worked smoothly after timeout",
      defectIds: [],
      screenshots: []
    },

    // Shopping Cart Test Executions
    {
      id: "TCE007",
      testRunId: "TR002",
      testCaseId: "TC006",
      status: "Passed",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-05",
      executionTime: 5,
      actualResult: "Item was added to cart successfully",
      notes: "Cart updates were immediate",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE008",
      testRunId: "TR002",
      testCaseId: "TC007",
      status: "Passed",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-05",
      executionTime: 4,
      actualResult: "Item was removed and cart updated correctly",
      notes: "No issues found",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE009",
      testRunId: "TR002",
      testCaseId: "TC008",
      status: "Passed",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-06",
      executionTime: 5,
      actualResult: "Quantity updated and totals calculated correctly",
      notes: "Price calculations were accurate",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE010",
      testRunId: "TR002",
      testCaseId: "TC009",
      status: "Blocked",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-06",
      executionTime: 3,
      actualResult: "Unable to test due to authentication service issues",
      notes: "Authentication service was down during testing",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE011",
      testRunId: "TR002",
      testCaseId: "TC010",
      status: "Failed",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-07",
      executionTime: 22,
      actualResult: "Order submission failed at payment step",
      notes: "Payment gateway integration error",
      defectIds: ["DEF002"],
      screenshots: ["payment-error.png"]
    },

    // Mobile App Test Executions
    {
      id: "TCE012",
      testRunId: "TR003",
      testCaseId: "TC014",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-01-28",
      executionTime: 8,
      actualResult: "Navigation menu worked as expected",
      notes: "All menu items accessible",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE013",
      testRunId: "TR003",
      testCaseId: "TC015",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-01-29",
      executionTime: 16,
      actualResult: "All touch gestures functioned correctly",
      notes: "Tested on multiple devices",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE014",
      testRunId: "TR003",
      testCaseId: "TC016",
      status: "Failed",
      executedBy: "David Lee",
      executedDate: "2024-01-29",
      executionTime: 14,
      actualResult: "Layout issues on small screens",
      notes: "Content overflow on phones smaller than 5 inches",
      defectIds: ["DEF003"],
      screenshots: ["small-screen-overflow.png"]
    },
    {
      id: "TCE015",
      testRunId: "TR003",
      testCaseId: "TC017",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-01-30",
      executionTime: 12,
      actualResult: "Notifications delivered successfully",
      notes: "Tested on both iOS and Android",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE016",
      testRunId: "TR003",
      testCaseId: "TC018",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-01-30",
      executionTime: 10,
      actualResult: "Permission handling worked correctly",
      notes: "Tested both accept and deny flows",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE017",
      testRunId: "TR003",
      testCaseId: "TC019",
      status: "Failed",
      executedBy: "David Lee",
      executedDate: "2024-01-31",
      executionTime: 28,
      actualResult: "Offline changes were lost when coming back online",
      notes: "Sync conflict resolution not working",
      defectIds: ["DEF004"],
      screenshots: ["sync-failure.png"]
    },
    {
      id: "TCE018",
      testRunId: "TR003",
      testCaseId: "TC020",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-02-01",
      executionTime: 32,
      actualResult: "Conflict resolution handled correctly",
      notes: "Custom conflict resolution strategy worked",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE019",
      testRunId: "TR003",
      testCaseId: "TC049",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-02-02",
      executionTime: 16,
      actualResult: "Background sync worked as expected",
      notes: "Notifications arrived when app in background",
      defectIds: [],
      screenshots: []
    },

    // Payment System Test Executions
    {
      id: "TCE020",
      testRunId: "TR004",
      testCaseId: "TC028",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-08",
      executionTime: 20,
      actualResult: "Credit card payment processed successfully",
      notes: "Tested with multiple card types",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE021",
      testRunId: "TR004",
      testCaseId: "TC029",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-09",
      executionTime: 18,
      actualResult: "PayPal integration worked correctly",
      notes: "Smooth redirect and return flow",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE022",
      testRunId: "TR004",
      testCaseId: "TC030",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-10",
      executionTime: 22,
      actualResult: "All payment failure scenarios handled correctly",
      notes: "Error messages were clear and helpful",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE023",
      testRunId: "TR004",
      testCaseId: "TC031",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-02-10",
      executionTime: 26,
      actualResult: "Suspicious transactions flagged correctly",
      notes: "No false positives in test cases",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE024",
      testRunId: "TR004",
      testCaseId: "TC032",
      status: "Passed",
      executedBy: "David Lee",
      executedDate: "2024-02-11",
      executionTime: 32,
      actualResult: "ML model accuracy above threshold",
      notes: "98.5% accuracy on test dataset",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE025",
      testRunId: "TR004",
      testCaseId: "TC033",
      status: "Passed",
      executedBy: "Mark Anderson",
      executedDate: "2024-02-12",
      executionTime: 16,
      actualResult: "Reports generated with accurate data",
      notes: "All export formats worked correctly",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE026",
      testRunId: "TR004",
      testCaseId: "TC051",
      status: "Passed",
      executedBy: "Carol Brown",
      executedDate: "2024-02-12",
      executionTime: 18,
      actualResult: "Refunds processed correctly",
      notes: "Full and partial refunds tested",
      defectIds: [],
      screenshots: []
    }
  ],
  defects: [
    {
      id: "DEF001",
      title: "Account lockout not functioning after multiple failed login attempts",
      description: "The account lockout mechanism is not triggered after five consecutive failed login attempts as specified in requirements",
      severity: "High",
      priority: "P2",
      status: "Open",
      testRunId: "TR001",
      testCaseExecutionId: "TCE004",
      assignedTo: "Alice Johnson",
      reportedBy: "David Lee",
      reportedDate: "2024-02-02",
      reproductionSteps: [
        "Login with incorrect password 5 consecutive times",
        "Attempt login again with correct credentials",
        "Observe that login succeeds instead of showing lockout message"
      ],
      expectedResult: "Account should be locked after 5 failed attempts",
      actualResult: "Account remains accessible after any number of failed attempts"
    },
    {
      id: "DEF002",
      title: "Order submission fails at payment step",
      description: "When attempting to complete checkout, the order submission fails when reaching the payment processing step",
      severity: "Critical",
      priority: "P1",
      status: "In Progress",
      testRunId: "TR002",
      testCaseExecutionId: "TCE011",
      assignedTo: "Tom Davis",
      reportedBy: "Mark Anderson",
      reportedDate: "2024-02-07",
      reproductionSteps: [
        "Add items to cart",
        "Proceed to checkout",
        "Complete shipping information",
        "Select any payment method",
        "Click 'Complete Order'"
      ],
      expectedResult: "Order should be submitted successfully",
      actualResult: "Error occurs with message 'Payment gateway unavailable'"
    },
    {
      id: "DEF003",
      title: "Mobile UI layout broken on small screens",
      description: "Content overflows and UI elements overlap on mobile screens smaller than 5 inches",
      severity: "Medium",
      priority: "P2",
      status: "Open",
      testRunId: "TR003",
      testCaseExecutionId: "TCE014",
      assignedTo: "Bob Wilson",
      reportedBy: "David Lee",
      reportedDate: "2024-01-29",
      reproductionSteps: [
        "Open application on device with screen smaller than 5 inches",
        "Navigate to product detail page",
        "Observe product information section"
      ],
      expectedResult: "Layout should adapt and content should be properly contained",
      actualResult: "Text overflows container and buttons overlap with description"
    },
    {
      id: "DEF004",
      title: "Offline changes lost during sync",
      description: "Changes made while offline are not synchronized when device comes back online",
      severity: "High",
      priority: "P1",
      status: "In Progress",
      testRunId: "TR003",
      testCaseExecutionId: "TCE017",
      assignedTo: "Alice Johnson",
      reportedBy: "David Lee",
      reportedDate: "2024-01-31",
      reproductionSteps: [
        "Make changes to user profile while online",
        "Disconnect device from network",
        "Make additional changes",
        "Reconnect to network",
        "Observe that offline changes are lost"
      ],
      expectedResult: "All changes should sync when connection is restored",
      actualResult: "Only online changes are preserved, offline changes are discarded"
    },
    {
      id: "DEF005",
      title: "Dashboard fails to load on mobile Safari",
      description: "Analytics dashboard shows blank screen when accessed from mobile Safari browser",
      severity: "Medium",
      priority: "P2",
      status: "Open",
      testRunId: "",
      testCaseExecutionId: "",
      assignedTo: "Lisa Garcia",
      reportedBy: "John Doe",
      reportedDate: "2024-02-04",
      reproductionSteps: [
        "Open application in Safari on iOS device",
        "Login to system",
        "Navigate to Analytics Dashboard"
      ],
      expectedResult: "Dashboard should load and display charts",
      actualResult: "Screen remains blank, console shows JavaScript errors"
    }
  ]
};

const testRunSlice = createSlice({
  name: 'testRuns',
  initialState,
  reducers: {
    addTestRun: (state, action: PayloadAction<Omit<TestRun, 'id' | 'createdDate' | 'lastModified'>>) => {
      const newTestRun: TestRun = {
        ...action.payload,
        id: `TR${String(state.testRuns.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      state.testRuns.push(newTestRun);
    },
    updateTestRun: (state, action: PayloadAction<{ id: string; updates: Partial<TestRun> }>) => {
      const { id, updates } = action.payload;
      const index = state.testRuns.findIndex(run => run.id === id);
      if (index !== -1) {
        state.testRuns[index] = {
          ...state.testRuns[index],
          ...updates,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
    },
    deleteTestRun: (state, action: PayloadAction<string>) => {
      const testRunId = action.payload;
      state.testRuns = state.testRuns.filter(run => run.id !== testRunId);
      state.testCaseExecutions = state.testCaseExecutions.filter(execution => execution.testRunId !== testRunId);
      state.defects = state.defects.filter(defect => defect.testRunId !== testRunId);
    },
    startTestRun: (state, action: PayloadAction<string>) => {
      const testRun = state.testRuns.find(run => run.id === action.payload);
      if (testRun) {
        testRun.status = 'In Progress';
        testRun.actualStartDate = new Date().toISOString().split('T')[0];
        testRun.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    pauseTestRun: (state, action: PayloadAction<string>) => {
      const testRun = state.testRuns.find(run => run.id === action.payload);
      if (testRun) {
        testRun.status = 'On Hold';
        testRun.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    completeTestRun: (state, action: PayloadAction<string>) => {
      const testRun = state.testRuns.find(run => run.id === action.payload);
      if (testRun) {
        testRun.status = 'Completed';
        testRun.actualEndDate = new Date().toISOString().split('T')[0];
        testRun.progress = 100;
        testRun.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    updateTestCaseExecution: (state, action: PayloadAction<{ id: string; updates: Partial<TestCaseExecution> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCaseExecutions.findIndex(execution => execution.id === id);
      if (index !== -1) {
        state.testCaseExecutions[index] = { ...state.testCaseExecutions[index], ...updates };
        
        // Update test run statistics
        const testRunId = state.testCaseExecutions[index].testRunId;
        const testRun = state.testRuns.find(run => run.id === testRunId);
        if (testRun) {
          const executions = state.testCaseExecutions.filter(exec => exec.testRunId === testRunId);
          testRun.executedTestCases = executions.filter(exec => exec.status !== 'Not Run').length;
          testRun.passedTestCases = executions.filter(exec => exec.status === 'Passed').length;
          testRun.failedTestCases = executions.filter(exec => exec.status === 'Failed').length;
          testRun.blockedTestCases = executions.filter(exec => exec.status === 'Blocked').length;
          testRun.skippedTestCases = executions.filter(exec => exec.status === 'Skipped').length;
          testRun.progress = Math.round((testRun.executedTestCases / testRun.totalTestCases) * 100);
          testRun.lastModified = new Date().toISOString().split('T')[0];
        }
      }
    },
    addTestCaseExecution: (state, action: PayloadAction<Omit<TestCaseExecution, 'id'>>) => {
      const newExecution: TestCaseExecution = {
        ...action.payload,
        id: `TCE${String(state.testCaseExecutions.length + 1).padStart(3, '0')}`
      };
      state.testCaseExecutions.push(newExecution);
    },
    addDefect: (state, action: PayloadAction<Omit<Defect, 'id'>>) => {
      const newDefect: Defect = {
        ...action.payload,
        id: `DEF${String(state.defects.length + 1).padStart(3, '0')}`
      };
      state.defects.push(newDefect);
    },
    updateDefect: (state, action: PayloadAction<{ id: string; updates: Partial<Defect> }>) => {
      const { id, updates } = action.payload;
      const index = state.defects.findIndex(defect => defect.id === id);
      if (index !== -1) {
        state.defects[index] = { ...state.defects[index], ...updates };
      }
    }
  }
});

export const {
  addTestRun,
  updateTestRun,
  deleteTestRun,
  startTestRun,
  pauseTestRun,
  completeTestRun,
  updateTestCaseExecution,
  addTestCaseExecution,
  addDefect,
  updateDefect
} = testRunSlice.actions;

export default testRunSlice.reducer;
