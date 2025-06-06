
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
    // E-Commerce Platform modules
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
      name: "Shopping Cart",
      description: "Shopping cart functionality and checkout process",
      moduleOwner: "John Doe",
      manager: "Jane Smith",
      developers: ["Tom Davis", "Lisa Garcia"],
      testers: ["Mark Anderson"],
      createdDate: "2023-11-05",
      status: "Active",
      productId: "PROD001"
    },
    {
      id: "MOD003",
      name: "Product Catalog",
      description: "Product browsing, search, and filtering functionality",
      moduleOwner: "John Doe",
      manager: "Jane Smith",
      developers: ["Alice Johnson", "Tom Davis"],
      testers: ["Carol Brown", "Mark Anderson"],
      createdDate: "2023-11-08",
      status: "Testing",
      productId: "PROD001"
    },
    // Mobile Application modules
    {
      id: "MOD004",
      name: "Mobile UI Components",
      description: "Core UI components for mobile application",
      moduleOwner: "Jane Smith",
      manager: "Sarah Wilson",
      developers: ["Bob Wilson", "Lisa Garcia"],
      testers: ["David Lee"],
      createdDate: "2023-11-20",
      status: "Active",
      productId: "PROD002"
    },
    {
      id: "MOD005",
      name: "Push Notifications",
      description: "Mobile push notification system",
      moduleOwner: "Jane Smith",
      manager: "Sarah Wilson",
      developers: ["Tom Davis"],
      testers: ["Carol Brown", "Mark Anderson"],
      createdDate: "2023-11-25",
      status: "In Development",
      productId: "PROD002"
    },
    {
      id: "MOD006",
      name: "Offline Sync",
      description: "Offline data synchronization for mobile app",
      moduleOwner: "Jane Smith",
      manager: "Sarah Wilson",
      developers: ["Alice Johnson", "Bob Wilson"],
      testers: ["David Lee"],
      createdDate: "2023-12-01",
      status: "Testing",
      productId: "PROD002"
    },
    // Backend Services modules
    {
      id: "MOD007",
      name: "API Gateway",
      description: "Central API gateway and routing",
      moduleOwner: "Mike Johnson",
      manager: "David Chen",
      developers: ["Tom Davis", "Lisa Garcia"],
      testers: ["Mark Anderson"],
      createdDate: "2023-09-15",
      status: "Active",
      productId: "PROD003"
    },
    {
      id: "MOD008",
      name: "User Service",
      description: "User management microservice",
      moduleOwner: "Mike Johnson",
      manager: "David Chen",
      developers: ["Alice Johnson"],
      testers: ["Carol Brown"],
      createdDate: "2023-09-20",
      status: "On Hold",
      productId: "PROD003"
    },
    {
      id: "MOD009",
      name: "Order Service",
      description: "Order processing microservice",
      moduleOwner: "Mike Johnson",
      manager: "David Chen",
      developers: ["Bob Wilson", "Tom Davis"],
      testers: ["David Lee", "Mark Anderson"],
      createdDate: "2023-09-25",
      status: "Completed",
      productId: "PROD003"
    },
    // Payment Gateway modules
    {
      id: "MOD010",
      name: "Payment Processing",
      description: "Core payment processing engine",
      moduleOwner: "Sarah Wilson",
      manager: "Lisa Rodriguez",
      developers: ["Lisa Garcia"],
      testers: ["Carol Brown"],
      createdDate: "2023-08-10",
      status: "Completed",
      productId: "PROD004"
    },
    {
      id: "MOD011",
      name: "Fraud Detection",
      description: "Real-time fraud detection and prevention",
      moduleOwner: "Sarah Wilson",
      manager: "Lisa Rodriguez",
      developers: ["Alice Johnson", "Tom Davis"],
      testers: ["David Lee"],
      createdDate: "2023-08-15",
      status: "Completed",
      productId: "PROD004"
    },
    {
      id: "MOD012",
      name: "Payment Analytics",
      description: "Payment transaction analytics and reporting",
      moduleOwner: "Sarah Wilson",
      manager: "Lisa Rodriguez",
      developers: ["Bob Wilson"],
      testers: ["Mark Anderson"],
      createdDate: "2023-08-20",
      status: "Completed",
      productId: "PROD004"
    },
    // Analytics Dashboard modules
    {
      id: "MOD013",
      name: "Data Visualization",
      description: "Charts and graphs for business metrics",
      moduleOwner: "David Chen",
      manager: "John Doe",
      developers: ["Lisa Garcia", "Tom Davis"],
      testers: ["Carol Brown", "David Lee"],
      createdDate: "2024-01-15",
      status: "Active",
      productId: "PROD005"
    },
    {
      id: "MOD014",
      name: "Report Generation",
      description: "Automated report generation system",
      moduleOwner: "David Chen",
      manager: "John Doe",
      developers: ["Alice Johnson"],
      testers: ["Mark Anderson"],
      createdDate: "2024-01-20",
      status: "In Development",
      productId: "PROD005"
    },
    {
      id: "MOD015",
      name: "Data Export",
      description: "Data export functionality for external systems",
      moduleOwner: "David Chen",
      manager: "John Doe",
      developers: ["Bob Wilson", "Lisa Garcia"],
      testers: ["Carol Brown"],
      createdDate: "2024-01-25",
      status: "Testing",
      productId: "PROD005"
    },
    // CRM System modules
    {
      id: "MOD016",
      name: "Customer Management",
      description: "Customer profile and contact management",
      moduleOwner: "Lisa Rodriguez",
      manager: "Mike Johnson",
      developers: ["Tom Davis", "Alice Johnson"],
      testers: ["David Lee", "Mark Anderson"],
      createdDate: "2024-02-05",
      status: "Active",
      productId: "PROD006"
    },
    {
      id: "MOD017",
      name: "Sales Pipeline",
      description: "Sales opportunity tracking and pipeline management",
      moduleOwner: "Lisa Rodriguez",
      manager: "Mike Johnson",
      developers: ["Bob Wilson"],
      testers: ["Carol Brown"],
      createdDate: "2024-02-10",
      status: "In Development",
      productId: "PROD006"
    },
    {
      id: "MOD018",
      name: "Communication Hub",
      description: "Email and SMS communication management",
      moduleOwner: "Lisa Rodriguez",
      manager: "Mike Johnson",
      developers: ["Lisa Garcia", "Tom Davis"],
      testers: ["David Lee"],
      createdDate: "2024-02-15",
      status: "Testing",
      productId: "PROD006"
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
