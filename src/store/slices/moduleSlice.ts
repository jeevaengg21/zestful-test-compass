
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Module {
  id: string;
  name: string;
  description: string;
  moduleOwner: string;
  manager: string;
  developers: string[];
  testers: string[];
  createdDate: string;
  status: 'Active' | 'In Development' | 'Testing' | 'Completed' | 'On Hold';
  productId: string;
}

interface ModuleState {
  modules: Module[];
}

const initialState: ModuleState = {
  modules: [
    {
      id: "MOD001",
      name: "User Authentication",
      description: "Login, registration, and password management functionality",
      moduleOwner: "John Doe",
      manager: "Jane Smith",
      developers: ["Alice Johnson", "Bob Wilson"],
      testers: ["Carol Brown", "David Lee"],
      createdDate: "2023-11-01",
      status: "Active",
      productId: "PROD001"
    },
    {
      id: "MOD002",
      name: "Payment Processing",
      description: "Payment gateway integration and transaction handling",
      moduleOwner: "Mike Johnson",
      manager: "Sarah Wilson",
      developers: ["Tom Davis", "Lisa Garcia"],
      testers: ["Mark Anderson"],
      createdDate: "2023-11-05",
      status: "In Development",
      productId: "PROD001"
    },
    {
      id: "MOD003",
      name: "API Testing",
      description: "Backend services and API endpoint testing",
      moduleOwner: "Mike Johnson",
      manager: "Sarah Wilson",
      developers: ["Tom Davis"],
      testers: ["Mark Anderson", "Lisa Garcia"],
      createdDate: "2023-11-10",
      status: "Testing",
      productId: "PROD003"
    }
  ]
};

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    addModule: (state, action: PayloadAction<Omit<Module, 'id' | 'createdDate' | 'status'>>) => {
      const newModule: Module = {
        ...action.payload,
        id: `MOD${String(state.modules.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        status: "Active"
      };
      state.modules.push(newModule);
    },
    updateModule: (state, action: PayloadAction<{ id: string; updates: Partial<Module> }>) => {
      const { id, updates } = action.payload;
      const index = state.modules.findIndex(module => module.id === id);
      if (index !== -1) {
        state.modules[index] = { ...state.modules[index], ...updates };
      }
    },
    deleteModule: (state, action: PayloadAction<string>) => {
      state.modules = state.modules.filter(module => module.id !== action.payload);
    }
  }
});

export const { addModule, updateModule, deleteModule } = moduleSlice.actions;
export default moduleSlice.reducer;
