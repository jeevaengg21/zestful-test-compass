import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@shared/schema';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  users: []
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<{ id: number; updates: Partial<User> }>) => {
      const { id, updates } = action.payload;
      const index = state.users.findIndex(user => user.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates };
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  }
});

export const { setUser, clearUser, setUsers, addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;