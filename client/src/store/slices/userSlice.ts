
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdDate: string;
  status: string;
}

interface UserState {
  users: User[];
}

const initialState: UserState = {
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
  ]
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<Omit<User, 'id' | 'createdDate' | 'status'>>) => {
      const newUser: User = {
        ...action.payload,
        id: `USR${String(state.users.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        status: "Active"
      };
      state.users.push(newUser);
    },
    updateUser: (state, action: PayloadAction<{ id: string; updates: Partial<User> }>) => {
      const { id, updates } = action.payload;
      const index = state.users.findIndex(user => user.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates };
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  }
});

export const { addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;
