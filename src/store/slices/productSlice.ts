
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'On Hold' | 'Completed';
  testCases: number;
  testRuns: number;
  teamMembers: number;
  coverage: number;
  lastActivity: string;
  createdDate: string;
  owner: string;
}

interface ProductState {
  products: Product[];
}

const initialState: ProductState = {
  products: [
    {
      id: "PROD001",
      name: "E-Commerce Platform",
      description: "Main e-commerce website testing product including web and mobile interfaces",
      status: "Active",
      testCases: 23,
      testRuns: 3,
      teamMembers: 8,
      coverage: 89,
      lastActivity: "2 hours ago",
      createdDate: "2023-10-15",
      owner: "John Doe"
    },
    {
      id: "PROD002", 
      name: "Mobile Application",
      description: "iOS and Android mobile app testing for customer-facing features",
      status: "Active",
      testCases: 15,
      testRuns: 2,
      teamMembers: 5,
      coverage: 76,
      lastActivity: "1 day ago",
      createdDate: "2023-11-20",
      owner: "Jane Smith"
    },
    {
      id: "PROD003",
      name: "Backend Services",
      description: "API testing and microservices integration testing suite",
      status: "On Hold",
      testCases: 18,
      testRuns: 1,
      teamMembers: 4,
      coverage: 92,
      lastActivity: "1 week ago",
      createdDate: "2023-09-10",
      owner: "Mike Johnson"
    },
    {
      id: "PROD004",
      name: "Payment Gateway",
      description: "Payment processing and financial transaction testing",
      status: "Completed",
      testCases: 12,
      testRuns: 2,
      teamMembers: 3,
      coverage: 95,
      lastActivity: "2 weeks ago",
      createdDate: "2023-08-05",
      owner: "Sarah Wilson"
    },
    {
      id: "PROD005",
      name: "Analytics Dashboard",
      description: "Business intelligence and reporting dashboard testing",
      status: "Active",
      testCases: 8,
      testRuns: 1,
      teamMembers: 6,
      coverage: 82,
      lastActivity: "3 hours ago",
      createdDate: "2024-01-10",
      owner: "David Chen"
    },
    {
      id: "PROD006",
      name: "CRM System",
      description: "Customer relationship management system testing",
      status: "Active",
      testCases: 14,
      testRuns: 1,
      teamMembers: 7,
      coverage: 78,
      lastActivity: "5 hours ago",
      createdDate: "2024-02-01",
      owner: "Lisa Rodriguez"
    }
  ]
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'testCases' | 'testRuns' | 'teamMembers' | 'coverage' | 'lastActivity' | 'createdDate' | 'status'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: `PROD${String(state.products.length + 1).padStart(3, '0')}`,
        testCases: 0,
        testRuns: 0,
        teamMembers: 1,
        coverage: 0,
        lastActivity: "Just now",
        createdDate: new Date().toISOString().split('T')[0],
        status: "Active"
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; updates: Partial<Product> }>) => {
      const { id, updates } = action.payload;
      const index = state.products.findIndex(product => product.id === id);
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...updates,
          lastActivity: updates.status || updates.name || updates.description || updates.owner ? "Just now" : state.products[index].lastActivity
        };
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(product => product.id !== action.payload);
    }
  }
});

export const { addProduct, updateProduct, deleteProduct } = productSlice.actions;
export default productSlice.reducer;
