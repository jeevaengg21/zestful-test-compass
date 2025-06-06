
import { create } from 'zustand';

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

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'testCases' | 'testRuns' | 'teamMembers' | 'coverage' | 'lastActivity' | 'createdDate' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [
    {
      id: "PROD001",
      name: "E-Commerce Platform",
      description: "Main e-commerce website testing product including web and mobile interfaces",
      status: "Active",
      testCases: 347,
      testRuns: 12,
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
      testCases: 156,
      testRuns: 6,
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
      testCases: 234,
      testRuns: 3,
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
      testCases: 89,
      testRuns: 8,
      teamMembers: 3,
      coverage: 95,
      lastActivity: "2 weeks ago",
      createdDate: "2023-08-05",
      owner: "Sarah Wilson"
    }
  ],
  addProduct: (productData) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...productData,
          id: `PROD${String(state.products.length + 1).padStart(3, '0')}`,
          testCases: 0,
          testRuns: 0,
          teamMembers: 1,
          coverage: 0,
          lastActivity: "Just now",
          createdDate: new Date().toISOString().split('T')[0],
          status: "Active" as const
        }
      ]
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id 
          ? { 
              ...product, 
              ...updates, 
              lastActivity: updates.status || updates.name || updates.description || updates.owner ? "Just now" : product.lastActivity 
            } 
          : product
      )
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id)
    }))
}));
