import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestDataSet } from '@shared/schema';

interface TestDataState {
  testDataSets: TestDataSet[];
}

const initialState: TestDataState = {
  testDataSets: []
};

const testDataSlice = createSlice({
  name: 'testData',
  initialState,
  reducers: {
    setTestDataSets: (state, action: PayloadAction<TestDataSet[]>) => {
      state.testDataSets = action.payload;
    },
    addTestDataSet: (state, action: PayloadAction<TestDataSet>) => {
      state.testDataSets.push(action.payload);
    },
    updateTestDataSet: (state, action: PayloadAction<{ id: string; updates: Partial<TestDataSet> }>) => {
      const { id, updates } = action.payload;
      const index = state.testDataSets.findIndex(set => set.id === id);
      if (index !== -1) {
        state.testDataSets[index] = { ...state.testDataSets[index], ...updates };
      }
    },
    deleteTestDataSet: (state, action: PayloadAction<string>) => {
      state.testDataSets = state.testDataSets.filter(set => set.id !== action.payload);
    }
  }
});

export const { setTestDataSets, addTestDataSet, updateTestDataSet, deleteTestDataSet } = testDataSlice.actions;
export default testDataSlice.reducer;