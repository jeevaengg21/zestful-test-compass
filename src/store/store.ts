
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import moduleReducer from './slices/moduleSlice';
import userReducer from './slices/userSlice';
import testReducer from './slices/testSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    modules: moduleReducer,
    users: userReducer,
    tests: testReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
