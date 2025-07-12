import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { TestDataSet, TestCaseDataMapping } from '@shared/schema';

// Define API endpoints
const API_BASE_URL = '/api';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Async thunk actions
export const fetchTestDataSets = createAsyncThunk(
  'testData/fetchTestDataSets',
  async () => {
    const response = await fetch(`${API_BASE_URL}/test-data-sets`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch test data sets');
    }
    return await response.json();
  }
);

export const fetchTestCaseDataMappings = createAsyncThunk(
  'testData/fetchTestCaseDataMappings',
  async () => {
    const response = await fetch(`${API_BASE_URL}/test-case-data-mappings`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch test case data mappings');
    }
    return await response.json();
  }
);

export const addTestDataSetAsync = createAsyncThunk(
  'testData/addTestDataSetAsync',
  async (testDataSet: Omit<TestDataSet, 'id' | 'createdDate' | 'lastModified'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-data-sets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(testDataSet),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test data set');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding test data set:', error);
      throw error;
    }
  }
);

export const updateTestDataSetAsync = createAsyncThunk(
  'testData/updateTestDataSetAsync',
  async ({ id, updates }: { id: string; updates: Partial<TestDataSet> }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-data-sets/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update test data set');
      }
      
      const updatedData = await response.json();
      return { id, updates: updatedData };
    } catch (error) {
      console.error('Error updating test data set:', error);
      throw error;
    }
  }
);

export const deleteTestDataSetAsync = createAsyncThunk(
  'testData/deleteTestDataSetAsync',
  async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-data-sets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete test data set');
      }
      
      return id;
    } catch (error) {
      console.error('Error deleting test data set:', error);
      throw error;
    }
  }
);

export const addTestCaseDataMappingAsync = createAsyncThunk(
  'testData/addTestCaseDataMappingAsync',
  async (mapping: Omit<TestCaseDataMapping, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-case-data-mappings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mapping),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test case data mapping');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding test case data mapping:', error);
      throw error;
    }
  }
);

export const removeTestCaseDataMappingAsync = createAsyncThunk(
  'testData/removeTestCaseDataMappingAsync',
  async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-case-data-mappings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete test case data mapping');
      }
      
      return id;
    } catch (error) {
      console.error('Error removing test case data mapping:', error);
      throw error;
    }
  }
);

// NEW OPTIMIZED ACTION: Fetch test data sets for a specific test case
export const fetchTestDataSetsForTestCase = createAsyncThunk(
  'testData/fetchTestDataSetsForTestCase',
  async (testCaseId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}/test-data-sets`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch test data sets for test case');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching test data sets for test case:', error);
      throw error;
    }
  }
);

export const addTestDataItemAsync = createAsyncThunk(
  'testData/addTestDataItemAsync',
  async ({ testDataSetId, item }: { testDataSetId: string; item: { key: string; value: string; type: string; description?: string } }) => {
    try {
      // Fetch current test data set first
      const getResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        headers: getAuthHeaders(),
      });
      if (!getResponse.ok) {
        throw new Error('Failed to fetch test data set');
      }
      
      const testDataSet = await getResponse.json();
      
      // Let server generate IDs by not supplying one
      const itemForServer = {
        key: item.key,
        value: item.value,
        type: item.type,
        description: item.description || ''
      };
      
      // Add the new item to the data array
      const updatedData = [...(testDataSet.data || []), itemForServer];
      
      // Update the test data set with the new data array
      const updateResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: updatedData }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to add test data item');
      }
      
      // Get the updated test data set with server-generated ID
      const updatedTestDataSet = await updateResponse.json();
      const newItem = updatedTestDataSet.data[updatedTestDataSet.data.length - 1];
      
      return { id: testDataSetId, item: newItem };
    } catch (error) {
      console.error('Error adding test data item:', error);
      throw error;
    }
  }
);

export const updateTestDataItemAsync = createAsyncThunk(
  'testData/updateTestDataItemAsync',
  async ({ testDataSetId, itemId, updates }: { testDataSetId: string; itemId: string; updates: any }) => {
    try {
      // Fetch current test data set first
      const getResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        headers: getAuthHeaders(),
      });
      if (!getResponse.ok) {
        throw new Error('Failed to fetch test data set');
      }
      
      const testDataSet = await getResponse.json();
      
      // Update the specific item in the data array
      const updatedData = testDataSet.data.map((item: any) => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      // Update the test data set with the modified data array
      const updateResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: updatedData }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update test data item');
      }
      
      return { id: testDataSetId, itemId, updates };
    } catch (error) {
      console.error('Error updating test data item:', error);
      throw error;
    }
  }
);

export const deleteTestDataItemAsync = createAsyncThunk(
  'testData/deleteTestDataItemAsync',
  async ({ testDataSetId, itemId }: { testDataSetId: string; itemId: string }) => {
    try {
      // Fetch current test data set first
      const getResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        headers: getAuthHeaders(),
      });
      if (!getResponse.ok) {
        throw new Error('Failed to fetch test data set');
      }
      
      const testDataSet = await getResponse.json();
      
      // Filter out the deleted item from the data array
      const updatedData = testDataSet.data.filter((item: any) => item.id !== itemId);
      
      // Update the test data set with the modified data array
      const updateResponse = await fetch(`${API_BASE_URL}/test-data-sets/${testDataSetId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: updatedData }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to delete test data item');
      }
      
      return { id: testDataSetId, itemId };
    } catch (error) {
      console.error('Error deleting test data item:', error);
      throw error;
    }
  }
);

interface TestDataState {
  testDataSets: TestDataSet[];
  testCaseDataMappings: TestCaseDataMapping[];
  loading: boolean;
  error: string | null;
}

const initialState: TestDataState = {
  testDataSets: [],
  testCaseDataMappings: [],
  loading: false,
  error: null
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
  },
  extraReducers: (builder) => {
    // Fetch Test Data Sets
    builder.addCase(fetchTestDataSets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestDataSets.fulfilled, (state, action) => {
      state.testDataSets = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTestDataSets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch test data sets';
    });

    // Fetch Test Case Data Mappings
    builder.addCase(fetchTestCaseDataMappings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestCaseDataMappings.fulfilled, (state, action) => {
      state.testCaseDataMappings = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTestCaseDataMappings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch test case data mappings';
    });

    // Add Test Data Set
    builder.addCase(addTestDataSetAsync.fulfilled, (state, action) => {
      state.testDataSets.push(action.payload);
    });

    // Update Test Data Set
    builder.addCase(updateTestDataSetAsync.fulfilled, (state, action) => {
      const { id, updates } = action.payload;
      const index = state.testDataSets.findIndex(set => set.id === id);
      if (index !== -1) {
        state.testDataSets[index] = { ...state.testDataSets[index], ...updates };
      }
    });

    // Delete Test Data Set
    builder.addCase(deleteTestDataSetAsync.fulfilled, (state, action) => {
      state.testDataSets = state.testDataSets.filter(set => set.id !== action.payload);
    });

    // Add Test Case Data Mapping
    builder.addCase(addTestCaseDataMappingAsync.fulfilled, (state, action) => {
      state.testCaseDataMappings.push(action.payload);
    });

    // Remove Test Case Data Mapping
    builder.addCase(removeTestCaseDataMappingAsync.fulfilled, (state, action) => {
      state.testCaseDataMappings = state.testCaseDataMappings.filter(mapping => mapping.id !== action.payload);
    });

    // Add Test Data Item
    builder.addCase(addTestDataItemAsync.fulfilled, (state, action) => {
      const { id, item } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet) {
        if (!dataSet.data) {
          dataSet.data = [];
        }
        dataSet.data.push(item);
      }
    });

    // Update Test Data Item
    builder.addCase(updateTestDataItemAsync.fulfilled, (state, action) => {
      const { id, itemId, updates } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet && dataSet.data) {
        const itemIndex = dataSet.data.findIndex((item: any) => item.id === itemId);
        if (itemIndex !== -1) {
          dataSet.data[itemIndex] = { ...dataSet.data[itemIndex], ...updates };
        }
      }
    });

    // Delete Test Data Item
    builder.addCase(deleteTestDataItemAsync.fulfilled, (state, action) => {
      const { id, itemId } = action.payload;
      const dataSet = state.testDataSets.find(set => set.id === id);
      if (dataSet && dataSet.data) {
        dataSet.data = dataSet.data.filter((item: any) => item.id !== itemId);
      }
    });

    // Fetch Test Data Sets For Test Case
    builder.addCase(fetchTestDataSetsForTestCase.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestDataSetsForTestCase.fulfilled, (state, action) => {
      state.testDataSets = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTestDataSetsForTestCase.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch test data sets for test case';
    });
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

// Add this interface export
export interface TestDataItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'password';
  description?: string;
}