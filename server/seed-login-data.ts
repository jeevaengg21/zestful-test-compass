import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { hashPassword } from './auth';
import { tenants, users, products, modules, priorities, statuses } from '../shared/schema';
import { db } from './db';

dotenv.config();

/**
 * Seed script to create sample login data:
 * - Creates a demo tenant
 * - Creates 3 users with different roles
 * - Creates basic lookup data (priorities, statuses)
 * - Creates 1 sample product and module
 */
async function seedLoginData() {
  console.log('Starting to seed sample login data...');
  
  try {
    // Create a demo tenant
    console.log('Creating demo tenant...');
    const [demoTenant] = await db.insert(tenants)
      .values({
        name: 'Demo Company',
        domain: 'demo.zestfultest.com',
        subscriptionStatus: 'active',
        subscriptionPlan: 'enterprise',
        maxUsers: 15,
        maxProjects: 10,
        isActive: true
      })
      .returning();
    
    console.log(`✅ Created demo tenant with ID: ${demoTenant.id}`);

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const [adminUser] = await db.insert(users)
      .values({
        email: 'admin@demo.com',
        password: adminPassword,
        fullName: 'Admin User',
        roles: ['admin', 'tester', 'manager'],
        status: 'Active',
        tenantId: demoTenant.id
      })
      .returning();
    
    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create manager user
    const managerPassword = await hashPassword('manager123');
    const [managerUser] = await db.insert(users)
      .values({
        email: 'manager@demo.com',
        password: managerPassword,
        fullName: 'Test Manager',
        roles: ['manager', 'tester'],
        status: 'Active',
        tenantId: demoTenant.id
      })
      .returning();
    
    console.log(`✅ Created manager user: ${managerUser.email}`);

    // Create tester user
    const testerPassword = await hashPassword('tester123');
    const [testerUser] = await db.insert(users)
      .values({
        email: 'tester@demo.com',
        password: testerPassword,
        fullName: 'QA Tester',
        roles: ['tester'],
        status: 'Active',
        tenantId: demoTenant.id
      })
      .returning();
    
    console.log(`✅ Created tester user: ${testerUser.email}`);

    // Create super admin user (no tenant association)
    const superAdminPassword = await hashPassword('superadmin123');
    const [superAdminUser] = await db.insert(users)
      .values({
        email: 'superadmin@zestfultest.com',
        password: superAdminPassword,
        fullName: 'Super Admin',
        roles: ['superadmin'],
        status: 'Active'
      })
      .returning();
    
    console.log(`✅ Created super admin user: ${superAdminUser.email}`);

    // Create priority data
    console.log('Creating priority data...');
    await db.insert(priorities)
      .values([
        { name: 'Critical', level: 1, color: '#FF0000', description: 'Highest priority issues' },
        { name: 'High', level: 2, color: '#FF9900', description: 'High priority issues' },
        { name: 'Medium', level: 3, color: '#FFFF00', description: 'Medium priority issues' },
        { name: 'Low', level: 4, color: '#00FF00', description: 'Low priority issues' }
      ]);
    
    console.log('✅ Created priority data');

    // Create status data
    console.log('Creating status data...');
    await db.insert(statuses)
      .values([
        { name: 'Draft', category: 'test_case', color: '#808080', description: 'Test case is in draft state' },
        { name: 'Ready', category: 'test_case', color: '#00FF00', description: 'Test case is ready for execution' },
        { name: 'Obsolete', category: 'test_case', color: '#FF0000', description: 'Test case is obsolete' },
        { name: 'In Progress', category: 'test_run', color: '#0000FF', description: 'Test run is in progress' },
        { name: 'Completed', category: 'test_run', color: '#00FF00', description: 'Test run is completed' },
        { name: 'Cancelled', category: 'test_run', color: '#FF0000', description: 'Test run was cancelled' }
      ]);
    
    console.log('✅ Created status data');

    // Create a sample product
    console.log('Creating sample product...');
    const [demoProduct] = await db.insert(products)
      .values({
        name: 'Demo Product',
        description: 'This is a demonstration product for testing purposes',
        status: 'Active',
        owner: adminUser.id,
        tenantId: demoTenant.id
      })
      .returning();
    
    console.log(`✅ Created demo product with ID: ${demoProduct.id}`);

    // Create a sample module
    console.log('Creating sample module...');
    const [demoModule] = await db.insert(modules)
      .values({
        name: 'Login Module',
        description: 'Authentication and authorization functionality',
        moduleOwner: 'Jane Smith',
        manager: managerUser.fullName,
        developers: ['John Doe', 'Alice Johnson'],
        testers: [testerUser.fullName],
        status: 'Active',
        productId: demoProduct.id,
        tenantId: demoTenant.id
      })
      .returning();

    console.log(`✅ Created demo module with ID: ${demoModule.id}`);
    
    console.log('\nSample Login Data Summary:');
    console.log('==========================');
    console.log('Tenant: Demo Company');
    console.log('\nUsers:');
    console.log('- admin@demo.com / admin123 (Admin, Manager, Tester roles)');
    console.log('- manager@demo.com / manager123 (Manager, Tester roles)');
    console.log('- tester@demo.com / tester123 (Tester role)');
    console.log('- superadmin@zestfultest.com / superadmin123 (Super Admin role)');
    console.log('\nProduct: Demo Product');
    console.log('Module: Login Module');
    
    console.log('\n✅ All sample login data has been successfully created!');
    
  } catch (error) {
    console.error('❌ Error seeding login data:', error);
    throw error;
  }
}

// Run the seed function
seedLoginData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
    process.exit(1);
  });