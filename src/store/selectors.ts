
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

// Product selectors
export const selectAllProducts = (state: RootState) => state.products.products;

// Module selectors
export const selectAllModules = (state: RootState) => state.modules.modules;
export const selectModulesByProduct = createSelector(
  [selectAllModules, (state: RootState, productId: string) => productId],
  (modules, productId) => modules.filter(module => module.productId === productId)
);

// User selectors
export const selectAllUsers = (state: RootState) => state.users.users;

// Test selectors
export const selectAllTestCases = (state: RootState) => state.tests.testCases;
export const selectAllTestSuites = (state: RootState) => state.tests.testSuites;

export const selectTestCasesByProduct = createSelector(
  [selectAllTestCases, (state: RootState, productId: string) => productId],
  (testCases, productId) => testCases.filter(testCase => testCase.productId === productId)
);

export const selectTestCasesByModule = createSelector(
  [selectAllTestCases, (state: RootState, moduleId: string) => moduleId],
  (testCases, moduleId) => testCases.filter(testCase => testCase.moduleId === moduleId)
);

export const selectTestSuitesByProduct = createSelector(
  [selectAllTestSuites, (state: RootState, productId: string) => productId],
  (testSuites, productId) => testSuites.filter(testSuite => testSuite.productId === productId)
);

export const selectTestSuitesByModule = createSelector(
  [selectAllTestSuites, (state: RootState, moduleId: string) => moduleId],
  (testSuites, moduleId) => testSuites.filter(testSuite => testSuite.moduleId === moduleId)
);

export const selectTestCasesInSuite = createSelector(
  [selectAllTestCases, selectAllTestSuites, (state: RootState, suiteId: string) => suiteId],
  (testCases, testSuites, suiteId) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return [];
    return testCases.filter(tc => suite.testCaseIds.includes(tc.id));
  }
);
