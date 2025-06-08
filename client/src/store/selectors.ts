
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
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectIsAuthenticated = (state: RootState) => state.users.isAuthenticated;

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
    if (!suite || !suite.testCaseIds) return [];
    return testCases.filter(tc => suite.testCaseIds!.includes(tc.id));
  }
);

// Test Plan selectors
export const selectAllTestPlans = (state: RootState) => state.testPlans.testPlans;

// Test Run selectors
export const selectAllTestRuns = (state: RootState) => state.testRuns.testRuns;

// Test Data selectors
export const selectAllTestDataSets = (state: RootState) => state.testData.testDataSets;
export const selectAllTestCaseDataMappings = (state: RootState) => state.testData.testCaseDataMappings;

export const selectTestDataSetsByProduct = createSelector(
  [selectAllTestDataSets, (state: RootState, productId: string) => productId],
  (testDataSets, productId) => testDataSets.filter(set => set.productId === productId)
);

export const selectTestDataSetsByModule = createSelector(
  [selectAllTestDataSets, (state: RootState, moduleId: string) => moduleId],
  (testDataSets, moduleId) => testDataSets.filter(set => set.moduleId === moduleId)
);

export const selectTestDataSetById = (state: RootState, id: string) =>
  state.testData.testDataSets.find(set => set.id === id);

export const selectTestDataSetsForTestCase = createSelector(
  [selectAllTestDataSets, selectAllTestCaseDataMappings, (state: RootState, testCaseId: string) => testCaseId],
  (testDataSets, mappings, testCaseId) => {
    const testCaseMappings = mappings.filter(mapping => mapping.testCaseId === testCaseId);
    return testDataSets.filter(set => 
      testCaseMappings.some(mapping => mapping.testDataSetId === set.id)
    );
  }
);

export const selectTestCasesUsingTestDataSet = createSelector(
  [selectAllTestCases, selectAllTestCaseDataMappings, (state: RootState, testDataSetId: string) => testDataSetId],
  (testCases, mappings, testDataSetId) => {
    const relevantMappings = mappings.filter(mapping => mapping.testDataSetId === testDataSetId);
    return testCases.filter(testCase => 
      relevantMappings.some(mapping => mapping.testCaseId === testCase.id)
    );
  }
);
