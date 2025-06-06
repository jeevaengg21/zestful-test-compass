
import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdDate: string;
  status: string;
}

interface UserStore {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdDate' | 'status'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [
    {
      id: "USR001",
      email: "john.doe@company.com",
      fullName: "John Doe",
      roles: ["admin", "manager"],
      createdDate: "2023-11-01",
      status: "Active"
    },
    {
      id: "USR002",
      email: "jane.smith@company.com",
      fullName: "Jane Smith",
      roles: ["manager"],
      createdDate: "2023-11-02",
      status: "Active"
    },
    {
      id: "USR003",
      email: "alice.johnson@company.com",
      fullName: "Alice Johnson",
      roles: ["developer"],
      createdDate: "2023-11-03",
      status: "Active"
    },
    {
      id: "USR004",
      email: "bob.wilson@company.com",
      fullName: "Bob Wilson",
      roles: ["tester"],
      createdDate: "2023-11-04",
      status: "Inactive"
    }
  ],
  addUser: (userData) =>
    set((state) => ({
      users: [
        ...state.users,
        {
          ...userData,
          id: `USR${String(state.users.length + 1).padStart(3, '0')}`,
          createdDate: new Date().toISOString().split('T')[0],
          status: "Active"
        }
      ]
    })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      )
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id)
    }))
}));
