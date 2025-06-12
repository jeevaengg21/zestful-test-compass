import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, type AuthenticatedRequest } from "./auth";
import { registerAuthRoutes } from "./authRoutes";
import { 
  insertProductSchema, insertModuleSchema, insertTestCaseSchema,
  insertTestSuiteSchema, insertTestPlanSchema, insertTestRunSchema,
  insertTestCaseExecutionSchema, insertDefectSchema, insertTestDataSetSchema,
  insertTestCaseDataMappingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  // Products routes (tenant-aware)
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

  // Test Cases routes (tenant-aware)
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

  const httpServer = createServer(app);
  return httpServer;
}