import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestPlan } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface TestPlanState {
  testPlans: TestPlan[];
  loading: boolean;
  error: string | null;
  testExecutions: any[]; // Add this type properly based on your schema
}

const initialState: TestPlanState = {
  testPlans: [],
  loading: false,
  error: null,
  testExecutions: []
};

// Helper to normalize test plan data to prevent React rendering issues with complex objects
const normalizeTestPlanData = (testPlan: any): TestPlan => {
  // Create a deep copy to avoid mutation
  const normalizedPlan = { ...testPlan };
  
  // Ensure dates are strings (not objects)
  if (normalizedPlan.startDate && typeof normalizedPlan.startDate === 'object') {
    normalizedPlan.startDate = normalizedPlan.startDate.toString();
  }
  
  if (normalizedPlan.endDate && typeof normalizedPlan.endDate === 'object') {
    normalizedPlan.endDate = normalizedPlan.endDate.toString();
  }
  
  if (normalizedPlan.createdDate && typeof normalizedPlan.createdDate === 'object') {
    normalizedPlan.createdDate = normalizedPlan.createdDate.toString();
  }
  
  if (normalizedPlan.lastModified && typeof normalizedPlan.lastModified === 'object') {
    normalizedPlan.lastModified = normalizedPlan.lastModified.toString();
  }
  
  // Handle the entryExitCriteria object which seems to be causing the problem
  if (normalizedPlan.entryExitCriteria && typeof normalizedPlan.entryExitCriteria === 'object') {
    const { entryCriteria = [], exitCriteria = [] } = normalizedPlan.entryExitCriteria;
    
    // Ensure these are simple arrays of strings
    normalizedPlan.entryExitCriteria = {
      entryCriteria: Array.isArray(entryCriteria) ? entryCriteria.map(item => String(item)) : [],
      exitCriteria: Array.isArray(exitCriteria) ? exitCriteria.map(item => String(item)) : []
    };
  } else {
    // If it's not an object, provide a default structure
    normalizedPlan.entryExitCriteria = {
      entryCriteria: [],
      exitCriteria: []
    };
  }
  
  // Make sure other arrays are properly initialized
  normalizedPlan.objectives = Array.isArray(normalizedPlan.objectives) ? normalizedPlan.objectives : [];
  normalizedPlan.testSuiteIds = Array.isArray(normalizedPlan.testSuiteIds) ? normalizedPlan.testSuiteIds : [];
  normalizedPlan.assignedTeamMembers = Array.isArray(normalizedPlan.assignedTeamMembers) ? normalizedPlan.assignedTeamMembers : [];
  normalizedPlan.deliverables = Array.isArray(normalizedPlan.deliverables) ? normalizedPlan.deliverables : [];
  normalizedPlan.risks = Array.isArray(normalizedPlan.risks) ? normalizedPlan.risks : [];
  
  return normalizedPlan as TestPlan;
};

// Async thunk for creating test plans
export const createTestPlanAsync = createAsyncThunk(
  'testPlans/createTestPlan',
  async (testPlanData: Omit<TestPlan, 'id' | 'createdDate' | 'lastModified' | 'progress'>) => {
    console.log("createTestPlanAsync - sending data to server:", testPlanData);
    try {
      const response = await apiRequest('/api/test-plans', {
        method: 'POST',
        body: JSON.stringify(testPlanData),
      });
      console.log("createTestPlanAsync - received response:", response);
      return normalizeTestPlanData(response); // Normalize before adding to state
    } catch (error) {
      console.error("createTestPlanAsync - error:", error);
      throw error;
    }
  }
);

// Async thunk for updating test plans
export const updateTestPlanAsync = createAsyncThunk(
  'testPlans/updateTestPlan',
  async ({ id, updates }: { id: string; updates: Partial<TestPlan> }) => {
    console.log(`updateTestPlanAsync - updating test plan ${id} with:`, updates);
    try {
      const response = await apiRequest(`/api/test-plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      console.log("updateTestPlanAsync - received response:", response);
      return normalizeTestPlanData(response); // Normalize before adding to state
    } catch (error) {
      console.error("updateTestPlanAsync - error:", error);
      throw error;
    }
  }
);

// Async thunk for fetching all test plans
export const fetchTestPlans = createAsyncThunk(
  'testPlans/fetchTestPlans',
  async () => {
    console.log("fetchTestPlans - fetching test plans");
    try {
      const response = await apiRequest('/api/test-plans');
      console.log("fetchTestPlans - received test plans:", response);
      
      // Normalize all test plans in the array
      const normalizedTestPlans = Array.isArray(response) 
        ? response.map(plan => normalizeTestPlanData(plan))
        : [];
        
      return normalizedTestPlans;
    } catch (error) {
      console.error("fetchTestPlans - error:", error);
      throw error;
    }
  }
);

const testPlanSlice = createSlice({
  name: 'testPlans',
  initialState,
  reducers: {
    setTestPlans: (state, action: PayloadAction<TestPlan[]>) => {
      console.log("Redux - setTestPlans:", action.payload);
      state.testPlans = action.payload;
    },
    addTestPlan: (state, action: PayloadAction<TestPlan>) => {
      console.log("Redux - addTestPlan:", action.payload);
      state.testPlans.push(action.payload);
    },
    updateTestPlan: (state, action: PayloadAction<{ id: string; updates: Partial<TestPlan> }>) => {
      console.log("Redux - updateTestPlan:", action.payload);
      const { id, updates } = action.payload;
      const index = state.testPlans.findIndex(plan => plan.id === id);
      if (index !== -1) {
        state.testPlans[index] = { ...state.testPlans[index], ...updates };
      }
    },
    deleteTestPlan: (state, action: PayloadAction<string>) => {
      console.log("Redux - deleteTestPlan:", action.payload);
      state.testPlans = state.testPlans.filter(plan => plan.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTestPlanAsync.pending, (state) => {
        console.log("Redux - createTestPlanAsync.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestPlanAsync.fulfilled, (state, action) => {
        console.log("Redux - createTestPlanAsync.fulfilled:", action.payload);
        state.loading = false;
        
        // Check if dates need formatting before adding to state
        const testPlan = action.payload;
        console.log("Test plan to add to state:", testPlan);
        console.log("Start date type:", testPlan.startDate ? typeof testPlan.startDate : "undefined");
        console.log("End date type:", testPlan.endDate ? typeof testPlan.endDate : "undefined");
        
        state.testPlans.push(testPlan);
      })
      .addCase(createTestPlanAsync.rejected, (state, action) => {
        console.log("Redux - createTestPlanAsync.rejected:", action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to create test plan';
      })
      .addCase(updateTestPlanAsync.pending, (state) => {
        console.log("Redux - updateTestPlanAsync.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTestPlanAsync.fulfilled, (state, action) => {
        console.log("Redux - updateTestPlanAsync.fulfilled:", action.payload);
        state.loading = false;
        const index = state.testPlans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.testPlans[index] = action.payload;
        }
      })
      .addCase(updateTestPlanAsync.rejected, (state, action) => {
        console.log("Redux - updateTestPlanAsync.rejected:", action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to update test plan';
      })
      .addCase(fetchTestPlans.pending, (state) => {
        console.log("Redux - fetchTestPlans.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestPlans.fulfilled, (state, action) => {
        console.log("Redux - fetchTestPlans.fulfilled:", action.payload);
        state.loading = false;
        state.testPlans = action.payload;
      })
      .addCase(fetchTestPlans.rejected, (state, action) => {
        console.log("Redux - fetchTestPlans.rejected:", action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch test plans';
      });
  }
});

export const { setTestPlans, addTestPlan, updateTestPlan, deleteTestPlan } = testPlanSlice.actions;
export default testPlanSlice.reducer;