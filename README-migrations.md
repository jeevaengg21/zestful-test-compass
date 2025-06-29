# Database Migration Guide for Zestful Test Compass

This guide describes how to manage database migrations in the Zestful Test Compass application using Drizzle ORM.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Basic Workflow](#basic-workflow)
- [Common Scenarios](#common-scenarios)
  - [Adding a New Table](#adding-a-new-table)
  - [Modifying an Existing Table](#modifying-an-existing-table)
  - [Adding Relationships](#adding-relationships)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This project uses:
- **Drizzle ORM**: Type-safe ORM for TypeScript
- **PostgreSQL**: Database engine
- **Migration System**: For versioned database schema changes

## Prerequisites

- Node.js installed
- PostgreSQL database running
- Database connection configured in `.env` file

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zestful_test_compass
```

## Basic Workflow

The basic workflow for making database changes consists of three steps:

1. **Modify Schema**: Update the schema definitions in `shared/schema.ts`
2. **Generate Migrations**: Create SQL migration files based on schema changes
3. **Apply Migrations**: Run the migrations to update the database structure

### 1. Modify Schema

Edit the `shared/schema.ts` file to define your database structure changes.

### 2. Generate Migrations

Run the following command to generate SQL migration files based on the changes:

```bash
npx drizzle-kit generate
```

This will create migration files in the `migrations/` directory.

### 3. Apply Migrations

Run the migration script to apply changes to the database:

```bash
npx tsx server/migrate.ts
```

## Common Scenarios

### Adding a New Table

#### Example: Adding a Comments Table

1. **Step 1**: Add the table definition to `shared/schema.ts`:

```typescript
// Add this to your schema.ts file
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  testCaseId: uuid("test_case_id").references(() => testCases.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
});

// Add the insert schema
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add TypeScript types
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
```

2. **Step 2**: Generate the migration:

```bash
npx drizzle-kit generate
```

This will create a new migration file like `migrations/0001_new_comments.sql` with SQL to create the table.

3. **Step 3**: Apply the migration:

```bash
npx tsx server/migrate.ts
```

4. **Step 4**: Update your storage.ts file to add functions to interact with the new table:

```typescript
async createComment(data: InsertComment, tenantId: string): Promise<Comment> {
  return await db.insert(comments)
    .values({
      ...data,
      tenantId
    })
    .returning();
}

async getCommentsByTestCase(testCaseId: string, tenantId: string): Promise<Comment[]> {
  return await db.select().from(comments)
    .where(and(
      eq(comments.testCaseId, testCaseId),
      eq(comments.tenantId, tenantId)
    ));
}
```

### Modifying an Existing Table

#### Example: Adding a Field to Test Cases

1. **Step 1**: Update the table definition in `shared/schema.ts`:

```typescript
// Update the testCases table to add an automationStatus field
export const testCases = pgTable("test_cases", {
  // ...existing fields...
  estimatedTime: integer("estimated_time"),
  automationStatus: text("automation_status").default("Manual").notNull(), // Add this new field
});

// Update the insert schema to include the new field
export const insertTestCaseSchema = createInsertSchema(testCases).omit({
  id: true,
  createdDate: true,
  lastRun: true,
});
```

2. **Step 2**: Generate the migration:

```bash
npx drizzle-kit generate
```

This will create a new migration file with `ALTER TABLE` statements to add the column.

3. **Step 3**: Apply the migration:

```bash
npx tsx server/migrate.ts
```

### Adding Relationships

#### Example: Creating a Many-to-Many Relationship

1. **Step 1**: Add a join table to `shared/schema.ts`:

```typescript
// Create a join table for test cases and tags
export const testCaseTags = pgTable("test_case_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  testCaseId: uuid("test_case_id").notNull().references(() => testCases.id),
  tagId: uuid("tag_id").notNull().references(() => tags.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdDate: timestamp("created_date").defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#666666"),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
});

// Add the insert schemas
export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export const insertTestCaseTagSchema = createInsertSchema(testCaseTags).omit({
  id: true,
  createdDate: true,
});

// Add TypeScript types
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTestCaseTag = z.infer<typeof insertTestCaseTagSchema>;
export type TestCaseTag = typeof testCaseTags.$inferSelect;
```

2. **Step 2**: Generate the migration:

```bash
npx drizzle-kit generate
```

3. **Step 3**: Apply the migration:

```bash
npx tsx server/migrate.ts
```

4. **Step 4**: Add functions to your storage.ts file to manage the relationship:

```typescript
async addTagsToTestCase(testCaseId: string, tagIds: string[], tenantId: string): Promise<void> {
  const values = tagIds.map(tagId => ({
    testCaseId,
    tagId,
    tenantId
  }));
  
  await db.insert(testCaseTags).values(values);
}

async getTagsByTestCase(testCaseId: string, tenantId: string): Promise<Tag[]> {
  return await db.select({
    id: tags.id,
    name: tags.name,
    color: tags.color,
  })
  .from(tags)
  .innerJoin(testCaseTags, and(
    eq(tags.id, testCaseTags.tagId),
    eq(testCaseTags.testCaseId, testCaseId),
    eq(testCaseTags.tenantId, tenantId)
  ))
  .where(eq(tags.tenantId, tenantId));
}
```

## Troubleshooting

### Common Issues

1. **Migration fails with foreign key errors**:
   - Ensure tables are created in the correct order
   - Check that referenced tables exist before creating references

2. **Migration conflicts**:
   - If working in a team, coordinate migration merges
   - Consider using a stable branch for schema changes

3. **Type errors after schema changes**:
   - Update your TypeScript types after schema modifications
   - Check for usage of old types in your codebase

### Rollback Strategies

Currently, Drizzle ORM doesn't provide built-in rollback functionality. Consider:

- Maintaining manual down migrations in separate files
- Creating database backups before major schema changes
- Testing migrations in development/staging environments first

## Best Practices

1. **Keep migrations small and focused**
   - Each migration should handle a specific change
   - Easier to debug and rollback if needed

2. **Document major schema changes**
   - Add comments to complex migrations
   - Update entity relationship diagrams

3. **Version control your migrations**
   - Always commit migration files with their related schema changes
   - Never modify a migration file that has been applied to any environment

4. **Test migrations thoroughly**
   - Run migrations on a test database before production
   - Verify both the structure and data integrity after migration

5. **Plan for data migrations**
   - Schema changes may require data transformations
   - Consider writing custom data migration scripts when needed