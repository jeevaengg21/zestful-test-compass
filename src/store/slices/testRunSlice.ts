
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
      name: "Sprint 23 Regression",
      description: "Comprehensive regression testing for Sprint 23 release",
      testPlanId: "TP001",
      testSuiteIds: ["TS001", "TS002"],
      assignedTo: "USR002",
      status: "In Progress",
      priority: "High",
      environment: "Testing",
      startDate: "2024-01-15",
      endDate: "2024-01-18",
      actualStartDate: "2024-01-15",
      progress: 65,
      totalTestCases: 120,
      executedTestCases: 78,
      passedTestCases: 70,
      failedTestCases: 6,
      blockedTestCases: 2,
      skippedTestCases: 0,
      estimatedHours: 40,
      actualHours: 32,
      createdBy: "USR001",
      createdDate: "2024-01-14",
      lastModified: "2024-01-16"
    },
    {
      id: "TR002",
      name: "Mobile App Smoke Test",
      description: "Quick smoke testing for mobile application",
      testPlanId: "TP001",
      testSuiteIds: ["TS003"],
      assignedTo: "USR003",
      status: "Completed",
      priority: "Medium",
      environment: "Staging",
      startDate: "2024-01-14",
      endDate: "2024-01-15",
      actualStartDate: "2024-01-14",
      actualEndDate: "2024-01-15",
      progress: 100,
      totalTestCases: 45,
      executedTestCases: 45,
      passedTestCases: 42,
      failedTestCases: 3,
      blockedTestCases: 0,
      skippedTestCases: 0,
      estimatedHours: 16,
      actualHours: 15,
      createdBy: "USR001",
      createdDate: "2024-01-13",
      lastModified: "2024-01-15"
    }
  ],
  testCaseExecutions: [
    {
      id: "TCE001",
      testRunId: "TR001",
      testCaseId: "TC001",
      status: "Passed",
      executedBy: "USR002",
      executedDate: "2024-01-15",
      executionTime: 15,
      actualResult: "Login successful with valid credentials",
      notes: "Test passed as expected",
      defectIds: [],
      screenshots: []
    },
    {
      id: "TCE002",
      testRunId: "TR001",
      testCaseId: "TC002",
      status: "Failed",
      executedBy: "USR002",
      executedDate: "2024-01-15",
      executionTime: 20,
      actualResult: "Error message displayed instead of successful login",
      notes: "Bug found in password validation",
      defectIds: ["DEF001"],
      screenshots: ["screenshot1.png"]
    }
  ],
  defects: [
    {
      id: "DEF001",
      title: "Password validation fails for special characters",
      description: "When password contains special characters, validation fails incorrectly",
      severity: "High",
      priority: "P2",
      status: "Open",
      testRunId: "TR001",
      testCaseExecutionId: "TCE002",
      assignedTo: "USR004",
      reportedBy: "USR002",
      reportedDate: "2024-01-15",
      reproductionSteps: [
        "Navigate to login page",
        "Enter valid username",
        "Enter password with special characters (!@#$)",
        "Click login button"
      ],
      expectedResult: "User should be logged in successfully",
      actualResult: "Error message: 'Invalid password format'"
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
