import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        roles: ["user"]
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, email: user.email, fullName: user.fullName, roles: user.roles },
        token 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, email: user.email, fullName: user.fullName, roles: user.roles },
        token 
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    // With JWT, signout is handled client-side by removing the token
    res.json({ message: "Signed out successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        user: { id: user.id, email: user.email, fullName: user.fullName, roles: user.roles }
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Data API routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      console.log("Received product data:", productData);
      const newProduct = await storage.createProduct(productData);
      console.log("Created product:", newProduct);
      res.json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.get("/api/modules", async (req, res) => {
    try {
      const { productId } = req.query;
      const modules = productId 
        ? await storage.getModulesByProduct(productId as string)
        : await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const moduleData = req.body;
      console.log("Received module data:", moduleData);
      const newModule = await storage.createModule(moduleData);
      console.log("Created module:", newModule);
      res.json(newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  app.patch("/api/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      console.log("Updating module:", id, "with data:", updates);
      const updatedModule = await storage.updateModule(id, updates);
      if (!updatedModule) {
        return res.status(404).json({ error: "Module not found" });
      }
      console.log("Updated module:", updatedModule);
      res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  app.get("/api/test-cases", async (req, res) => {
    try {
      const { 
        productId, 
        moduleId, 
        page, 
        limit, 
        status, 
        priority, 
        assignee, 
        search 
      } = req.query;
      
      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 50;
      
      const result = await storage.getAllTestCases({
        page: pageNum,
        limit: limitNum,
        productId: productId as string,
        moduleId: moduleId as string,
        status: status as string,
        priority: priority as string,
        assignee: assignee as string,
        search: search as string
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  app.get("/api/test-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const testCase = await storage.getTestCase(id);
      if (testCase) {
        res.json(testCase);
      } else {
        res.status(404).json({ error: "Test case not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test case" });
    }
  });

  app.patch("/api/test-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedTestCase = await storage.updateTestCase(id, updates);
      if (updatedTestCase) {
        res.json(updatedTestCase);
      } else {
        res.status(404).json({ error: "Test case not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update test case" });
    }
  });

  app.post("/api/test-cases", async (req, res) => {
    try {
      const testCaseData = req.body;
      const newTestCase = await storage.createTestCase(testCaseData);
      res.status(201).json(newTestCase);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test case" });
    }
  });

  app.get("/api/test-suites", async (req, res) => {
    try {
      const { productId, moduleId } = req.query;
      let testSuites;
      if (productId) {
        testSuites = await storage.getTestSuitesByProduct(productId as string);
      } else if (moduleId) {
        testSuites = await storage.getTestSuitesByModule(moduleId as string);
      } else {
        testSuites = await storage.getAllTestSuites();
      }
      res.json(testSuites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test suites" });
    }
  });

  app.get("/api/test-plans", async (req, res) => {
    try {
      const { productId } = req.query;
      const testPlans = productId 
        ? await storage.getTestPlansByProduct(productId as string)
        : await storage.getAllTestPlans();
      res.json(testPlans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test plans" });
    }
  });

  app.get("/api/test-runs", async (req, res) => {
    try {
      const { testPlanId } = req.query;
      const testRuns = testPlanId 
        ? await storage.getTestRunsByPlan(testPlanId as string)
        : await storage.getAllTestRuns();
      res.json(testRuns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  app.get("/api/test-case-executions", async (req, res) => {
    try {
      const { testRunId } = req.query;
      const executions = testRunId 
        ? await storage.getTestCaseExecutionsByRun(testRunId as string)
        : await storage.getAllTestCaseExecutions();
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test case executions" });
    }
  });

  app.get("/api/defects", async (req, res) => {
    try {
      const { testRunId } = req.query;
      const defects = testRunId 
        ? await storage.getDefectsByTestRun(testRunId as string)
        : await storage.getAllDefects();
      res.json(defects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch defects" });
    }
  });

  app.get("/api/test-data-sets", async (req, res) => {
    try {
      const { productId, moduleId } = req.query;
      let testDataSets;
      if (productId) {
        testDataSets = await storage.getTestDataSetsByProduct(productId as string);
      } else if (moduleId) {
        testDataSets = await storage.getTestDataSetsByModule(moduleId as string);
      } else {
        testDataSets = await storage.getAllTestDataSets();
      }
      res.json(testDataSets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test data sets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
