import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestDataSet, TestCaseDataMapping } from '@shared/schema';

interface TestDataState {
  testDataSets: TestDataSet[];
  testCaseDataMappings: TestCaseDataMapping[];
}

const initialState: TestDataState = {
  testDataSets: [],
  testCaseDataMappings: []
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
    },
    setTestCaseDataMappings: (state, action: PayloadAction<TestCaseDataMapping[]>) => {
      state.testCaseDataMappings = action.payload;
    },
    addTestCaseDataMapping: (state, action: PayloadAction<TestCaseDataMapping>) => {
      state.testCaseDataMappings.push(action.payload);
    },
    removeTestCaseDataMapping: (state, action: PayloadAction<string>) => {
      state.testCaseDataMappings = state.testCaseDataMappings.filter(mapping => mapping.id !== action.payload);
    },
    updateTestDataItem: (state, action: PayloadAction<{ id: string; itemId: string; updates: any }>) => {
      const { id, itemId, updates } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet && dataSet.data) {
        const itemIndex = dataSet.data.findIndex((item: any) => item.id === itemId);
        if (itemIndex !== -1) {
          dataSet.data[itemIndex] = { ...dataSet.data[itemIndex], ...updates };
        }
      }
    },
    addTestDataItem: (state, action: PayloadAction<{ id: string; item: any }>) => {
      const { id, item } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet) {
        if (!dataSet.data) {
          dataSet.data = [];
        }
        dataSet.data.push(item);
      }
    },
    deleteTestDataItem: (state, action: PayloadAction<{ id: string; itemId: string }>) => {
      const { id, itemId } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet && dataSet.data) {
        dataSet.data = dataSet.data.filter((item: any) => item.id !== itemId);
      }
    }
  }
});

export const { 
  setTestDataSets, 
  addTestDataSet, 
  updateTestDataSet, 
  deleteTestDataSet,
  setTestCaseDataMappings,
  addTestCaseDataMapping,
  removeTestCaseDataMapping,
  updateTestDataItem,
  addTestDataItem,
  deleteTestDataItem
} = testDataSlice.actions;
export default testDataSlice.reducer;