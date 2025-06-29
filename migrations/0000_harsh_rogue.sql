CREATE TABLE "defects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'Open' NOT NULL,
	"test_run_id" text,
	"test_case_id" uuid,
	"reproduction_steps" text NOT NULL,
	"assigned_to" uuid,
	"reported_by" uuid NOT NULL,
	"environment" text NOT NULL,
	"tenant_id" uuid,
	"created_date" timestamp DEFAULT now(),
	"resolved_date" timestamp,
	"attachments" json
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"module_owner" text NOT NULL,
	"manager" text NOT NULL,
	"developers" json,
	"testers" json,
	"created_date" timestamp DEFAULT now(),
	"status" text DEFAULT 'Active' NOT NULL,
	"product_id" uuid NOT NULL,
	"tenant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_date" timestamp DEFAULT now(),
	CONSTRAINT "priorities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"test_cases" integer DEFAULT 0,
	"test_runs" integer DEFAULT 0,
	"team_members" integer DEFAULT 0,
	"coverage" integer DEFAULT 0,
	"last_activity" text,
	"created_date" timestamp DEFAULT now(),
	"owner" uuid NOT NULL,
	"tenant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"subscription_status" varchar(50) DEFAULT 'active' NOT NULL,
	"subscription_plan" varchar(50) DEFAULT 'basic' NOT NULL,
	"max_users" integer DEFAULT 10,
	"max_projects" integer DEFAULT 5,
	"created_date" timestamp DEFAULT now(),
	"updated_date" timestamp DEFAULT now(),
	"created_by" uuid,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "test_case_data_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"test_case_id" uuid NOT NULL,
	"test_data_set_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"tenant_id" uuid,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_case_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_run_id" text NOT NULL,
	"test_case_id" uuid NOT NULL,
	"status" text DEFAULT 'Not Run' NOT NULL,
	"executed_by" uuid,
	"executed_date" timestamp,
	"execution_time" integer,
	"actual_result" text,
	"notes" text,
	"defect_ids" json,
	"screenshots" json,
	"tenant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority_id" uuid,
	"status_id" uuid,
	"steps" json,
	"expected_result" text,
	"product_id" uuid NOT NULL,
	"module_id" uuid,
	"tenant_id" uuid,
	"created_date" timestamp DEFAULT now(),
	"last_run" timestamp,
	"estimated_time" integer
);
--> statement-breakpoint
CREATE TABLE "test_data_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"product_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"data" json DEFAULT '[]'::json,
	"tenant_id" uuid,
	"created_by" uuid NOT NULL,
	"created_date" timestamp DEFAULT now(),
	"last_modified" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"objectives" json,
	"scope" text NOT NULL,
	"test_suite_ids" json,
	"assigned_team_members" json,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'Draft' NOT NULL,
	"priority" text NOT NULL,
	"product_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"test_strategy" text NOT NULL,
	"entry_exit_criteria" json,
	"deliverables" json,
	"risks" json,
	"tenant_id" uuid,
	"created_by" uuid NOT NULL,
	"created_date" timestamp DEFAULT now(),
	"last_modified" timestamp DEFAULT now(),
	"estimated_effort" integer DEFAULT 0,
	"actual_effort" integer,
	"progress" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "test_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"test_plan_id" text NOT NULL,
	"test_suite_ids" json,
	"assigned_to" uuid NOT NULL,
	"status" text DEFAULT 'Not Started' NOT NULL,
	"priority" text NOT NULL,
	"environment" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"actual_start_date" timestamp,
	"actual_end_date" timestamp,
	"progress" integer DEFAULT 0,
	"total_test_cases" integer DEFAULT 0,
	"executed_test_cases" integer DEFAULT 0,
	"passed_test_cases" integer DEFAULT 0,
	"failed_test_cases" integer DEFAULT 0,
	"blocked_test_cases" integer DEFAULT 0,
	"skipped_test_cases" integer DEFAULT 0,
	"estimated_hours" integer DEFAULT 0,
	"actual_hours" integer,
	"tenant_id" uuid,
	"created_by" uuid NOT NULL,
	"created_date" timestamp DEFAULT now(),
	"last_modified" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_suites" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"product_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"test_case_ids" text[] DEFAULT '{}',
	"status" text DEFAULT 'Active' NOT NULL,
	"tenant_id" uuid,
	"created_date" timestamp DEFAULT now(),
	"last_modified" timestamp DEFAULT now(),
	"owner" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"roles" json,
	"status" text DEFAULT 'Active' NOT NULL,
	"tenant_id" uuid,
	"created_date" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "defects" ADD CONSTRAINT "defects_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "defects" ADD CONSTRAINT "defects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_data_mappings" ADD CONSTRAINT "test_case_data_mappings_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_data_mappings" ADD CONSTRAINT "test_case_data_mappings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_executions" ADD CONSTRAINT "test_case_executions_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_executions" ADD CONSTRAINT "test_case_executions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_priority_id_priorities_id_fk" FOREIGN KEY ("priority_id") REFERENCES "public"."priorities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_data_sets" ADD CONSTRAINT "test_data_sets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_suites" ADD CONSTRAINT "test_suites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;