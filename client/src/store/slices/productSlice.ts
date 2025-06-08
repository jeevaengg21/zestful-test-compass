
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@shared/schema';

interface ProductState {
  products: Product[];
}

const initialState: ProductState = {
  products: []
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
