# Demo Data Generation for Zestful Test Compass

This guide explains how to generate and manage demo data for the Zestful Test Compass application.

## Overview

The application includes scripts to populate the database with sample data, making it easier to:
- Test application functionality without manually creating data
- Demonstrate the application to stakeholders
- Set up development environments quickly
- Run automated tests against consistent data

## Available Seed Scripts

### Login Data Seed Script

The `seed-login-data.ts` script creates basic login credentials and related data:

- A demo tenant
- Users with various roles
- Priority and Status lookup data
- Sample Product and Module

#### Generated Demo Data

**Tenant:**
- Name: Demo Company
- Domain: demo.zestfultest.com
- Subscription: Enterprise plan (15 users, 10 projects)

**Users:**
| Email | Password | Roles |
|-------|----------|-------|
| admin@demo.com | admin123 | Admin, Manager, Tester |
| manager@demo.com | manager123 | Manager, Tester |
| tester@demo.com | tester123 | Tester |
| superadmin@zestfultest.com | superadmin123 | Super Admin |

**Lookup Data:**
- Priorities: Critical, High, Medium, Low
- Statuses: Draft, Ready, Obsolete (for test cases), In Progress, Completed, Cancelled (for test runs)

**Sample Entities:**
- Product: "Demo Product"
- Module: "Login Module"

## Running the Seed Scripts

Before running seed scripts, ensure:
1. The database is configured in your `.env` file
2. Database migrations have been applied

### To generate sample login data:

```bash
npx tsx server/seed-login-data.ts
```

## Extending the Demo Data

You can extend the seed scripts to create additional demo data like:
- Test cases
- Test suites
- Test plans
- Test runs
- Defects

To create your own seed script, follow this pattern:

1. Import the required dependencies and schema
2. Set up a main async function to insert data
3. Insert data in a logical order (respect foreign key constraints)
4. Handle errors appropriately
5. Log the results

Example structure for a custom seed script:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { yourSchemaTable } from '../shared/schema';
import { db } from './db';

dotenv.config();

async function seedCustomData() {
  console.log('Starting to seed custom data...');
  
  try {
    // Insert your data here
    const [result] = await db.insert(yourSchemaTable)
      .values({
        // Your values here
      })
      .returning();
    
    console.log(`✅ Created custom data with ID: ${result.id}`);
  } catch (error) {
    console.error('❌ Error seeding custom data:', error);
    throw error;
  }
}

seedCustomData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
    process.exit(1);
  });
```

## Best Practices for Demo Data

1. **Consistent Naming**: Use consistent naming conventions for demo entities
2. **Realistic Data**: Create realistic scenarios that reflect actual use cases
3. **Data Relationships**: Ensure proper relationships between entities
4. **Idempotent Scripts**: When possible, make scripts that can be run multiple times without duplicating data
5. **Cleanup Option**: Consider adding options to clean up demo data

## Clearing Demo Data

To clear demo data, you can:

1. Delete specific records using SQL or Drizzle ORM queries
2. Drop and recreate the database
3. Run migrations again to get a clean schema

Example cleanup script:

```bash
# PostgreSQL command to drop and recreate database
dropdb zestful_test_compass && createdb zestful_test_compass

# Then run migrations again
npx tsx server/migrate.ts
```