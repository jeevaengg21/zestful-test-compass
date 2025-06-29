import type { Express } from 'express';
import { storage } from './storage';
import { generateToken, comparePassword, hashPassword, authenticateToken, requireSuperAdmin, type AuthenticatedRequest } from './auth';
import { insertUserSchema, insertTenantSchema } from '@shared/schema';

export function registerAuthRoutes(app: Express) {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login to the application
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Successful login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     fullName:
   *                       type: string
   *                     roles:
   *                       type: array
   *                       items:
   *                         type: string
   *                     tenantId:
   *                       type: string
   *                     tenant:
   *                       type: object
   *                       properties:
   *                         name:
   *                           type: string
   *                         subscriptionPlan:
   *                           type: string
   *       400:
   *         description: Missing email or password
   *       401:
   *         description: Invalid credentials
   *       403:
   *         description: Account suspended or subscription inactive
   *       500:
   *         description: Server error
   */
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log('Login attempt for:', email);
      console.log('Request body:', req.body);
      console.log('Password provided:', password ? 'Yes' : 'No');

      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password required' });
      }

      const user = await storage.getUserByEmail(email);
      console.log('User found:', user ? 'Yes' : 'No');
      if (!user || !user.tenantId) {
        console.log('User not found or no tenant ID');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('Comparing password...');
      const isValidPassword = await comparePassword(password, user.password);
      console.log('Password valid:', isValidPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check tenant status
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant || !tenant.isActive || tenant.subscriptionStatus !== 'active') {
        return res.status(403).json({ message: 'Account suspended or subscription inactive' });
      }

      const token = generateToken(user);
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
          tenantId: user.tenantId,
          tenant: {
            name: tenant.name,
            subscriptionPlan: tenant.subscriptionPlan
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - fullName
   *               - tenantId
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *               fullName:
   *                 type: string
   *               tenantId:
   *                 type: string
   *               roles:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     fullName:
   *                       type: string
   *                     roles:
   *                       type: array
   *                       items:
   *                         type: string
   *                     tenantId:
   *                       type: string
   *       400:
   *         description: User already exists or invalid tenant
   *       500:
   *         description: Server error
   */
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Verify tenant exists and is active
      if (!userData.tenantId) {
        return res.status(400).json({ message: 'Tenant ID required' });
      }

      const tenant = await storage.getTenant(userData.tenantId);
      if (!tenant || !tenant.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive tenant' });
      }

      const hashedPassword = await hashPassword(userData.password);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = generateToken(newUser);

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          roles: newUser.roles,
          tenantId: newUser.tenantId
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user information
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     fullName:
   *                       type: string
   *                     roles:
   *                       type: array
   *                       items:
   *                         type: string
   *                     tenantId:
   *                       type: string
   *                     tenant:
   *                       type: object
   *                       properties:
   *                         name:
   *                           type: string
   *                         subscriptionPlan:
   *                           type: string
   *                         maxUsers:
   *                           type: integer
   *                         maxProjects:
   *                           type: integer
   *       500:
   *         description: Server error
   */
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const tenant = await storage.getTenant(user.tenantId);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
          tenantId: user.tenantId,
          tenant: {
            name: tenant?.name,
            subscriptionPlan: tenant?.subscriptionPlan,
            maxUsers: tenant?.maxUsers,
            maxProjects: tenant?.maxProjects
          }
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  /**
   * @swagger
   * /api/admin/tenants:
   *   post:
   *     summary: Create a new tenant (SuperAdmin only)
   *     tags: [Tenant Management]
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
   *               isActive:
   *                 type: boolean
   *               subscriptionPlan:
   *                 type: string
   *               subscriptionStatus:
   *                 type: string
   *               maxUsers:
   *                 type: integer
   *               maxProjects:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Tenant created successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Not a SuperAdmin
   *       500:
   *         description: Server error
   */
  app.post('/api/admin/tenants', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      res.status(201).json(tenant);
    } catch (error) {
      console.error('Create tenant error:', error);
      res.status(500).json({ message: 'Failed to create tenant' });
    }
  });

  /**
   * @swagger
   * /api/admin/tenants:
   *   get:
   *     summary: Get all tenants (SuperAdmin only)
   *     tags: [Tenant Management]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all tenants
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Tenant'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Not a SuperAdmin
   *       500:
   *         description: Server error
   */
  app.get('/api/admin/tenants', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ message: 'Failed to get tenants' });
    }
  });

  /**
   * @swagger
   * /api/admin/tenants/{id}:
   *   patch:
   *     summary: Update a tenant (SuperAdmin only)
   *     tags: [Tenant Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the tenant to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               subscriptionPlan:
   *                 type: string
   *               subscriptionStatus:
   *                 type: string
   *               maxUsers:
   *                 type: integer
   *               maxProjects:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Tenant updated successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Not a SuperAdmin
   *       404:
   *         description: Tenant not found
   *       500:
   *         description: Server error
   */
  app.patch('/api/admin/tenants/:id', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tenant = await storage.updateTenant(id, updates);
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      res.json(tenant);
    } catch (error) {
      console.error('Update tenant error:', error);
      res.status(500).json({ message: 'Failed to update tenant' });
    }
  });
}