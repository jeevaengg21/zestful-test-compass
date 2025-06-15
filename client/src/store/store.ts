
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import moduleReducer from './slices/moduleSlice';
import userReducer from './slices/userSlice';
import testReducer from './slices/testSlice';
import testPlanReducer from './slices/testPlanSlice';
import testRunReducer from './slices/testRunSlice';
import testDataReducer from './slices/testDataSlice';
import lookupReducer from './slices/lookupSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    modules: moduleReducer,
    users: userReducer,
    tests: testReducer,
    testPlans: testPlanReducer,
    testRuns: testRunReducer,
    testData: testDataReducer,
    lookup: lookupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
