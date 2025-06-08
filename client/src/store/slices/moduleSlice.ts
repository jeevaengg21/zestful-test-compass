import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Module } from '@shared/schema';

interface ModuleState {
  modules: Module[];
}

const initialState: ModuleState = {
  modules: []
};

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
        state.modules[index] = {
          ...state.modules[index],
          ...updates
        };
      }
    },
    deleteModule: (state, action: PayloadAction<string>) => {
      state.modules = state.modules.filter(module => module.id !== action.payload);
    }
  }
});

export const { setModules, addModule, updateModule, deleteModule } = moduleSlice.actions;
export default moduleSlice.reducer;