
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
      testSuiteIds: ["TS001", "TS002", "TS003", "TS004", "TS005", "TS008", "TS009", "TS011"],
      assignedTeamMembers: ["Carol Brown", "David Lee", "Mark Anderson"],
      startDate: "2024-02-01",
      endDate: "2024-02-20",
      status: "In Progress",
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
      createdBy: "John Doe",
      createdDate: "2024-01-15",
      lastModified: "2024-02-07",
      estimatedEffort: 180,
      actualEffort: 120,
      progress: 65
    },
    {
      id: "TP002",
      name: "Mobile App v2.0 Test Plan",
      description: "Validation of new features in mobile application version 2.0",
      objectives: [
        "Verify all new features function correctly",
        "Ensure backward compatibility with existing data",
        "Validate performance on low-end devices"
      ],
      scope: "Mobile application core and new features",
      testSuiteIds: ["TS004", "TS005"],
      assignedTeamMembers: ["David Lee", "Carol Brown"],
      startDate: "2024-01-25",
      endDate: "2024-02-10",
      status: "Completed",
      priority: "High",
      productId: "PROD002",
      environment: "Staging",
      testStrategy: "Feature-driven testing with emphasis on user experience",
      entryExitCriteria: {
        entryCriteria: [
          "Development feature freeze completed",
          "Test environment provisioned",
          "Test accounts created"
        ],
        exitCriteria: [
          "All high priority test cases executed",
          "No critical defects remaining",
          "User experience validated"
        ]
      },
      deliverables: [
        "Test execution summary",
        "Defect report",
        "Performance metrics"
      ],
      risks: [
        "Device fragmentation issues",
        "Network connectivity variations"
      ],
      createdBy: "Jane Smith",
      createdDate: "2024-01-10",
      lastModified: "2024-02-10",
      estimatedEffort: 100,
      actualEffort: 110,
      progress: 100
    },
    {
      id: "TP003",
      name: "Payment Gateway Security Test Plan",
      description: "Security and compliance testing for payment system",
      objectives: [
        "Verify payment processing security",
        "Ensure PCI-DSS compliance",
        "Validate fraud detection algorithms"
      ],
      scope: "Payment processing system and integrations",
      testSuiteIds: ["TS008", "TS009"],
      assignedTeamMembers: ["Carol Brown", "David Lee", "Mark Anderson"],
      startDate: "2024-02-05",
      endDate: "2024-02-15",
      status: "Completed",
      priority: "Critical",
      productId: "PROD004",
      environment: "Testing",
      testStrategy: "Security-focused testing with penetration tests",
      entryExitCriteria: {
        entryCriteria: [
          "Security architecture review completed",
          "Test data with dummy credit cards created",
          "Secure test environment provisioned"
        ],
        exitCriteria: [
          "All security test cases executed",
          "No critical security vulnerabilities",
          "Compliance requirements met"
        ]
      },
      deliverables: [
        "Security test report",
        "Compliance audit documentation",
        "Penetration test results"
      ],
      risks: [
        "Potential compliance gaps",
        "Third-party integration security concerns"
      ],
      createdBy: "Sarah Wilson",
      createdDate: "2024-01-25",
      lastModified: "2024-02-15",
      estimatedEffort: 80,
      actualEffort: 75,
      progress: 100
    },
    {
      id: "TP004",
      name: "Analytics Dashboard Test Plan",
      description: "Verification of business intelligence features and reporting",
      objectives: [
        "Verify data visualization accuracy",
        "Ensure report generation functionality",
        "Validate dashboard performance with large datasets"
      ],
      scope: "Analytics dashboard and reporting modules",
      testSuiteIds: ["TS010"],
      assignedTeamMembers: ["Mark Anderson", "Carol Brown"],
      startDate: "2024-02-12",
      endDate: "2024-02-25",
      status: "Draft",
      priority: "Medium",
      productId: "PROD005",
      environment: "Development",
      testStrategy: "Data-driven testing with performance focus",
      entryExitCriteria: {
        entryCriteria: [
          "Test data sets prepared",
          "Dashboard features implemented",
          "Chart components ready"
        ],
        exitCriteria: [
          "All visualization test cases executed",
          "Performance metrics within thresholds",
          "Export functionality verified"
        ]
      },
      deliverables: [
        "Visualization accuracy report",
        "Performance metrics analysis",
        "Data integrity verification"
      ],
      risks: [
        "Large dataset handling issues",
        "Browser compatibility concerns"
      ],
      createdBy: "David Chen",
      createdDate: "2024-02-05",
      lastModified: "2024-02-05",
      estimatedEffort: 60,
      actualEffort: 0,
      progress: 0
    },
    {
      id: "TP005",
      name: "CRM System Integration Test Plan",
      description: "End-to-end testing of CRM system integrations",
      objectives: [
        "Verify customer data management",
        "Ensure sales pipeline functionality",
        "Validate communication systems"
      ],
      scope: "CRM modules and external integrations",
      testSuiteIds: ["TS011", "TS012"],
      assignedTeamMembers: ["David Lee", "Mark Anderson"],
      startDate: "2024-02-15",
      endDate: "2024-02-28",
      status: "Draft",
      priority: "High",
      productId: "PROD006",
      environment: "Development",
      testStrategy: "Integration testing with focus on data consistency",
      entryExitCriteria: {
        entryCriteria: [
          "API endpoints implemented",
          "Integration points defined",
          "Test data created"
        ],
        exitCriteria: [
          "All integration tests executed",
          "Data consistency verified",
          "No critical integration defects"
        ]
      },
      deliverables: [
        "Integration test report",
        "Data flow diagrams",
        "API response time analysis"
      ],
      risks: [
        "Third-party API availability",
        "Data consistency across systems"
      ],
      createdBy: "Lisa Rodriguez",
      createdDate: "2024-02-08",
      lastModified: "2024-02-08",
      estimatedEffort: 120,
      actualEffort: 0,
      progress: 0
    }
  ],
  testExecutions: [
    {
      id: "TE001",
      testPlanId: "TP001",
      testSuiteId: "TS001",
      assignedTo: "Carol Brown",
      scheduledStart: "2024-02-01T09:00:00",
      scheduledEnd: "2024-02-03T17:00:00",
      actualStart: "2024-02-01T09:30:00",
      actualEnd: "2024-02-03T16:00:00",
      status: "Completed",
      notes: "Authentication test suite completed successfully with one defect found",
      defectsFound: 1
    },
    {
      id: "TE002",
      testPlanId: "TP001",
      testSuiteId: "TS002",
      assignedTo: "Mark Anderson",
      scheduledStart: "2024-02-05T09:00:00",
      scheduledEnd: "2024-02-08T17:00:00",
      actualStart: "2024-02-05T09:15:00",
      status: "In Progress",
      notes: "Shopping cart and checkout testing in progress",
      defectsFound: 1
    },
    {
      id: "TE003",
      testPlanId: "TP001",
      testSuiteId: "TS003",
      assignedTo: "Carol Brown",
      scheduledStart: "2024-02-10T09:00:00",
      scheduledEnd: "2024-02-12T17:00:00",
      status: "Not Started",
      notes: "Product catalog testing scheduled",
      defectsFound: 0
    },
    {
      id: "TE004",
      testPlanId: "TP002",
      testSuiteId: "TS004",
      assignedTo: "David Lee",
      scheduledStart: "2024-01-25T09:00:00",
      scheduledEnd: "2024-01-28T17:00:00",
      actualStart: "2024-01-25T09:00:00",
      actualEnd: "2024-01-28T17:30:00",
      status: "Completed",
      notes: "Mobile UI testing completed with some issues on small screens",
      defectsFound: 1
    },
    {
      id: "TE005",
      testPlanId: "TP002",
      testSuiteId: "TS005",
      assignedTo: "David Lee",
      scheduledStart: "2024-01-29T09:00:00",
      scheduledEnd: "2024-02-02T17:00:00",
      actualStart: "2024-01-29T09:00:00",
      actualEnd: "2024-02-02T18:00:00",
      status: "Completed",
      notes: "Mobile features testing completed with sync issues discovered",
      defectsFound: 1
    },
    {
      id: "TE006",
      testPlanId: "TP003",
      testSuiteId: "TS008",
      assignedTo: "Carol Brown",
      scheduledStart: "2024-02-05T09:00:00",
      scheduledEnd: "2024-02-09T17:00:00",
      actualStart: "2024-02-05T09:00:00",
      actualEnd: "2024-02-09T16:00:00",
      status: "Completed",
      notes: "Payment processing tests completed successfully",
      defectsFound: 0
    },
    {
      id: "TE007",
      testPlanId: "TP003",
      testSuiteId: "TS009",
      assignedTo: "David Lee",
      scheduledStart: "2024-02-10T09:00:00",
      scheduledEnd: "2024-02-15T17:00:00",
      actualStart: "2024-02-10T09:30:00",
      actualEnd: "2024-02-15T15:00:00",
      status: "Completed",
      notes: "Fraud detection tests completed successfully",
      defectsFound: 0
    },
    {
      id: "TE008",
      testPlanId: "TP004",
      testSuiteId: "TS010",
      assignedTo: "Mark Anderson",
      scheduledStart: "2024-02-12T09:00:00",
      scheduledEnd: "2024-02-20T17:00:00",
      status: "Not Started",
      notes: "Analytics dashboard testing preparation in progress",
      defectsFound: 0
    },
    {
      id: "TE009",
      testPlanId: "TP005",
      testSuiteId: "TS011",
      assignedTo: "David Lee",
      scheduledStart: "2024-02-15T09:00:00",
      scheduledEnd: "2024-02-20T17:00:00",
      status: "Not Started",
      notes: "CRM core testing scheduled",
      defectsFound: 0
    },
    {
      id: "TE010",
      testPlanId: "TP005",
      testSuiteId: "TS012",
      assignedTo: "Mark Anderson",
      scheduledStart: "2024-02-21T09:00:00",
      scheduledEnd: "2024-02-28T17:00:00",
      status: "Not Started",
      notes: "CRM advanced features testing scheduled",
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
