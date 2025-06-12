import type { Express } from 'express';
import { storage } from './storage';
import { generateToken, comparePassword, hashPassword, authenticateToken, requireSuperAdmin, type AuthenticatedRequest } from './auth';
import { insertUserSchema, insertTenantSchema } from '@shared/schema';

export function registerAuthRoutes(app: Express) {
  // Login route
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

  // Register route (requires tenant invitation or super admin)
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

  // Get current user
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

  // Super admin routes for tenant management
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

  app.get('/api/admin/tenants', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ message: 'Failed to get tenants' });
    }
  });

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