import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Module } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface ModuleState {
  modules: Module[];
  loading: boolean;
  error: string | null;
}

const initialState: ModuleState = {
  modules: [],
  loading: false,
  error: null
};

// Async thunk to fetch modules from API
export const fetchModules = createAsyncThunk(
  'modules/fetchModules',
  async () => {
    const response = await apiRequest('/api/modules');
    return response as Module[];
  }
);

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload;
    },
    addModule: (state, action: PayloadAction<Module>) => {
      state.modules.push(action.payload);
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch modules';
      });
  }
});

export const { setModules, addModule, updateModule, deleteModule } = moduleSlice.actions;
export default moduleSlice.reducer;