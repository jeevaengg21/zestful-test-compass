import { eq, and, sql, like, or } from "drizzle-orm";
import { db } from "./db";
import { 
  tenants, users, products, modules, priorities, statuses, testCases, testSuites, testPlans, testRuns, 
  testCaseExecutions, defects, testDataSets, testCaseDataMappings,
  type Tenant, type InsertTenant, type User, type InsertUser, type Product, type InsertProduct,
  type Module, type InsertModule, type Priority, type InsertPriority, type Status, type InsertStatus,
  type TestCase, type InsertTestCase, type TestSuite, type InsertTestSuite, type TestPlan, type InsertTestPlan,
  type TestRun, type InsertTestRun, type TestCaseExecution, type InsertTestCaseExecution,
  type Defect, type InsertDefect, type TestDataSet, type InsertTestDataSet,
  type TestCaseDataMapping, type InsertTestCaseDataMapping
} from "@shared/schema";

// Helper function to ensure proper array type for Drizzle ORM
function ensureArray<T>(value: any): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'object' && typeof value.length === 'number') {
    // Use spread operator to create a proper array from array-like objects
    return [...Array.from(value)] as T[];
  }
  if (value != null && value !== undefined) {
    return [value] as T[];
  }
  return [];
}

// Helper function to clean objects for Drizzle updates by properly handling array fields
function cleanObjectForDrizzle(obj: any, arrayFields: string[] = []): any {
  const cleaned = { ...obj };
  arrayFields.forEach(field => {
    if (field in cleaned && cleaned[field] !== undefined) {
      cleaned[field] = ensureArray(cleaned[field]);
    }
  });
  return cleaned;
}

export interface IStorage {
  // Tenant methods
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Priority methods (global lookup data)
  getAllPriorities(): Promise<Priority[]>;
  getPriority(id: string): Promise<Priority | undefined>;
  createPriority(priority: InsertPriority): Promise<Priority>;
  updatePriority(id: string, updates: Partial<InsertPriority>): Promise<Priority | undefined>;
  
  // Status methods (global lookup data)
  getAllStatuses(): Promise<Status[]>;
  getStatusesByCategory(category: string): Promise<Status[]>;
  getStatus(id: string): Promise<Status | undefined>;
  createStatus(status: InsertStatus): Promise<Status>;
  updateStatus(id: string, updates: Partial<InsertStatus>): Promise<Status | undefined>;
  
  // Product methods (tenant-aware)
  getAllProducts(tenantId: string): Promise<Product[]>;
  getProduct(id: string, tenantId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct, tenantId: string): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>, tenantId: string): Promise<Product | undefined>;
  deleteProduct(id: string, tenantId: string): Promise<boolean>;
  
  // Module methods (tenant-aware)
  getAllModules(tenantId: string): Promise<Module[]>;
  getModulesByProduct(productId: string, tenantId: string): Promise<Module[]>;
  getModule(id: string, tenantId: string): Promise<Module | undefined>;
  createModule(module: InsertModule, tenantId: string): Promise<Module>;
  updateModule(id: string, updates: Partial<InsertModule>, tenantId: string): Promise<Module | undefined>;
  deleteModule(id: string, tenantId: string): Promise<boolean>;
  
  // Test Case methods (tenant-aware)
  getAllTestCases(tenantId: string, options?: {
    page?: number;
    limit?: number;
    productId?: string;
    moduleId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<{ testCases: TestCase[]; total: number; page: number; limit: number; totalPages: number }>;
  getTestCasesByProduct(productId: string, tenantId: string): Promise<TestCase[]>;
  getTestCasesByModule(moduleId: string, tenantId: string): Promise<TestCase[]>;
  getTestCase(id: string, tenantId: string): Promise<TestCase | undefined>;
  createTestCase(testCase: InsertTestCase, tenantId: string): Promise<TestCase>;
  updateTestCase(id: string, updates: Partial<InsertTestCase>, tenantId: string): Promise<TestCase | undefined>;
  deleteTestCase(id: string, tenantId: string): Promise<boolean>;
  
  // Test Suite methods (tenant-aware)
  getAllTestSuites(tenantId: string): Promise<TestSuite[]>;
  getTestSuitesByProduct(productId: string, tenantId: string): Promise<TestSuite[]>;
  getTestSuitesByModule(moduleId: string, tenantId: string): Promise<TestSuite[]>;
  getTestSuite(id: string, tenantId: string): Promise<TestSuite | undefined>;
  createTestSuite(testSuite: InsertTestSuite, tenantId: string): Promise<TestSuite>;
  updateTestSuite(id: string, updates: Partial<InsertTestSuite>, tenantId: string): Promise<TestSuite | undefined>;
  deleteTestSuite(id: string, tenantId: string): Promise<boolean>;
  
  // Test Plan methods (tenant-aware)
  getAllTestPlans(tenantId: string): Promise<TestPlan[]>;
  getTestPlansByProduct(productId: string, tenantId: string): Promise<TestPlan[]>;
  getTestPlan(id: string, tenantId: string): Promise<TestPlan | undefined>;
  createTestPlan(testPlan: InsertTestPlan, tenantId: string): Promise<TestPlan>;
  updateTestPlan(id: string, updates: Partial<InsertTestPlan>, tenantId: string): Promise<TestPlan | undefined>;
  deleteTestPlan(id: string, tenantId: string): Promise<boolean>;
  
  // Test Run methods (tenant-aware)
  getAllTestRuns(tenantId: string): Promise<TestRun[]>;
  getTestRunsByPlan(testPlanId: string, tenantId: string): Promise<TestRun[]>;
  getTestRun(id: string, tenantId: string): Promise<TestRun | undefined>;
  createTestRun(testRun: InsertTestRun, tenantId: string): Promise<TestRun>;
  updateTestRun(id: string, updates: Partial<InsertTestRun>, tenantId: string): Promise<TestRun | undefined>;
  deleteTestRun(id: string, tenantId: string): Promise<boolean>;
  
  // Test Case Execution methods (tenant-aware)
  getAllTestCaseExecutions(tenantId: string): Promise<TestCaseExecution[]>;
  getTestCaseExecutionsByRun(testRunId: string, tenantId: string): Promise<TestCaseExecution[]>;
  getTestCaseExecution(id: string, tenantId: string): Promise<TestCaseExecution | undefined>;
  createTestCaseExecution(execution: InsertTestCaseExecution, tenantId: string): Promise<TestCaseExecution>;
  updateTestCaseExecution(id: string, updates: Partial<InsertTestCaseExecution>, tenantId: string): Promise<TestCaseExecution | undefined>;
  
  // Defect methods (tenant-aware)
  getAllDefects(tenantId: string): Promise<Defect[]>;
  getDefectsByTestRun(testRunId: string, tenantId: string): Promise<Defect[]>;
  getDefect(id: string, tenantId: string): Promise<Defect | undefined>;
  createDefect(defect: InsertDefect, tenantId: string): Promise<Defect>;
  updateDefect(id: string, updates: Partial<InsertDefect>, tenantId: string): Promise<Defect | undefined>;
  
  // Test Data methods (tenant-aware)
  getAllTestDataSets(tenantId: string): Promise<TestDataSet[]>;
  getTestDataSetsByProduct(productId: string, tenantId: string): Promise<TestDataSet[]>;
  getTestDataSetsByModule(moduleId: string, tenantId: string): Promise<TestDataSet[]>;
  getTestDataSet(id: string, tenantId: string): Promise<TestDataSet | undefined>;
  createTestDataSet(testDataSet: InsertTestDataSet, tenantId: string): Promise<TestDataSet>;
  updateTestDataSet(id: string, updates: Partial<InsertTestDataSet>, tenantId: string): Promise<TestDataSet | undefined>;
  deleteTestDataSet(id: string, tenantId: string): Promise<boolean>;
  
  // Test Case Data Mapping methods (tenant-aware)
  getAllTestCaseDataMappings(tenantId: string): Promise<TestCaseDataMapping[]>;
  getTestCaseDataMappingsByTestCase(testCaseId: string, tenantId: string): Promise<TestCaseDataMapping[]>;
  createTestCaseDataMapping(mapping: InsertTestCaseDataMapping, tenantId: string): Promise<TestCaseDataMapping>;
  deleteTestCaseDataMapping(id: string, tenantId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Tenant methods
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [result] = await db.insert(tenants).values(tenant).returning();
    return result;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [result] = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return result;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

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

  // Priority methods (global lookup data)
  async getAllPriorities(): Promise<Priority[]> {
    return await db.select().from(priorities).where(eq(priorities.isActive, true)).orderBy(priorities.level);
  }

  async getPriority(id: string): Promise<Priority | undefined> {
    const [result] = await db.select().from(priorities).where(eq(priorities.id, id));
    return result;
  }

  async createPriority(priority: InsertPriority): Promise<Priority> {
    const [result] = await db.insert(priorities).values(priority).returning();
    return result;
  }

  async updatePriority(id: string, updates: Partial<InsertPriority>): Promise<Priority | undefined> {
    const [result] = await db.update(priorities).set(updates).where(eq(priorities.id, id)).returning();
    return result;
  }

  // Status methods (global lookup data)
  async getAllStatuses(): Promise<Status[]> {
    return await db.select().from(statuses).where(eq(statuses.isActive, true)).orderBy(statuses.name);
  }

  async getStatusesByCategory(category: string): Promise<Status[]> {
    return await db.select().from(statuses).where(and(eq(statuses.category, category), eq(statuses.isActive, true))).orderBy(statuses.name);
  }

  async getStatus(id: string): Promise<Status | undefined> {
    const [result] = await db.select().from(statuses).where(eq(statuses.id, id));
    return result;
  }

  async createStatus(status: InsertStatus): Promise<Status> {
    const [result] = await db.insert(statuses).values(status).returning();
    return result;
  }

  async updateStatus(id: string, updates: Partial<InsertStatus>): Promise<Status | undefined> {
    const [result] = await db.update(statuses).set(updates).where(eq(statuses.id, id)).returning();
    return result;
  }

  // Product methods (tenant-aware)
  async getAllProducts(tenantId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.tenantId, tenantId));
  }

  async getProduct(id: string, tenantId: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return result[0];
  }

  async createProduct(product: InsertProduct, tenantId: string): Promise<Product> {
    const productData = { ...product, tenantId };
    const result = await db.insert(products).values(productData).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>, tenantId: string): Promise<Product | undefined> {
    const result = await db.update(products).set(updates).where(and(eq(products.id, id), eq(products.tenantId, tenantId))).returning();
    return result[0];
  }

  async deleteProduct(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Module methods (tenant-aware)
  async getAllModules(tenantId: string): Promise<Module[]> {
    return await db.select().from(modules).where(eq(modules.tenantId, tenantId));
  }

  async getModulesByProduct(productId: string, tenantId: string): Promise<Module[]> {
    return await db.select().from(modules).where(and(eq(modules.productId, productId), eq(modules.tenantId, tenantId)));
  }

  async getModule(id: string, tenantId: string): Promise<Module | undefined> {
    const result = await db.select().from(modules).where(and(eq(modules.id, id), eq(modules.tenantId, tenantId)));
    return result[0];
  }

  async createModule(module: InsertModule, tenantId: string): Promise<Module> {
    const moduleData: typeof modules.$inferInsert = {
      name: module.name,
      description: module.description,
      moduleOwner: module.moduleOwner,
      manager: module.manager || '',
      productId: module.productId,
      status: module.status || 'Active',
      developers: module.developers ? ensureArray<string>(module.developers) : [],
      testers: module.testers ? ensureArray<string>(module.testers) : [],
      tenantId
    };
    const result = await db.insert(modules).values(moduleData).returning();
    return result[0];
  }

  async updateModule(id: string, updates: Partial<InsertModule>, tenantId: string): Promise<Module | undefined> {
    const cleanUpdates: Partial<typeof modules.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.moduleOwner !== undefined) cleanUpdates.moduleOwner = updates.moduleOwner;
    if (updates.manager !== undefined) cleanUpdates.manager = updates.manager;
    if (updates.productId !== undefined) cleanUpdates.productId = updates.productId;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.developers !== undefined) cleanUpdates.developers = ensureArray<string>(updates.developers);
    if (updates.testers !== undefined) cleanUpdates.testers = ensureArray<string>(updates.testers);
    
    const result = await db.update(modules).set(cleanUpdates).where(and(eq(modules.id, id), eq(modules.tenantId, tenantId))).returning();
    return result[0];
  }

  async deleteModule(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(modules).where(and(eq(modules.id, id), eq(modules.tenantId, tenantId)));
    return (result.rowCount || 0) > 0;
  }

  // Test Case methods with pagination and filtering (tenant-aware)
  async getAllTestCases(tenantId: string, options?: {
    page?: number;
    limit?: number;
    productId?: string;
    moduleId?: string;
    status?: string;
    priority?: string;
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
        search 
      } = options || {};

      // Get test cases with priority and status joined
      let query = db
        .select({
          id: testCases.id,
          title: testCases.title,
          description: testCases.description,
          priorityId: testCases.priorityId,
          statusId: testCases.statusId,
          steps: testCases.steps,
          expectedResult: testCases.expectedResult,
          productId: testCases.productId,
          moduleId: testCases.moduleId,
          tenantId: testCases.tenantId,
          createdDate: testCases.createdDate,
          lastRun: testCases.lastRun,
          estimatedTime: testCases.estimatedTime,
          priority: priorities.name,
          status: statuses.name,
        })
        .from(testCases)
        .leftJoin(priorities, eq(testCases.priorityId, priorities.id))
        .leftJoin(statuses, eq(testCases.statusId, statuses.id))
        .where(eq(testCases.tenantId, tenantId));

      let allTestCases = await query;
      
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

  async getTestCasesByProduct(productId: string, tenantId: string): Promise<TestCase[]> {
    return await db.select().from(testCases).where(and(eq(testCases.productId, productId), eq(testCases.tenantId, tenantId)));
  }

  async getTestCasesByModule(moduleId: string, tenantId: string): Promise<TestCase[]> {
    return await db.select().from(testCases).where(and(eq(testCases.moduleId, moduleId), eq(testCases.tenantId, tenantId)));
  }

  async getTestCase(id: string, tenantId: string): Promise<TestCase | undefined> {
    const result = await db.select().from(testCases).where(and(eq(testCases.id, id), eq(testCases.tenantId, tenantId)));
    return result[0];
  }

  async createTestCase(testCase: InsertTestCase, tenantId: string): Promise<TestCase> {
    const testCaseData: typeof testCases.$inferInsert = {
      description: testCase.description,
      productId: testCase.productId,
      title: testCase.title,
      priorityId: testCase.priorityId,
      expectedResult: testCase.expectedResult,
      moduleId: testCase.moduleId,
      statusId: testCase.statusId,
      steps: testCase.steps ? ensureArray<string>(testCase.steps) : [],
      estimatedTime: testCase.estimatedTime,
      tenantId
    };
    const result = await db.insert(testCases).values(testCaseData).returning();
    return result[0];
  }

  async updateTestCase(id: string, updates: Partial<InsertTestCase>, tenantId: string): Promise<TestCase | undefined> {
    const cleanUpdates: Partial<typeof testCases.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.productId !== undefined) cleanUpdates.productId = updates.productId;
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.priorityId !== undefined) cleanUpdates.priorityId = updates.priorityId;
    if (updates.expectedResult !== undefined) cleanUpdates.expectedResult = updates.expectedResult;
    if (updates.moduleId !== undefined) cleanUpdates.moduleId = updates.moduleId;
    if (updates.statusId !== undefined) cleanUpdates.statusId = updates.statusId;
    if (updates.steps !== undefined) cleanUpdates.steps = ensureArray<string>(updates.steps);
    if (updates.estimatedTime !== undefined) cleanUpdates.estimatedTime = updates.estimatedTime;
    
    const result = await db.update(testCases).set(cleanUpdates).where(and(eq(testCases.id, id), eq(testCases.tenantId, tenantId))).returning();
    return result[0];
  }

  async deleteTestCase(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(testCases).where(and(eq(testCases.id, id), eq(testCases.tenantId, tenantId)));
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
    
    const testSuiteData: typeof testSuites.$inferInsert = {
      id,
      name: testSuite.name,
      description: testSuite.description,
      productId: testSuite.productId,
      moduleId: testSuite.moduleId,
      owner: testSuite.owner,
      status: testSuite.status || 'Active',
      testCaseIds: testSuite.testCaseIds ? ensureArray<string>(testSuite.testCaseIds) : []
    };
    const result = await db.insert(testSuites).values(testSuiteData).returning();
    return result[0];
  }

  async updateTestSuite(id: string, updates: Partial<InsertTestSuite>): Promise<TestSuite | undefined> {
    const cleanUpdates: Partial<typeof testSuites.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.productId !== undefined) cleanUpdates.productId = updates.productId;
    if (updates.moduleId !== undefined) cleanUpdates.moduleId = updates.moduleId;
    if (updates.owner !== undefined) cleanUpdates.owner = updates.owner;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.testCaseIds !== undefined) cleanUpdates.testCaseIds = ensureArray<string>(updates.testCaseIds);
    
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
    
    const testPlanData: typeof testPlans.$inferInsert = {
      id,
      name: testPlan.name,
      description: testPlan.description,
      productId: testPlan.productId,
      priority: testPlan.priority,
      scope: testPlan.scope,
      environment: testPlan.environment,
      testStrategy: testPlan.testStrategy,
      createdBy: testPlan.createdBy,
      status: testPlan.status || 'Draft',
      objectives: testPlan.objectives ? ensureArray<string>(testPlan.objectives) : [],
      testSuiteIds: testPlan.testSuiteIds ? ensureArray<string>(testPlan.testSuiteIds) : [],
      assignedTeamMembers: testPlan.assignedTeamMembers ? ensureArray<string>(testPlan.assignedTeamMembers) : [],
      deliverables: testPlan.deliverables ? ensureArray<string>(testPlan.deliverables) : [],
      risks: testPlan.risks ? ensureArray<string>(testPlan.risks) : [],
      entryExitCriteria: testPlan.entryExitCriteria ? {
        entryCriteria: ensureArray<string>(testPlan.entryExitCriteria.entryCriteria),
        exitCriteria: ensureArray<string>(testPlan.entryExitCriteria.exitCriteria)
      } : null,
      startDate: testPlan.startDate || null,
      endDate: testPlan.endDate || null,
      estimatedEffort: testPlan.estimatedEffort || 0,
      actualEffort: testPlan.actualEffort || null,
      progress: testPlan.progress || 0
    };
    const result = await db.insert(testPlans).values([testPlanData]).returning();
    return result[0];
  }

  async updateTestPlan(id: string, updates: Partial<InsertTestPlan>): Promise<TestPlan | undefined> {
    const cleanUpdates: Partial<typeof testPlans.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.productId !== undefined) cleanUpdates.productId = updates.productId;
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.scope !== undefined) cleanUpdates.scope = updates.scope;
    if (updates.environment !== undefined) cleanUpdates.environment = updates.environment;
    if (updates.testStrategy !== undefined) cleanUpdates.testStrategy = updates.testStrategy;
    if (updates.createdBy !== undefined) cleanUpdates.createdBy = updates.createdBy;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.objectives !== undefined) cleanUpdates.objectives = ensureArray<string>(updates.objectives);
    if (updates.testSuiteIds !== undefined) cleanUpdates.testSuiteIds = ensureArray<string>(updates.testSuiteIds);
    if (updates.assignedTeamMembers !== undefined) cleanUpdates.assignedTeamMembers = ensureArray<string>(updates.assignedTeamMembers);
    if (updates.deliverables !== undefined) cleanUpdates.deliverables = ensureArray<string>(updates.deliverables);
    if (updates.risks !== undefined) cleanUpdates.risks = ensureArray<string>(updates.risks);
    if (updates.entryExitCriteria !== undefined) {
      cleanUpdates.entryExitCriteria = updates.entryExitCriteria ? {
        entryCriteria: ensureArray<string>(updates.entryExitCriteria.entryCriteria),
        exitCriteria: ensureArray<string>(updates.entryExitCriteria.exitCriteria)
      } : null;
    }
    if (updates.startDate !== undefined) cleanUpdates.startDate = updates.startDate;
    if (updates.endDate !== undefined) cleanUpdates.endDate = updates.endDate;
    if (updates.estimatedEffort !== undefined) cleanUpdates.estimatedEffort = updates.estimatedEffort;
    if (updates.actualEffort !== undefined) cleanUpdates.actualEffort = updates.actualEffort;
    if (updates.progress !== undefined) cleanUpdates.progress = updates.progress;
    
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
    
    const testRunData: typeof testRuns.$inferInsert = {
      id,
      name: testRun.name,
      description: testRun.description,
      priority: testRun.priority,
      environment: testRun.environment,
      createdBy: testRun.createdBy,
      testPlanId: testRun.testPlanId,
      assignedTo: testRun.assignedTo,
      status: testRun.status || 'Not Started',
      testSuiteIds: testRun.testSuiteIds ? ensureArray<string>(testRun.testSuiteIds) : null,
      startDate: testRun.startDate || null,
      endDate: testRun.endDate || null,
      actualStartDate: testRun.actualStartDate || null,
      actualEndDate: testRun.actualEndDate || null,
      progress: testRun.progress || 0,
      totalTestCases: testRun.totalTestCases || 0,
      executedTestCases: testRun.executedTestCases || 0,
      passedTestCases: testRun.passedTestCases || 0,
      failedTestCases: testRun.failedTestCases || 0,
      blockedTestCases: testRun.blockedTestCases || 0,
      skippedTestCases: testRun.skippedTestCases || 0,
      estimatedHours: testRun.estimatedHours || 0,
      actualHours: testRun.actualHours || null
    };
    const result = await db.insert(testRuns).values(testRunData).returning();
    return result[0];
  }

  async updateTestRun(id: string, updates: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const cleanUpdates: Partial<typeof testRuns.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.environment !== undefined) cleanUpdates.environment = updates.environment;
    if (updates.createdBy !== undefined) cleanUpdates.createdBy = updates.createdBy;
    if (updates.testPlanId !== undefined) cleanUpdates.testPlanId = updates.testPlanId;
    if (updates.assignedTo !== undefined) cleanUpdates.assignedTo = updates.assignedTo;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.testSuiteIds !== undefined) cleanUpdates.testSuiteIds = updates.testSuiteIds ? ensureArray<string>(updates.testSuiteIds) : null;
    if (updates.startDate !== undefined) cleanUpdates.startDate = updates.startDate;
    if (updates.endDate !== undefined) cleanUpdates.endDate = updates.endDate;
    if (updates.actualStartDate !== undefined) cleanUpdates.actualStartDate = updates.actualStartDate;
    if (updates.actualEndDate !== undefined) cleanUpdates.actualEndDate = updates.actualEndDate;
    if (updates.progress !== undefined) cleanUpdates.progress = updates.progress;
    if (updates.totalTestCases !== undefined) cleanUpdates.totalTestCases = updates.totalTestCases;
    if (updates.executedTestCases !== undefined) cleanUpdates.executedTestCases = updates.executedTestCases;
    if (updates.passedTestCases !== undefined) cleanUpdates.passedTestCases = updates.passedTestCases;
    if (updates.failedTestCases !== undefined) cleanUpdates.failedTestCases = updates.failedTestCases;
    if (updates.blockedTestCases !== undefined) cleanUpdates.blockedTestCases = updates.blockedTestCases;
    if (updates.skippedTestCases !== undefined) cleanUpdates.skippedTestCases = updates.skippedTestCases;
    if (updates.estimatedHours !== undefined) cleanUpdates.estimatedHours = updates.estimatedHours;
    if (updates.actualHours !== undefined) cleanUpdates.actualHours = updates.actualHours;
    
    const result = await db.update(testRuns).set(cleanUpdates).where(eq(testRuns.id, id)).returning();
    return result[0];
  }

  async deleteTestRun(id: string): Promise<boolean> {
    const result = await db.delete(testRuns).where(eq(testRuns.id, id));
    return (result.rowCount || 0) > 0;
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
    
    const executionData: typeof testCaseExecutions.$inferInsert = {
      id,
      testRunId: execution.testRunId,
      testCaseId: execution.testCaseId,
      status: execution.status || 'Not Run',
      actualResult: execution.actualResult || null,
      executedBy: execution.executedBy || null,
      executedDate: execution.executedDate || null,
      executionTime: execution.executionTime || null,
      notes: execution.notes || null,
      defectIds: execution.defectIds ? ensureArray<string>(execution.defectIds) : null,
      screenshots: execution.screenshots ? ensureArray<string>(execution.screenshots) : null
    };
    const result = await db.insert(testCaseExecutions).values(executionData).returning();
    return result[0];
  }

  async updateTestCaseExecution(id: string, updates: Partial<InsertTestCaseExecution>): Promise<TestCaseExecution | undefined> {
    const cleanUpdates: Partial<typeof testCaseExecutions.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.testRunId !== undefined) cleanUpdates.testRunId = updates.testRunId;
    if (updates.testCaseId !== undefined) cleanUpdates.testCaseId = updates.testCaseId;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.actualResult !== undefined) cleanUpdates.actualResult = updates.actualResult;
    if (updates.executedBy !== undefined) cleanUpdates.executedBy = updates.executedBy;
    if (updates.executedDate !== undefined) cleanUpdates.executedDate = updates.executedDate;
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;
    if (updates.executionTime !== undefined) cleanUpdates.executionTime = updates.executionTime;
    if (updates.defectIds !== undefined) cleanUpdates.defectIds = updates.defectIds ? ensureArray<string>(updates.defectIds) : null;
    if (updates.screenshots !== undefined) cleanUpdates.screenshots = updates.screenshots ? ensureArray<string>(updates.screenshots) : null;
    
    const result = await db.update(testCaseExecutions).set(cleanUpdates).where(eq(testCaseExecutions.id, id)).returning();
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
    
    const defectData: typeof defects.$inferInsert = {
      id,
      title: defect.title,
      description: defect.description,
      severity: defect.severity,
      priority: defect.priority,
      status: defect.status || 'Open',
      reproductionSteps: defect.reproductionSteps,
      reportedBy: defect.reportedBy,
      environment: defect.environment,
      assignedTo: defect.assignedTo || null,
      testRunId: defect.testRunId || null,
      testCaseId: defect.testCaseId || null,
      attachments: defect.attachments ? ensureArray<string>(defect.attachments) : null,
      resolvedDate: defect.resolvedDate || null
    };
    const result = await db.insert(defects).values(defectData).returning();
    return result[0];
  }

  async updateDefect(id: string, updates: Partial<InsertDefect>): Promise<Defect | undefined> {
    const cleanUpdates: Partial<typeof defects.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.severity !== undefined) cleanUpdates.severity = updates.severity;
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.reproductionSteps !== undefined) cleanUpdates.reproductionSteps = updates.reproductionSteps;
    if (updates.reportedBy !== undefined) cleanUpdates.reportedBy = updates.reportedBy;
    if (updates.environment !== undefined) cleanUpdates.environment = updates.environment;
    if (updates.assignedTo !== undefined) cleanUpdates.assignedTo = updates.assignedTo;
    if (updates.testRunId !== undefined) cleanUpdates.testRunId = updates.testRunId;
    if (updates.testCaseId !== undefined) cleanUpdates.testCaseId = updates.testCaseId;
    if (updates.attachments !== undefined) cleanUpdates.attachments = updates.attachments ? ensureArray<string>(updates.attachments) : null;
    if (updates.resolvedDate !== undefined) cleanUpdates.resolvedDate = updates.resolvedDate;
    
    const result = await db.update(defects).set(cleanUpdates).where(eq(defects.id, id)).returning();
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
    
    const testDataSetData: typeof testDataSets.$inferInsert = {
      id,
      name: testDataSet.name,
      description: testDataSet.description,
      productId: testDataSet.productId,
      moduleId: testDataSet.moduleId,
      createdBy: testDataSet.createdBy,
      data: testDataSet.data ? ensureArray<{key: string, value: string, type: string}>(testDataSet.data) : []
    };
    const result = await db.insert(testDataSets).values(testDataSetData).returning();
    return result[0];
  }

  async updateTestDataSet(id: string, updates: Partial<InsertTestDataSet>): Promise<TestDataSet | undefined> {
    const cleanUpdates: Partial<typeof testDataSets.$inferInsert> = {};
    
    // Only copy defined fields to avoid undefined issues
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.productId !== undefined) cleanUpdates.productId = updates.productId;
    if (updates.moduleId !== undefined) cleanUpdates.moduleId = updates.moduleId;
    if (updates.createdBy !== undefined) cleanUpdates.createdBy = updates.createdBy;
    if (updates.data !== undefined) cleanUpdates.data = updates.data ? ensureArray<{key: string, value: string, type: string}>(updates.data) : [];
    
    const result = await db.update(testDataSets).set(cleanUpdates).where(eq(testDataSets.id, id)).returning();
    return result[0];
  }

  async deleteTestDataSet(id: string): Promise<boolean> {
    const result = await db.delete(testDataSets).where(eq(testDataSets.id, id));
    return (result.rowCount || 0) > 0;
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
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
