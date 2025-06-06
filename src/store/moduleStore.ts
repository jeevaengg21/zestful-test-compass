
import { create } from 'zustand';

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

interface ModuleStore {
  modules: Module[];
  addModule: (module: Omit<Module, 'id' | 'createdDate' | 'status'>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  getModulesByProduct: (productId: string) => Module[];
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
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
  ],
  addModule: (moduleData) =>
    set((state) => ({
      modules: [
        ...state.modules,
        {
          ...moduleData,
          id: `MOD${String(state.modules.length + 1).padStart(3, '0')}`,
          createdDate: new Date().toISOString().split('T')[0],
          status: "Active" as const
        }
      ]
    })),
  updateModule: (id, updates) =>
    set((state) => ({
      modules: state.modules.map((module) =>
        module.id === id ? { ...module, ...updates } : module
      )
    })),
  deleteModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((module) => module.id !== id)
    })),
  getModulesByProduct: (productId) => {
    return get().modules.filter((module) => module.productId === productId);
  }
}));
