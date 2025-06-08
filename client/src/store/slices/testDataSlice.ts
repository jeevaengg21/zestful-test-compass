
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestDataItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'password';
  description?: string;
}

export interface TestDataSet {
  id: string;
  name: string;
  description: string;
  productId: string;
  moduleId?: string;
  items: TestDataItem[];
  createdDate: string;
  lastModified: string;
  createdBy: string;
  isActive: boolean;
}

export interface TestCaseDataMapping {
  id: string;
  testCaseId: string;
  testDataSetId: string;
  isDefault: boolean;
  createdDate: string;
}

interface TestDataState {
  testDataSets: TestDataSet[];
  testCaseDataMappings: TestCaseDataMapping[];
}

const initialState: TestDataState = {
  testDataSets: [
    {
      id: "TDS001",
      name: "Valid User Credentials",
      description: "Test data for valid user login scenarios",
      productId: "PROD001",
      moduleId: "MOD001",
      items: [
        {
          id: "TDI001",
          key: "username",
          value: "testuser@example.com",
          type: "email",
          description: "Valid email address for login"
        },
        {
          id: "TDI002",
          key: "password",
          value: "Password123!",
          type: "password",
          description: "Valid password meeting requirements"
        }
      ],
      createdDate: "2024-01-10",
      lastModified: "2024-01-15",
      createdBy: "Carol Brown",
      isActive: true
    },
    {
      id: "TDS002",
      name: "Invalid User Credentials",
      description: "Test data for invalid login scenarios",
      productId: "PROD001",
      moduleId: "MOD001",
      items: [
        {
          id: "TDI003",
          key: "username",
          value: "invalid@example.com",
          type: "email",
          description: "Non-existent email address"
        },
        {
          id: "TDI004",
          key: "password",
          value: "wrongpassword",
          type: "password",
          description: "Incorrect password"
        }
      ],
      createdDate: "2024-01-10",
      lastModified: "2024-01-15",
      createdBy: "David Lee",
      isActive: true
    },
    {
      id: "TDS003",
      name: "Product Catalog Data",
      description: "Sample product data for catalog testing",
      productId: "PROD001",
      moduleId: "MOD003",
      items: [
        {
          id: "TDI005",
          key: "productName",
          value: "Test Product",
          type: "string",
          description: "Sample product name"
        },
        {
          id: "TDI006",
          key: "productPrice",
          value: "29.99",
          type: "number",
          description: "Sample product price"
        },
        {
          id: "TDI007",
          key: "productCategory",
          value: "Electronics",
          type: "string",
          description: "Product category"
        }
      ],
      createdDate: "2024-01-14",
      lastModified: "2024-01-18",
      createdBy: "Mark Anderson",
      isActive: true
    },
    {
      id: "TDS004",
      name: "Payment Test Data",
      description: "Test payment information for checkout testing",
      productId: "PROD004",
      moduleId: "MOD010",
      items: [
        {
          id: "TDI008",
          key: "cardNumber",
          value: "4111111111111111",
          type: "string",
          description: "Test credit card number"
        },
        {
          id: "TDI009",
          key: "expiryDate",
          value: "12/25",
          type: "string",
          description: "Card expiry date"
        },
        {
          id: "TDI010",
          key: "cvv",
          value: "123",
          type: "string",
          description: "Card security code"
        }
      ],
      createdDate: "2024-01-24",
      lastModified: "2024-01-28",
      createdBy: "Carol Brown",
      isActive: true
    }
  ],
  testCaseDataMappings: [
    {
      id: "TCDM001",
      testCaseId: "TC001",
      testDataSetId: "TDS001",
      isDefault: true,
      createdDate: "2024-01-15"
    },
    {
      id: "TCDM002",
      testCaseId: "TC002",
      testDataSetId: "TDS002",
      isDefault: true,
      createdDate: "2024-01-15"
    },
    {
      id: "TCDM003",
      testCaseId: "TC011",
      testDataSetId: "TDS003",
      isDefault: true,
      createdDate: "2024-01-18"
    },
    {
      id: "TCDM004",
      testCaseId: "TC028",
      testDataSetId: "TDS004",
      isDefault: true,
      createdDate: "2024-01-28"
    }
  ]
};

const testDataSlice = createSlice({
  name: 'testData',
  initialState,
  reducers: {
    addTestDataSet: (state, action: PayloadAction<Omit<TestDataSet, 'id' | 'createdDate' | 'lastModified'>>) => {
      const newTestDataSet: TestDataSet = {
        ...action.payload,
        id: `TDS${String(state.testDataSets.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      state.testDataSets.push(newTestDataSet);
    },
    updateTestDataSet: (state, action: PayloadAction<{ id: string; updates: Partial<TestDataSet> }>) => {
      const { id, updates } = action.payload;
      const index = state.testDataSets.findIndex(set => set.id === id);
      if (index !== -1) {
        state.testDataSets[index] = {
          ...state.testDataSets[index],
          ...updates,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
    },
    deleteTestDataSet: (state, action: PayloadAction<string>) => {
      const testDataSetId = action.payload;
      state.testDataSets = state.testDataSets.filter(set => set.id !== testDataSetId);
      // Remove associated mappings
      state.testCaseDataMappings = state.testCaseDataMappings.filter(
        mapping => mapping.testDataSetId !== testDataSetId
      );
    },
    addTestDataItem: (state, action: PayloadAction<{ testDataSetId: string; item: Omit<TestDataItem, 'id'> }>) => {
      const { testDataSetId, item } = action.payload;
      const testDataSet = state.testDataSets.find(set => set.id === testDataSetId);
      if (testDataSet) {
        const newItem: TestDataItem = {
          ...item,
          id: `TDI${String(Date.now()).slice(-6)}`
        };
        testDataSet.items.push(newItem);
        testDataSet.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    updateTestDataItem: (state, action: PayloadAction<{ testDataSetId: string; itemId: string; updates: Partial<TestDataItem> }>) => {
      const { testDataSetId, itemId, updates } = action.payload;
      const testDataSet = state.testDataSets.find(set => set.id === testDataSetId);
      if (testDataSet) {
        const itemIndex = testDataSet.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          testDataSet.items[itemIndex] = { ...testDataSet.items[itemIndex], ...updates };
          testDataSet.lastModified = new Date().toISOString().split('T')[0];
        }
      }
    },
    deleteTestDataItem: (state, action: PayloadAction<{ testDataSetId: string; itemId: string }>) => {
      const { testDataSetId, itemId } = action.payload;
      const testDataSet = state.testDataSets.find(set => set.id === testDataSetId);
      if (testDataSet) {
        testDataSet.items = testDataSet.items.filter(item => item.id !== itemId);
        testDataSet.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    addTestCaseDataMapping: (state, action: PayloadAction<Omit<TestCaseDataMapping, 'id' | 'createdDate'>>) => {
      const newMapping: TestCaseDataMapping = {
        ...action.payload,
        id: `TCDM${String(state.testCaseDataMappings.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0]
      };
      state.testCaseDataMappings.push(newMapping);
    },
    removeTestCaseDataMapping: (state, action: PayloadAction<string>) => {
      state.testCaseDataMappings = state.testCaseDataMappings.filter(
        mapping => mapping.id !== action.payload
      );
    },
    updateTestCaseDataMapping: (state, action: PayloadAction<{ id: string; updates: Partial<TestCaseDataMapping> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCaseDataMappings.findIndex(mapping => mapping.id === id);
      if (index !== -1) {
        state.testCaseDataMappings[index] = { ...state.testCaseDataMappings[index], ...updates };
      }
    }
  }
});

export const {
  addTestDataSet,
  updateTestDataSet,
  deleteTestDataSet,
  addTestDataItem,
  updateTestDataItem,
  deleteTestDataItem,
  addTestCaseDataMapping,
  removeTestCaseDataMapping,
  updateTestCaseDataMapping
} = testDataSlice.actions;

export default testDataSlice.reducer;
