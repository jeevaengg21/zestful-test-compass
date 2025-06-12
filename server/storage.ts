import { eq, and, sql, like, or } from "drizzle-orm";
import { db } from "./db";
import { 
  users, products, modules, testCases, testSuites, testPlans, testRuns, 
  testCaseExecutions, defects, testDataSets, testCaseDataMappings,
  type User, type InsertUser, type Product, type InsertProduct,
  type Module, type InsertModule, type TestCase, type InsertTestCase,
  type TestSuite, type InsertTestSuite, type TestPlan, type InsertTestPlan,
  type TestRun, type InsertTestRun, type TestCaseExecution, type InsertTestCaseExecution,
  type Defect, type InsertDefect, type TestDataSet, type InsertTestDataSet,
  type TestCaseDataMapping, type InsertTestCaseDataMapping
} from "@shared/schema";

// Helper function to ensure proper array type for Drizzle ORM
function ensureArray<T>(value: any): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && typeof value.length === 'number') {
    return Array.from(value);
  }
  return [];
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Module methods
  getAllModules(): Promise<Module[]>;
  getModulesByProduct(productId: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<boolean>;
  
  // Test Case methods
  getAllTestCases(options?: {
    page?: number;
    limit?: number;
    productId?: string;
    moduleId?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    search?: string;
  }): Promise<{ testCases: TestCase[]; total: number; page: number; limit: number; totalPages: number }>;
  getTestCasesByProduct(productId: string): Promise<TestCase[]>;
  getTestCasesByModule(moduleId: string): Promise<TestCase[]>;
  getTestCase(id: string): Promise<TestCase | undefined>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  updateTestCase(id: string, updates: Partial<InsertTestCase>): Promise<TestCase | undefined>;
  deleteTestCase(id: string): Promise<boolean>;
  
  // Test Suite methods
  getAllTestSuites(): Promise<TestSuite[]>;
  getTestSuitesByProduct(productId: string): Promise<TestSuite[]>;
  getTestSuitesByModule(moduleId: string): Promise<TestSuite[]>;
  getTestSuite(id: string): Promise<TestSuite | undefined>;
  createTestSuite(testSuite: InsertTestSuite): Promise<TestSuite>;
  updateTestSuite(id: string, updates: Partial<InsertTestSuite>): Promise<TestSuite | undefined>;
  deleteTestSuite(id: string): Promise<boolean>;
  
  // Test Plan methods
  getAllTestPlans(): Promise<TestPlan[]>;
  getTestPlansByProduct(productId: string): Promise<TestPlan[]>;
  getTestPlan(id: string): Promise<TestPlan | undefined>;
  createTestPlan(testPlan: InsertTestPlan): Promise<TestPlan>;
  updateTestPlan(id: string, updates: Partial<InsertTestPlan>): Promise<TestPlan | undefined>;
  deleteTestPlan(id: string): Promise<boolean>;
  
  // Test Run methods
  getAllTestRuns(): Promise<TestRun[]>;
  getTestRunsByPlan(testPlanId: string): Promise<TestRun[]>;
  getTestRun(id: string): Promise<TestRun | undefined>;
  createTestRun(testRun: InsertTestRun): Promise<TestRun>;
  updateTestRun(id: string, updates: Partial<InsertTestRun>): Promise<TestRun | undefined>;
  deleteTestRun(id: string): Promise<boolean>;
  
  // Test Case Execution methods
  getAllTestCaseExecutions(): Promise<TestCaseExecution[]>;
  getTestCaseExecutionsByRun(testRunId: string): Promise<TestCaseExecution[]>;
  getTestCaseExecution(id: string): Promise<TestCaseExecution | undefined>;
  createTestCaseExecution(execution: InsertTestCaseExecution): Promise<TestCaseExecution>;
  updateTestCaseExecution(id: string, updates: Partial<InsertTestCaseExecution>): Promise<TestCaseExecution | undefined>;
  
  // Defect methods
  getAllDefects(): Promise<Defect[]>;
  getDefectsByTestRun(testRunId: string): Promise<Defect[]>;
  getDefect(id: string): Promise<Defect | undefined>;
  createDefect(defect: InsertDefect): Promise<Defect>;
  updateDefect(id: string, updates: Partial<InsertDefect>): Promise<Defect | undefined>;
  
  // Test Data methods
  getAllTestDataSets(): Promise<TestDataSet[]>;
  getTestDataSetsByProduct(productId: string): Promise<TestDataSet[]>;
  getTestDataSetsByModule(moduleId: string): Promise<TestDataSet[]>;
  getTestDataSet(id: string): Promise<TestDataSet | undefined>;
  createTestDataSet(testDataSet: InsertTestDataSet): Promise<TestDataSet>;
  updateTestDataSet(id: string, updates: Partial<InsertTestDataSet>): Promise<TestDataSet | undefined>;
  deleteTestDataSet(id: string): Promise<boolean>;
  
  // Test Case Data Mapping methods
  getAllTestCaseDataMappings(): Promise<TestCaseDataMapping[]>;
  getTestCaseDataMappingsByTestCase(testCaseId: string): Promise<TestCaseDataMapping[]>;
  createTestCaseDataMapping(mapping: InsertTestCaseDataMapping): Promise<TestCaseDataMapping>;
  deleteTestCaseDataMapping(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const userWithDefaults = {
      ...user,
      roles: user.roles ? ensureArray<string>(user.roles) : []
    };
    const result = await db.insert(users).values(userWithDefaults).returning();
    return result[0];
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Module methods
  async getAllModules(): Promise<Module[]> {
    return await db.select().from(modules);
  }

  async getModulesByProduct(productId: string): Promise<Module[]> {
    return await db.select().from(modules).where(eq(modules.productId, productId));
  }

  async getModule(id: string): Promise<Module | undefined> {
    const result = await db.select().from(modules).where(eq(modules.id, id));
    return result[0];
  }

  async createModule(module: InsertModule): Promise<Module> {
    const newModule = { 
      ...module, 
      developers: module.developers ? ensureArray<string>(module.developers) : [],
      testers: module.testers ? ensureArray<string>(module.testers) : []
    };
    const result = await db.insert(modules).values(newModule).returning();
    return result[0];
  }

  async updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined> {
    const cleanUpdates = { ...updates };
    if ('developers' in cleanUpdates && cleanUpdates.developers !== undefined) {
      cleanUpdates.developers = ensureArray<string>(cleanUpdates.developers);
    }
    if ('testers' in cleanUpdates && cleanUpdates.testers !== undefined) {
      cleanUpdates.testers = ensureArray<string>(cleanUpdates.testers);
    }
    const result = await db.update(modules).set(cleanUpdates).where(eq(modules.id, id)).returning();
    return result[0];
  }

  async deleteModule(id: string): Promise<boolean> {
    const result = await db.delete(modules).where(eq(modules.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test Case methods with pagination and filtering
  async getAllTestCases(options?: {
    page?: number;
    limit?: number;
    productId?: string;
    moduleId?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    search?: string;
  }): Promise<{ testCases: TestCase[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const { 
        page = 1, 
        limit = 50, 
        productId, 
        moduleId, 
        status, 
        priority, 
        assignee,
        search 
      } = options || {};

      // For now, get all test cases and filter/paginate in memory
      // This will be replaced with proper SQL queries once UUID migration is complete
      let allTestCases = await db.select().from(testCases);
      
      // Apply filters
      if (productId) {
        allTestCases = allTestCases.filter(tc => tc.productId === productId);
      }
      if (moduleId) {
        allTestCases = allTestCases.filter(tc => tc.moduleId === moduleId);
      }
      if (status) {
        allTestCases = allTestCases.filter(tc => tc.status === status);
      }
      if (priority) {
        allTestCases = allTestCases.filter(tc => tc.priority === priority);
      }
      if (assignee) {
        allTestCases = allTestCases.filter(tc => tc.assignee === assignee);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        allTestCases = allTestCases.filter(tc => 
          tc.title.toLowerCase().includes(searchLower) || 
          tc.description.toLowerCase().includes(searchLower)
        );
      }

      const total = allTestCases.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedTestCases = allTestCases.slice(offset, offset + limit);

      return {
        testCases: paginatedTestCases,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error in getAllTestCases:', error);
      return {
        testCases: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }
  }

  async getTestCasesByProduct(productId: string): Promise<TestCase[]> {
    return await db.select().from(testCases).where(eq(testCases.productId, productId));
  }

  async getTestCasesByModule(moduleId: string): Promise<TestCase[]> {
    return await db.select().from(testCases).where(eq(testCases.moduleId, moduleId));
  }

  async getTestCase(id: string): Promise<TestCase | undefined> {
    const result = await db.select().from(testCases).where(eq(testCases.id, id));
    return result[0];
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    // Generate UUID-based ID with TC prefix for test case identification
    const id = `TC_${crypto.randomUUID()}`;
    
    const newTestCase = { 
      ...testCase, 
      id,
      steps: testCase.steps ? ensureArray<string>(testCase.steps) : []
    };
    const result = await db.insert(testCases).values(newTestCase).returning();
    return result[0];
  }

  async updateTestCase(id: string, updates: Partial<InsertTestCase>): Promise<TestCase | undefined> {
    const cleanUpdates = { ...updates };
    if ('steps' in cleanUpdates && cleanUpdates.steps !== undefined) {
      cleanUpdates.steps = Array.isArray(cleanUpdates.steps) ? cleanUpdates.steps : [];
    }
    const result = await db.update(testCases).set(cleanUpdates).where(eq(testCases.id, id)).returning();
    return result[0];
  }

  async deleteTestCase(id: string): Promise<boolean> {
    const result = await db.delete(testCases).where(eq(testCases.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test Suite methods
  async getAllTestSuites(): Promise<TestSuite[]> {
    return await db.select().from(testSuites);
  }

  async getTestSuitesByProduct(productId: string): Promise<TestSuite[]> {
    return await db.select().from(testSuites).where(eq(testSuites.productId, productId));
  }

  async getTestSuitesByModule(moduleId: string): Promise<TestSuite[]> {
    return await db.select().from(testSuites).where(eq(testSuites.moduleId, moduleId));
  }

  async getTestSuite(id: string): Promise<TestSuite | undefined> {
    const result = await db.select().from(testSuites).where(eq(testSuites.id, id));
    return result[0];
  }

  async createTestSuite(testSuite: InsertTestSuite): Promise<TestSuite> {
    const id = `TS_${crypto.randomUUID()}`;
    const newTestSuite = { 
      ...testSuite, 
      id,
      testCaseIds: Array.isArray(testSuite.testCaseIds) ? testSuite.testCaseIds : []
    };
    const result = await db.insert(testSuites).values(newTestSuite).returning();
    return result[0];
  }

  async updateTestSuite(id: string, updates: Partial<InsertTestSuite>): Promise<TestSuite | undefined> {
    // Handle array fields properly to ensure proper type compatibility
    const cleanUpdates = { ...updates };
    if ('testCaseIds' in cleanUpdates && cleanUpdates.testCaseIds) {
      cleanUpdates.testCaseIds = Array.isArray(cleanUpdates.testCaseIds) ? cleanUpdates.testCaseIds : [];
    }
    const result = await db.update(testSuites).set(cleanUpdates).where(eq(testSuites.id, id)).returning();
    return result[0];
  }

  async deleteTestSuite(id: string): Promise<boolean> {
    const result = await db.delete(testSuites).where(eq(testSuites.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test Plan methods
  async getAllTestPlans(): Promise<TestPlan[]> {
    return await db.select().from(testPlans);
  }

  async getTestPlansByProduct(productId: string): Promise<TestPlan[]> {
    return await db.select().from(testPlans).where(eq(testPlans.productId, productId));
  }

  async getTestPlan(id: string): Promise<TestPlan | undefined> {
    const result = await db.select().from(testPlans).where(eq(testPlans.id, id));
    return result[0];
  }

  async createTestPlan(testPlan: InsertTestPlan): Promise<TestPlan> {
    const id = `TP_${crypto.randomUUID()}`;
    const newTestPlan = { ...testPlan, id };
    const result = await db.insert(testPlans).values(newTestPlan).returning();
    return result[0];
  }

  async updateTestPlan(id: string, updates: Partial<InsertTestPlan>): Promise<TestPlan | undefined> {
    // Handle array fields properly to ensure proper type compatibility
    const cleanUpdates = { ...updates };
    if ('testSuiteIds' in cleanUpdates && cleanUpdates.testSuiteIds) {
      cleanUpdates.testSuiteIds = Array.isArray(cleanUpdates.testSuiteIds) ? cleanUpdates.testSuiteIds : [];
    }
    const result = await db.update(testPlans).set(cleanUpdates).where(eq(testPlans.id, id)).returning();
    return result[0];
  }

  async deleteTestPlan(id: string): Promise<boolean> {
    const result = await db.delete(testPlans).where(eq(testPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Test Run methods
  async getAllTestRuns(): Promise<TestRun[]> {
    return await db.select().from(testRuns);
  }

  async getTestRunsByPlan(testPlanId: string): Promise<TestRun[]> {
    return await db.select().from(testRuns).where(eq(testRuns.testPlanId, testPlanId));
  }

  async getTestRun(id: string): Promise<TestRun | undefined> {
    const result = await db.select().from(testRuns).where(eq(testRuns.id, id));
    return result[0];
  }

  async createTestRun(testRun: InsertTestRun): Promise<TestRun> {
    const id = `TR_${crypto.randomUUID()}`;
    const newTestRun = { ...testRun, id };
    const result = await db.insert(testRuns).values(newTestRun).returning();
    return result[0];
  }

  async updateTestRun(id: string, updates: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const result = await db.update(testRuns).set(updates).where(eq(testRuns.id, id)).returning();
    return result[0];
  }

  async deleteTestRun(id: string): Promise<boolean> {
    const result = await db.delete(testRuns).where(eq(testRuns.id, id));
    return result.rowCount > 0;
  }

  // Test Case Execution methods
  async getAllTestCaseExecutions(): Promise<TestCaseExecution[]> {
    return await db.select().from(testCaseExecutions);
  }

  async getTestCaseExecutionsByRun(testRunId: string): Promise<TestCaseExecution[]> {
    return await db.select().from(testCaseExecutions).where(eq(testCaseExecutions.testRunId, testRunId));
  }

  async getTestCaseExecution(id: string): Promise<TestCaseExecution | undefined> {
    const result = await db.select().from(testCaseExecutions).where(eq(testCaseExecutions.id, id));
    return result[0];
  }

  async createTestCaseExecution(execution: InsertTestCaseExecution): Promise<TestCaseExecution> {
    const id = `TCE_${crypto.randomUUID()}`;
    const newExecution = { ...execution, id };
    const result = await db.insert(testCaseExecutions).values([newExecution]).returning();
    return result[0];
  }

  async updateTestCaseExecution(id: string, updates: Partial<InsertTestCaseExecution>): Promise<TestCaseExecution | undefined> {
    const result = await db.update(testCaseExecutions).set(updates).where(eq(testCaseExecutions.id, id)).returning();
    return result[0];
  }

  // Defect methods
  async getAllDefects(): Promise<Defect[]> {
    return await db.select().from(defects);
  }

  async getDefectsByTestRun(testRunId: string): Promise<Defect[]> {
    return await db.select().from(defects).where(eq(defects.testRunId, testRunId));
  }

  async getDefect(id: string): Promise<Defect | undefined> {
    const result = await db.select().from(defects).where(eq(defects.id, id));
    return result[0];
  }

  async createDefect(defect: InsertDefect): Promise<Defect> {
    const id = `DEF_${crypto.randomUUID()}`;
    const newDefect = { ...defect, id };
    const result = await db.insert(defects).values([newDefect]).returning();
    return result[0];
  }

  async updateDefect(id: string, updates: Partial<InsertDefect>): Promise<Defect | undefined> {
    const result = await db.update(defects).set(updates).where(eq(defects.id, id)).returning();
    return result[0];
  }

  // Test Data methods
  async getAllTestDataSets(): Promise<TestDataSet[]> {
    return await db.select().from(testDataSets);
  }

  async getTestDataSetsByProduct(productId: string): Promise<TestDataSet[]> {
    return await db.select().from(testDataSets).where(eq(testDataSets.productId, productId));
  }

  async getTestDataSetsByModule(moduleId: string): Promise<TestDataSet[]> {
    return await db.select().from(testDataSets).where(eq(testDataSets.moduleId, moduleId));
  }

  async getTestDataSet(id: string): Promise<TestDataSet | undefined> {
    const result = await db.select().from(testDataSets).where(eq(testDataSets.id, id));
    return result[0];
  }

  async createTestDataSet(testDataSet: InsertTestDataSet): Promise<TestDataSet> {
    const id = `TDS_${crypto.randomUUID()}`;
    const newTestDataSet = { ...testDataSet, id };
    const result = await db.insert(testDataSets).values([newTestDataSet]).returning();
    return result[0];
  }

  async updateTestDataSet(id: string, updates: Partial<InsertTestDataSet>): Promise<TestDataSet | undefined> {
    const result = await db.update(testDataSets).set(updates).where(eq(testDataSets.id, id)).returning();
    return result[0];
  }

  async deleteTestDataSet(id: string): Promise<boolean> {
    const result = await db.delete(testDataSets).where(eq(testDataSets.id, id));
    return result.rowCount > 0;
  }

  // Test Case Data Mapping methods
  async getAllTestCaseDataMappings(): Promise<TestCaseDataMapping[]> {
    return await db.select().from(testCaseDataMappings);
  }

  async getTestCaseDataMappingsByTestCase(testCaseId: string): Promise<TestCaseDataMapping[]> {
    return await db.select().from(testCaseDataMappings).where(eq(testCaseDataMappings.testCaseId, testCaseId));
  }

  async createTestCaseDataMapping(mapping: InsertTestCaseDataMapping): Promise<TestCaseDataMapping> {
    const result = await db.insert(testCaseDataMappings).values(mapping).returning();
    return result[0];
  }

  async deleteTestCaseDataMapping(id: string): Promise<boolean> {
    const result = await db.delete(testCaseDataMappings).where(eq(testCaseDataMappings.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
