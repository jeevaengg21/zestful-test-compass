
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  scope: string;
  testSuiteIds: string[];
  assignedTeamMembers: string[];
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  productId: string;
  environment: 'Development' | 'Testing' | 'Staging' | 'Production';
  testStrategy: string;
  entryExitCriteria: {
    entryCriteria: string[];
    exitCriteria: string[];
  };
  deliverables: string[];
  risks: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  estimatedEffort: number; // in hours
  actualEffort?: number; // in hours
  progress: number; // percentage 0-100
}

export interface TestExecution {
  id: string;
  testPlanId: string;
  testSuiteId: string;
  assignedTo: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'Skipped';
  notes: string;
  defectsFound: number;
}

interface TestPlanState {
  testPlans: TestPlan[];
  testExecutions: TestExecution[];
}

const initialState: TestPlanState = {
  testPlans: [
    {
      id: "TP001",
      name: "Q1 2024 Regression Test Plan",
      description: "Comprehensive regression testing for all core features before Q1 release",
      objectives: [
        "Verify all existing functionality works correctly",
        "Ensure new features don't break existing ones",
        "Validate performance benchmarks"
      ],
      scope: "All modules except legacy reporting",
      testSuiteIds: ["TS001", "TS002"],
      assignedTeamMembers: ["USR002", "USR003", "USR004"],
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      status: "Active",
      priority: "High",
      productId: "PROD001",
      environment: "Testing",
      testStrategy: "Risk-based testing with focus on critical user journeys",
      entryExitCriteria: {
        entryCriteria: [
          "All development features completed",
          "Test environment setup completed",
          "Test data prepared"
        ],
        exitCriteria: [
          "95% test cases executed",
          "All critical defects resolved",
          "Performance criteria met"
        ]
      },
      deliverables: [
        "Test execution reports",
        "Defect reports",
        "Test coverage analysis"
      ],
      risks: [
        "Limited test environment availability",
        "Resource constraints during holiday season"
      ],
      createdBy: "USR001",
      createdDate: "2024-01-15",
      lastModified: "2024-01-20",
      estimatedEffort: 120,
      actualEffort: 85,
      progress: 75
    }
  ],
  testExecutions: [
    {
      id: "TE001",
      testPlanId: "TP001",
      testSuiteId: "TS001",
      assignedTo: "USR002",
      scheduledStart: "2024-02-01T09:00:00",
      scheduledEnd: "2024-02-05T17:00:00",
      actualStart: "2024-02-01T09:30:00",
      status: "In Progress",
      notes: "Started with authentication test suite",
      defectsFound: 2
    },
    {
      id: "TE002",
      testPlanId: "TP001",
      testSuiteId: "TS002",
      assignedTo: "USR003",
      scheduledStart: "2024-02-06T09:00:00",
      scheduledEnd: "2024-02-10T17:00:00",
      status: "Not Started",
      notes: "Waiting for authentication suite completion",
      defectsFound: 0
    }
  ]
};

const testPlanSlice = createSlice({
  name: 'testPlans',
  initialState,
  reducers: {
    addTestPlan: (state, action: PayloadAction<Omit<TestPlan, 'id' | 'createdDate' | 'lastModified' | 'progress'>>) => {
      const newTestPlan: TestPlan = {
        ...action.payload,
        id: `TP${String(state.testPlans.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        progress: 0
      };
      state.testPlans.push(newTestPlan);
    },
    updateTestPlan: (state, action: PayloadAction<{ id: string; updates: Partial<TestPlan> }>) => {
      const { id, updates } = action.payload;
      const index = state.testPlans.findIndex(plan => plan.id === id);
      if (index !== -1) {
        state.testPlans[index] = {
          ...state.testPlans[index],
          ...updates,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
    },
    deleteTestPlan: (state, action: PayloadAction<string>) => {
      const testPlanId = action.payload;
      state.testPlans = state.testPlans.filter(plan => plan.id !== testPlanId);
      state.testExecutions = state.testExecutions.filter(execution => execution.testPlanId !== testPlanId);
    },
    addTestExecution: (state, action: PayloadAction<Omit<TestExecution, 'id'>>) => {
      const newExecution: TestExecution = {
        ...action.payload,
        id: `TE${String(state.testExecutions.length + 1).padStart(3, '0')}`
      };
      state.testExecutions.push(newExecution);
    },
    updateTestExecution: (state, action: PayloadAction<{ id: string; updates: Partial<TestExecution> }>) => {
      const { id, updates } = action.payload;
      const index = state.testExecutions.findIndex(execution => execution.id === id);
      if (index !== -1) {
        state.testExecutions[index] = { ...state.testExecutions[index], ...updates };
      }
    },
    updateTestPlanProgress: (state, action: PayloadAction<{ testPlanId: string; progress: number }>) => {
      const { testPlanId, progress } = action.payload;
      const plan = state.testPlans.find(p => p.id === testPlanId);
      if (plan) {
        plan.progress = progress;
        plan.lastModified = new Date().toISOString().split('T')[0];
      }
    }
  }
});

export const {
  addTestPlan,
  updateTestPlan,
  deleteTestPlan,
  addTestExecution,
  updateTestExecution,
  updateTestPlanProgress
} = testPlanSlice.actions;

export default testPlanSlice.reducer;
