
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
export const selectAllUsers = (state: RootState) => state.users.users || [];
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
export const selectTestRunById = (state: RootState, id: string) => 
  state.testRuns.testRuns.find(run => run.id === id);
export const selectAllTestCaseExecutions = (state: RootState) => state.testRuns.testCaseExecutions;
export const selectTestCaseExecutionsByRun = (state: RootState, testRunId: string) =>
  state.testRuns.testCaseExecutions.filter(execution => execution.testRunId === testRunId);
export const selectAllDefects = (state: RootState) => state.testRuns.defects;
export const selectDefectsByTestRun = (state: RootState, testRunId: string) =>
  state.testRuns.defects.filter(defect => defect.testRunId === testRunId);

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

// Lookup selectors
export const selectAllPriorities = (state: RootState) => state.lookup.priorities;
export const selectAllStatuses = (state: RootState) => state.lookup.statuses;
export const selectLookupLoading = (state: RootState) => state.lookup.loading;
export const selectLookupErrors = (state: RootState) => state.lookup.error;
export const selectLookupLastFetched = (state: RootState) => state.lookup.lastFetched;

export const selectPriorityById = createSelector(
  [selectAllPriorities, (state: RootState, id: string) => id],
  (priorities, id) => priorities.find(priority => priority.id === id)
);

export const selectStatusById = createSelector(
  [selectAllStatuses, (state: RootState, id: string) => id],
  (statuses, id) => statuses.find(status => status.id === id)
);

export const selectStatusesByCategory = createSelector(
  [selectAllStatuses, (state: RootState, category: string) => category],
  (statuses, category) => statuses.filter(status => status.category === category)
);

export const selectPrioritiesSorted = createSelector(
  [selectAllPriorities],
  (priorities) => [...priorities].sort((a, b) => a.level - b.level)
);

export const selectStatusesSorted = createSelector(
  [selectAllStatuses],
  (statuses) => [...statuses].sort((a, b) => a.name.localeCompare(b.name))
);
