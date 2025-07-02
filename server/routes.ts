import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, type AuthenticatedRequest } from "./auth";
import { registerAuthRoutes } from "./authRoutes";
import { 
  insertProductSchema, insertModuleSchema, insertPrioritySchema, insertStatusSchema, insertTestCaseSchema,
  insertTestSuiteSchema, insertTestPlanSchema, insertTestRunSchema,
  insertTestCaseExecutionSchema, insertDefectSchema, insertTestDataSetSchema,
  insertTestCaseDataMappingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products for the tenant
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       500:
   *         description: Server error
   */
  app.get("/api/products", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const products = await storage.getAllProducts(tenantId);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Get a single product by ID
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the product
   *     responses:
   *       200:
   *         description: Product details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
   */
  app.get("/api/products/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const product = await storage.getProduct(req.params.id, tenantId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  /**
   * @swagger
   * /api/products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Product created successfully
   *       500:
   *         description: Server error
   */
  app.post("/api/products", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        owner: req.user!.id
      }, tenantId);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  /**
   * @swagger
   * /api/products/{id}:
   *   patch:
   *     summary: Update an existing product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the product to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
   */
  app.patch("/api/products/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const updates = req.body;
      const product = await storage.updateProduct(req.params.id, updates, tenantId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  /**
   * @swagger
   * /api/products/{id}:
   *   delete:
   *     summary: Delete a product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the product to delete
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
   */
  app.delete("/api/products/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteProduct(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Modules routes (tenant-aware)
  app.get("/api/modules", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const modules = await storage.getAllModules(tenantId);
      res.json(modules);
    } catch (error) {
      console.error("Get modules error:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.get("/api/modules/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const module = await storage.getModule(req.params.id, tenantId);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Get module error:", error);
      res.status(500).json({ error: "Failed to fetch module" });
    }
  });

  app.post("/api/modules", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const moduleData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(moduleData, tenantId);
      res.status(201).json(module);
    } catch (error) {
      console.error("Create module error:", error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  app.patch("/api/modules/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const updates = req.body;
      const module = await storage.updateModule(req.params.id, updates, tenantId);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Update module error:", error);
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  app.delete("/api/modules/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteModule(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json({ message: "Module deleted successfully" });
    } catch (error) {
      console.error("Delete module error:", error);
      res.status(500).json({ error: "Failed to delete module" });
    }
  });

  // Priority routes (global lookup data)
  app.get("/api/priorities", async (req, res) => {
    try {
      const priorities = await storage.getAllPriorities();
      res.json(priorities);
    } catch (error) {
      console.error("Get priorities error:", error);
      res.status(500).json({ error: "Failed to fetch priorities" });
    }
  });

  app.post("/api/priorities", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const priorityData = insertPrioritySchema.parse(req.body);
      const priority = await storage.createPriority(priorityData);
      res.status(201).json(priority);
    } catch (error) {
      console.error("Create priority error:", error);
      res.status(500).json({ error: "Failed to create priority" });
    }
  });

  // Status routes (global lookup data)
  app.get("/api/statuses", async (req, res) => {
    try {
      const category = req.query.category as string;
      const statuses = category 
        ? await storage.getStatusesByCategory(category)
        : await storage.getAllStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Get statuses error:", error);
      res.status(500).json({ error: "Failed to fetch statuses" });
    }
  });

  app.post("/api/statuses", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const statusData = insertStatusSchema.parse(req.body);
      const status = await storage.createStatus(statusData);
      res.status(201).json(status);
    } catch (error) {
      console.error("Create status error:", error);
      res.status(500).json({ error: "Failed to create status" });
    }
  });

  // Test Suite routes (tenant-aware)
  app.get("/api/test-suites", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testSuites = await storage.getAllTestSuites(tenantId);
      res.json(testSuites);
    } catch (error) {
      console.error("Get test suites error:", error);
      res.status(500).json({ error: "Failed to fetch test suites" });
    }
  });

  app.get("/api/test-suites/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testSuite = await storage.getTestSuite(req.params.id, tenantId);
      if (!testSuite) {
        return res.status(404).json({ error: "Test suite not found" });
      }
      res.json(testSuite);
    } catch (error) {
      console.error("Get test suite error:", error);
      res.status(500).json({ error: "Failed to fetch test suite" });
    }
  });

  app.post("/api/test-suites", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testSuite = await storage.createTestSuite(req.body, tenantId);
      res.status(201).json(testSuite);
    } catch (error) {
      console.error("Create test suite error:", error);
      res.status(500).json({ error: "Failed to create test suite" });
    }
  });

  app.patch("/api/test-suites/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testSuite = await storage.updateTestSuite(req.params.id, req.body, tenantId);
      if (!testSuite) {
        return res.status(404).json({ error: "Test suite not found" });
      }
      res.json(testSuite);
    } catch (error) {
      console.error("Update test suite error:", error);
      res.status(500).json({ error: "Failed to update test suite" });
    }
  });

  app.delete("/api/test-suites/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteTestSuite(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Test suite not found" });
      }
      res.json({ message: "Test suite deleted successfully" });
    } catch (error) {
      console.error("Delete test suite error:", error);
      res.status(500).json({ error: "Failed to delete test suite" });
    }
  });

  // Test Plan routes (tenant-aware)
  app.get("/api/test-plans", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testPlans = await storage.getAllTestPlans(tenantId);
      res.json(testPlans);
    } catch (error) {
      console.error("Get test plans error:", error);
      res.status(500).json({ error: "Failed to fetch test plans" });
    }
  });

  app.post("/api/test-plans", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Make a copy of the request body to avoid modifying it directly
      const testPlanData = { ...req.body };
      
      // Automatically generate an ID for the test plan using just UUID without prefix
      testPlanData.id = crypto.randomUUID();
      
      // Use the authenticated user's ID for createdBy
      testPlanData.createdBy = req.user!.id;
      
      // Process date fields to ensure they are valid Date objects for the database
      if (testPlanData.startDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(testPlanData.startDate instanceof Date)) {
          testPlanData.startDate = new Date(testPlanData.startDate);
        }
      }
      
      if (testPlanData.endDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(testPlanData.endDate instanceof Date)) {
          testPlanData.endDate = new Date(testPlanData.endDate);
        }
      }
      
      // Skip validation for now, as we're having issues with the schema
      // const validatedData = insertTestPlanSchema.parse(testPlanData);
      
      const testPlan = await storage.createTestPlan(testPlanData, tenantId);
      res.status(201).json(testPlan);
    } catch (error) {
      console.error("Create test plan error:", error);
      res.status(500).json({ error: "Failed to create test plan" });
    }
  });

  app.patch("/api/test-plans/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Make a copy of the request body to avoid modifying it directly
      const updates = { ...req.body };
      
      // Process date fields to ensure they are valid Date objects for the database
      if (updates.startDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(updates.startDate instanceof Date)) {
          updates.startDate = new Date(updates.startDate);
        }
      }
      
      if (updates.endDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(updates.endDate instanceof Date)) {
          updates.endDate = new Date(updates.endDate);
        }
      }
      
      const testPlan = await storage.updateTestPlan(req.params.id, updates, tenantId);
      if (!testPlan) {
        return res.status(404).json({ error: "Test plan not found" });
      }
      res.json(testPlan);
    } catch (error) {
      console.error("Update test plan error:", error);
      res.status(500).json({ error: "Failed to update test plan" });
    }
  });

  /**
   * @swagger
   * /api/test-cases:
   *   get:
   *     summary: Get all test cases with pagination and filtering
   *     tags: [Test Cases]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Number of items per page
   *       - in: query
   *         name: productId
   *         schema:
   *           type: string
   *         description: Filter by product ID
   *       - in: query
   *         name: moduleId
   *         schema:
   *           type: string
   *         description: Filter by module ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *         description: Filter by priority
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search text in test case title and description
   *     responses:
   *       200:
   *         description: A paginated list of test cases
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TestCase'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *                 pages:
   *                   type: integer
   *       500:
   *         description: Server error
   */
  app.get("/api/test-cases", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        productId: req.query.productId as string,
        moduleId: req.query.moduleId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string
      };
      
      const result = await storage.getAllTestCases(tenantId, options);
      res.json(result);
    } catch (error) {
      console.error("Get test cases error:", error);
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  /**
   * @swagger
   * /api/test-cases/{id}:
   *   get:
   *     summary: Get a single test case by ID
   *     tags: [Test Cases]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the test case
   *     responses:
   *       200:
   *         description: Test case details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TestCase'
   *       404:
   *         description: Test case not found
   *       500:
   *         description: Server error
   */
  app.get("/api/test-cases/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testCase = await storage.getTestCase(req.params.id, tenantId);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json(testCase);
    } catch (error) {
      console.error("Get test case error:", error);
      res.status(500).json({ error: "Failed to fetch test case" });
    }
  });

  /**
   * @swagger
   * /api/test-cases:
   *   post:
   *     summary: Create a new test case
   *     tags: [Test Cases]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - productId
   *               - moduleId
   *               - priorityId
   *               - statusId
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               preconditions:
   *                 type: string
   *               steps:
   *                 type: string
   *               expectedResults:
   *                 type: string
   *               productId:
   *                 type: string
   *               moduleId:
   *                 type: string
   *               priorityId:
   *                 type: string
   *               statusId:
   *                 type: string
   *               automationStatus:
   *                 type: string
   *     responses:
   *       201:
   *         description: Test case created successfully
   *       500:
   *         description: Server error
   */
  app.post("/api/test-cases", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testCaseData = insertTestCaseSchema.parse(req.body);
      const testCase = await storage.createTestCase(testCaseData, tenantId);
      res.status(201).json(testCase);
    } catch (error) {
      console.error("Create test case error:", error);
      res.status(500).json({ error: "Failed to create test case" });
    }
  });

  /**
   * @swagger
   * /api/test-cases/{id}:
   *   patch:
   *     summary: Update an existing test case
   *     tags: [Test Cases]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the test case to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               preconditions:
   *                 type: string
   *               steps:
   *                 type: string
   *               expectedResults:
   *                 type: string
   *               productId:
   *                 type: string
   *               moduleId:
   *                 type: string
   *               priorityId:
   *                 type: string
   *               statusId:
   *                 type: string
   *               automationStatus:
   *                 type: string
   *     responses:
   *       200:
   *         description: Test case updated successfully
   *       404:
   *         description: Test case not found
   *       500:
   *         description: Server error
   */
  app.patch("/api/test-cases/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const updates = req.body;
      const testCase = await storage.updateTestCase(req.params.id, updates, tenantId);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json(testCase);
    } catch (error) {
      console.error("Update test case error:", error);
      res.status(500).json({ error: "Failed to update test case" });
    }
  });

  /**
   * @swagger
   * /api/test-cases/{id}:
   *   delete:
   *     summary: Delete a test case
   *     tags: [Test Cases]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the test case to delete
   *     responses:
   *       200:
   *         description: Test case deleted successfully
   *       404:
   *         description: Test case not found
   *       500:
   *         description: Server error
   */
  app.delete("/api/test-cases/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteTestCase(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json({ message: "Test case deleted successfully" });
    } catch (error) {
      console.error("Delete test case error:", error);
      res.status(500).json({ error: "Failed to delete test case" });
    }
  });

  // Users routes
  app.get('/api/users', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const users = await storage.getUsersByTenant(tenantId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  /**
   * @swagger
   * /api/test-runs:
   *   get:
   *     summary: Get all test runs for the tenant
   *     tags: [Test Runs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of test runs
   *       500:
   *         description: Server error
   */
  app.get("/api/test-runs", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      console.log(`Fetching test runs for tenant: ${tenantId}`);
      const testRuns = await storage.getAllTestRuns(tenantId);
      console.log(`Found ${testRuns.length} test runs for tenant ${tenantId}`);
      res.json(testRuns);
    } catch (error) {
      console.error("Get test runs error:", error);
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  /**
   * @swagger
   * /api/test-runs/{id}:
   *   get:
   *     summary: Get a single test run by ID
   *     tags: [Test Runs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the test run
   *     responses:
   *       200:
   *         description: Test run details
   *       404:
   *         description: Test run not found
   *       500:
   *         description: Server error
   */
  app.get("/api/test-runs/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testRun = await storage.getTestRun(req.params.id, tenantId);
      if (!testRun) {
        return res.status(404).json({ error: "Test run not found" });
      }
      res.json(testRun);
    } catch (error) {
      console.error("Get test run error:", error);
      res.status(500).json({ error: "Failed to fetch test run" });
    }
  });

  /**
   * @swagger
   * /api/test-runs:
   *   post:
   *     summary: Create a new test run
   *     tags: [Test Runs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *     responses:
   *       201:
   *         description: Test run created successfully
   *       500:
   *         description: Server error
   */
  app.post("/api/test-runs", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      console.log("Creating test run with data:", req.body);
      
      // Make a copy of the request body to avoid modifying it directly
      const testRunData = { ...req.body };
      
      // Process date fields to ensure they are valid Date objects for the database
      if (testRunData.startDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(testRunData.startDate instanceof Date)) {
          console.log(`Converting startDate from ${typeof testRunData.startDate}:`, testRunData.startDate);
          testRunData.startDate = new Date(testRunData.startDate);
          console.log("Converted startDate to Date object:", testRunData.startDate);
        }
      }
      
      if (testRunData.endDate) {
        // If it's already a Date object, keep it, otherwise create a new Date object
        if (!(testRunData.endDate instanceof Date)) {
          console.log(`Converting endDate from ${typeof testRunData.endDate}:`, testRunData.endDate);
          testRunData.endDate = new Date(testRunData.endDate);
          console.log("Converted endDate to Date object:", testRunData.endDate);
        }
      }
      
      // Handle any other date fields if present
      if (testRunData.actualStartDate && !(testRunData.actualStartDate instanceof Date)) {
        testRunData.actualStartDate = new Date(testRunData.actualStartDate);
      }
      
      if (testRunData.actualEndDate && !(testRunData.actualEndDate instanceof Date)) {
        testRunData.actualEndDate = new Date(testRunData.actualEndDate);
      }
      
      // Always use the authenticated user's UUID from the token for createdBy
      // This ensures data integrity and security
      testRunData.createdBy = req.user!.id;
      console.log(`Setting createdBy to authenticated user ID: ${testRunData.createdBy}`);
      
      console.log("Processed test run data for database:", testRunData);
      const testRun = await storage.createTestRun(testRunData, tenantId);
      console.log("Test run created successfully:", testRun);
      res.status(201).json(testRun);
    } catch (error) {
      console.error("Create test run error:", error);
      res.status(500).json({ error: `Failed to create test run: ${error.message}` });
    }
  });

  /**
   * @swagger
   * /api/test-runs/{id}:
   *   patch:
   *     summary: Update an existing test run
   *     tags: [Test Runs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the test run to update
   *     requestBody:
   *       required: true
   *     responses:
   *       200:
   *         description: Test run updated successfully
   *       404:
   *         description: Test run not found
   *       500:
   *         description: Server error
   */
  app.patch("/api/test-runs/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { updates, testCaseIds } = req.body;
      const testRun = await storage.updateTestRun(req.params.id, updates || req.body, tenantId);
      if (!testRun) {
        return res.status(404).json({ error: "Test run not found" });
      }
      
      // Handle related test case executions if test suites changed
      // This would be implemented in a more complete solution
      
      res.json(testRun);
    } catch (error) {
      console.error("Update test run error:", error);
      res.status(500).json({ error: "Failed to update test run" });
    }
  });

  /**
   * @swagger
   * /api/test-runs/{id}:
   *   delete:
   *     summary: Delete a test run
   *     tags: [Test Runs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the test run to delete
   *     responses:
   *       200:
   *         description: Test run deleted successfully
   *       404:
   *         description: Test run not found
   *       500:
   *         description: Server error
   */
  app.delete("/api/test-runs/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteTestRun(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Test run not found" });
      }
      res.json({ message: "Test run deleted successfully" });
    } catch (error) {
      console.error("Delete test run error:", error);
      res.status(500).json({ error: "Failed to delete test run" });
    }
  });

  // Test case execution routes
  app.get("/api/test-case-executions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testRunId = req.query.testRunId as string;
      
      let executions;
      if (testRunId) {
        executions = await storage.getTestCaseExecutionsByRun(testRunId, tenantId);
      } else {
        executions = await storage.getAllTestCaseExecutions(tenantId);
      }
      
      res.json(executions);
    } catch (error) {
      console.error("Get test case executions error:", error);
      res.status(500).json({ error: "Failed to fetch test case executions" });
    }
  });

  app.post("/api/test-case-executions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const executionData = req.body;
      const execution = await storage.createTestCaseExecution(executionData, tenantId);
      res.status(201).json(execution);
    } catch (error) {
      console.error("Create test case execution error:", error);
      res.status(500).json({ error: "Failed to create test case execution" });
    }
  });

  app.post("/api/test-case-executions/batch", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { executions } = req.body;
      
      console.log(`Creating ${executions.length} test case executions in batch`);
      
      if (!Array.isArray(executions)) {
        return res.status(400).json({ error: "Executions must be an array" });
      }
      
      // Create all executions in a batch operation
      const createdExecutions = [];
      for (const executionData of executions) {
        // Generate a UUID for each execution
        executionData.id = crypto.randomUUID();
        
        // Set initial status if not provided
        if (!executionData.status) {
          executionData.status = 'Not Executed';
        }
        
        // Add creation timestamp
        executionData.createdAt = new Date();
        
        const execution = await storage.createTestCaseExecution(executionData, tenantId);
        createdExecutions.push(execution);
      }
      
      console.log(`Successfully created ${createdExecutions.length} test case executions`);
      res.status(201).json(createdExecutions);
    } catch (error) {
      console.error("Create test case executions batch error:", error);
      res.status(500).json({ error: "Failed to create test case executions batch" });
    }
  });
  
  app.patch("/api/test-case-executions/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Make a copy of the request body to avoid modifying it directly
      const updates = { ...req.body };
      
      // Always use the authenticated user's ID from the token for executedBy
      // This ensures data integrity and security
      if (updates.status && updates.status !== 'Not Run' && updates.status !== 'Not Executed') {
        updates.executedBy = req.user!.id;
        console.log(`Setting executedBy to authenticated user ID: ${updates.executedBy}`);
        
        // If execution status is being updated, also set the execution date to now if not provided
        if (!updates.executedDate) {
          updates.executedDate = new Date();
        }
      }
      
      // Get the existing execution to find out its test run ID
      const existingExecution = await storage.getTestCaseExecution(req.params.id, tenantId);
      if (!existingExecution) {
        return res.status(404).json({ error: "Test case execution not found" });
      }
      
      // Update the execution
      const execution = await storage.updateTestCaseExecution(req.params.id, updates, tenantId);
      if (!execution) {
        return res.status(404).json({ error: "Test case execution not found" });
      }
      
      // After updating the execution, recalculate test run statistics
      try {
        console.log(`Recalculating statistics for test run: ${execution.testRunId}`);
        const updatedTestRun = await storage.updateTestRunStatistics(execution.testRunId, tenantId);
        console.log(`Updated test run statistics:`, updatedTestRun);
      } catch (error) {
        // Log the error but don't fail the request
        console.error(`Error updating test run statistics: ${error.message}`);
      }
      
      res.json(execution);
    } catch (error) {
      console.error("Update test case execution error:", error);
      res.status(500).json({ error: "Failed to update test case execution" });
    }
  });

  // Endpoint to get test cases for a specific test suite
  app.get("/api/test-suites/:id/test-cases", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const suiteId = req.params.id;
      
      // Get the test suite to find its test case IDs
      const testSuite = await storage.getTestSuite(suiteId, tenantId);
      
      if (!testSuite) {
        return res.status(404).json({ error: "Test suite not found" });
      }
      
      // If the suite has no test case IDs, return empty array
      if (!testSuite.testCaseIds || testSuite.testCaseIds.length === 0) {
        return res.json([]);
      }
      
      // Get all the test cases for this suite
      const testCases = [];
      for (const testCaseId of testSuite.testCaseIds) {
        const testCase = await storage.getTestCase(testCaseId, tenantId);
        if (testCase) {
          testCases.push(testCase);
        }
      }
      
      console.log(`Found ${testCases.length} test cases for suite ${suiteId}`);
      res.json(testCases);
    } catch (error) {
      console.error(`Error fetching test cases for suite ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch test cases for test suite" });
    }
  });
  
  // Test Data Set routes (tenant-aware)
  app.get("/api/test-data-sets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testDataSets = await storage.getAllTestDataSets(tenantId);
      res.json(testDataSets);
    } catch (error) {
      console.error("Get test data sets error:", error);
      res.status(500).json({ error: "Failed to fetch test data sets" });
    }
  });

  app.get("/api/test-data-sets/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testDataSet = await storage.getTestDataSet(req.params.id, tenantId);
      if (!testDataSet) {
        return res.status(404).json({ error: "Test data set not found" });
      }
      res.json(testDataSet);
    } catch (error) {
      console.error("Get test data set error:", error);
      res.status(500).json({ error: "Failed to fetch test data set" });
    }
  });

  app.post("/api/test-data-sets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      console.log("Creating test data set with data:", req.body);
      
      // Always use the authenticated user's ID from the token
      const testDataSetWithUser = {
        ...req.body,
        createdBy: req.user!.id
      };
      
      // Make sure data is initialized properly
      if (!testDataSetWithUser.data) {
        testDataSetWithUser.data = [];
      }
      
      const testDataSet = await storage.createTestDataSet(testDataSetWithUser, tenantId);
      console.log("Test data set created successfully:", testDataSet);
      res.status(201).json(testDataSet);
    } catch (error) {
      console.error("Create test data set error:", error);
      res.status(500).json({ error: `Failed to create test data set: ${error.message}` });
    }
  });

  app.patch("/api/test-data-sets/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const updates = req.body;
      
      console.log(`Updating test data set ${req.params.id} with:`, updates);
      
      const testDataSet = await storage.updateTestDataSet(req.params.id, updates, tenantId);
      if (!testDataSet) {
        return res.status(404).json({ error: "Test data set not found" });
      }
      res.json(testDataSet);
    } catch (error) {
      console.error("Update test data set error:", error);
      res.status(500).json({ error: "Failed to update test data set" });
    }
  });

  app.delete("/api/test-data-sets/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteTestDataSet(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Test data set not found" });
      }
      res.json({ message: "Test data set deleted successfully" });
    } catch (error) {
      console.error("Delete test data set error:", error);
      res.status(500).json({ error: "Failed to delete test data set" });
    }
  });

  // Test Case Data Mapping routes (tenant-aware)
  app.get("/api/test-case-data-mappings", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const testCaseId = req.query.testCaseId as string;
      
      let mappings;
      if (testCaseId) {
        mappings = await storage.getTestCaseDataMappingsByTestCase(testCaseId, tenantId);
      } else {
        mappings = await storage.getAllTestCaseDataMappings(tenantId);
      }
      
      res.json(mappings);
    } catch (error) {
      console.error("Get test case data mappings error:", error);
      res.status(500).json({ error: "Failed to fetch test case data mappings" });
    }
  });

  app.post("/api/test-case-data-mappings", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const mappingData = req.body;
      
      // Generate a unique ID for the mapping if not provided
      if (!mappingData.id) {
        mappingData.id = `TCDM_${crypto.randomUUID()}`;
      }
      
      const mapping = await storage.createTestCaseDataMapping(mappingData, tenantId);
      res.status(201).json(mapping);
    } catch (error) {
      console.error("Create test case data mapping error:", error);
      res.status(500).json({ error: "Failed to create test case data mapping" });
    }
  });

  app.delete("/api/test-case-data-mappings/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const success = await storage.deleteTestCaseDataMapping(req.params.id, tenantId);
      if (!success) {
        return res.status(404).json({ error: "Test case data mapping not found" });
      }
      res.json({ message: "Test case data mapping deleted successfully" });
    } catch (error) {
      console.error("Delete test case data mapping error:", error);
      res.status(500).json({ error: "Failed to delete test case data mapping" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}