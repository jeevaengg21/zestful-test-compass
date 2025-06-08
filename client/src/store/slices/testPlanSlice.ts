import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestPlan } from '@shared/schema';

interface TestPlanState {
  testPlans: TestPlan[];
}

const initialState: TestPlanState = {
  testPlans: []
};

const testPlanSlice = createSlice({
  name: 'testPlans',
  initialState,
  reducers: {
    setTestPlans: (state, action: PayloadAction<TestPlan[]>) => {
      state.testPlans = action.payload;
    },
    addTestPlan: (state, action: PayloadAction<TestPlan>) => {
      state.testPlans.push(action.payload);
    },
    updateTestPlan: (state, action: PayloadAction<{ id: string; updates: Partial<TestPlan> }>) => {
      const { id, updates } = action.payload;
      const index = state.testPlans.findIndex(plan => plan.id === id);
      if (index !== -1) {
        state.testPlans[index] = { ...state.testPlans[index], ...updates };
      }
    },
    deleteTestPlan: (state, action: PayloadAction<string>) => {
      state.testPlans = state.testPlans.filter(plan => plan.id !== action.payload);
    }
  }
});

export const { setTestPlans, addTestPlan, updateTestPlan, deleteTestPlan } = testPlanSlice.actions;
export default testPlanSlice.reducer;