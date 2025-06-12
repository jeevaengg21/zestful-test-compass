import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth User table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  roles: json("roles").$type<string[]>(),
  status: text("status").notNull().default("Active"),
  createdDate: timestamp("created_date").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("Active"),
  testCases: integer("test_cases").default(0),
  testRuns: integer("test_runs").default(0),
  teamMembers: integer("team_members").default(0),
  coverage: integer("coverage").default(0),
  lastActivity: text("last_activity"),
  createdDate: timestamp("created_date").defaultNow(),
  owner: uuid("owner").notNull(),
});

// Modules table
export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  moduleOwner: text("module_owner").notNull(),
  manager: text("manager").notNull(),
  developers: json("developers").$type<string[]>(),
  testers: json("testers").$type<string[]>(),
  createdDate: timestamp("created_date").defaultNow(),
  status: text("status").notNull().default("Active"),
  productId: uuid("product_id").notNull(),
});

// Test Cases table
export const testCases = pgTable("test_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Draft"),
  steps: json("steps"),
  expectedResult: text("expected_result"),
  productId: uuid("product_id").notNull().references(() => products.id),
  moduleId: uuid("module_id").references(() => modules.id),
  createdDate: timestamp("created_date").defaultNow(),
  lastRun: timestamp("last_run"),
  estimatedTime: integer("estimated_time"),
});

// Test Suites table
export const testSuites = pgTable("test_suites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  productId: uuid("product_id").notNull(),
  moduleId: uuid("module_id").notNull(),
  testCaseIds: json("test_case_ids").$type<string[]>(),
  status: text("status").notNull().default("Active"),
  createdDate: timestamp("created_date").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
  owner: uuid("owner").notNull(),
});

// Test Plans table
export const testPlans = pgTable("test_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  objectives: json("objectives").$type<string[]>(),
  scope: text("scope").notNull(),
  testSuiteIds: json("test_suite_ids").$type<string[]>(),
  assignedTeamMembers: json("assigned_team_members").$type<string[]>(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("Draft"),
  priority: text("priority").notNull(),
  productId: uuid("product_id").notNull(),
  environment: text("environment").notNull(),
  testStrategy: text("test_strategy").notNull(),
  entryExitCriteria: json("entry_exit_criteria").$type<{entryCriteria: string[], exitCriteria: string[]}>(),
  deliverables: json("deliverables").$type<string[]>(),
  risks: json("risks").$type<string[]>(),
  createdBy: uuid("created_by").notNull(),
  createdDate: timestamp("created_date").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
  estimatedEffort: integer("estimated_effort").default(0),
  actualEffort: integer("actual_effort"),
  progress: integer("progress").default(0),
});

// Test Runs table
export const testRuns = pgTable("test_runs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  testPlanId: text("test_plan_id").notNull(),
  testSuiteIds: json("test_suite_ids").$type<string[]>(),
  assignedTo: uuid("assigned_to").notNull(),
  status: text("status").notNull().default("Not Started"),
  priority: text("priority").notNull(),
  environment: text("environment").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  progress: integer("progress").default(0),
  totalTestCases: integer("total_test_cases").default(0),
  executedTestCases: integer("executed_test_cases").default(0),
  passedTestCases: integer("passed_test_cases").default(0),
  failedTestCases: integer("failed_test_cases").default(0),
  blockedTestCases: integer("blocked_test_cases").default(0),
  skippedTestCases: integer("skipped_test_cases").default(0),
  estimatedHours: integer("estimated_hours").default(0),
  actualHours: integer("actual_hours"),
  createdBy: uuid("created_by").notNull(),
  createdDate: timestamp("created_date").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Test Case Executions table
export const testCaseExecutions = pgTable("test_case_executions", {
  id: text("id").primaryKey(),
  testRunId: text("test_run_id").notNull(),
  testCaseId: uuid("test_case_id").notNull().references(() => testCases.id),
  status: text("status").notNull().default("Not Run"),
  executedBy: uuid("executed_by"),
  executedDate: timestamp("executed_date"),
  executionTime: integer("execution_time"),
  actualResult: text("actual_result"),
  notes: text("notes"),
  defectIds: json("defect_ids").$type<string[]>(),
  screenshots: json("screenshots").$type<string[]>(),
});

// Defects table
export const defects = pgTable("defects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Open"),
  testRunId: text("test_run_id"),
  testCaseId: uuid("test_case_id").references(() => testCases.id),
  reproductionSteps: text("reproduction_steps").notNull(),
  assignedTo: uuid("assigned_to"),
  reportedBy: uuid("reported_by").notNull(),
  environment: text("environment").notNull(),
  createdDate: timestamp("created_date").defaultNow(),
  resolvedDate: timestamp("resolved_date"),
  attachments: json("attachments").$type<string[]>(),
});

// Test Data Sets table
export const testDataSets = pgTable("test_data_sets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  productId: uuid("product_id").notNull(),
  moduleId: uuid("module_id").notNull(),
  data: json("data").$type<Array<{key: string, value: string, type: string}>>().default([]),
  createdBy: uuid("created_by").notNull(),
  createdDate: timestamp("created_date").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Test Case Data Mappings table
export const testCaseDataMappings = pgTable("test_case_data_mappings", {
  id: text("id").primaryKey(),
  testCaseId: text("test_case_id").notNull(),
  testDataSetId: text("test_data_set_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdDate: timestamp("created_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  fullName: true,
  roles: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdDate: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdDate: true,
});

export const insertTestCaseSchema = createInsertSchema(testCases).omit({
  createdDate: true,
  lastRun: true,
});

export const insertTestSuiteSchema = createInsertSchema(testSuites).omit({
  createdDate: true,
  lastModified: true,
});

export const insertTestPlanSchema = createInsertSchema(testPlans).omit({
  createdDate: true,
  lastModified: true,
});

export const insertTestRunSchema = createInsertSchema(testRuns).omit({
  createdDate: true,
  lastModified: true,
});

export const insertTestCaseExecutionSchema = createInsertSchema(testCaseExecutions);

export const insertDefectSchema = createInsertSchema(defects).omit({
  createdDate: true,
});

export const insertTestDataSetSchema = createInsertSchema(testDataSets).omit({
  createdDate: true,
  lastModified: true,
});

export const insertTestCaseDataMappingSchema = createInsertSchema(testCaseDataMappings).omit({
  createdDate: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;
export type InsertTestSuite = z.infer<typeof insertTestSuiteSchema>;
export type TestSuite = typeof testSuites.$inferSelect;
export type InsertTestPlan = z.infer<typeof insertTestPlanSchema>;
export type TestPlan = typeof testPlans.$inferSelect;
export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;
export type InsertTestCaseExecution = z.infer<typeof insertTestCaseExecutionSchema>;
export type TestCaseExecution = typeof testCaseExecutions.$inferSelect;
export type InsertDefect = z.infer<typeof insertDefectSchema>;
export type Defect = typeof defects.$inferSelect;
export type InsertTestDataSet = z.infer<typeof insertTestDataSetSchema>;
export type TestDataSet = typeof testDataSets.$inferSelect;
export type InsertTestCaseDataMapping = z.infer<typeof insertTestCaseDataMappingSchema>;
export type TestCaseDataMapping = typeof testCaseDataMappings.$inferSelect;
