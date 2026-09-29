CREATE TYPE "gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "pay_method" AS ENUM('cash', 'mpesa', 'sha', 'insurance', 'card');--> statement-breakpoint
CREATE TYPE "visit_status" AS ENUM('waiting', 'in-consult', 'dispensed', 'paid', 'completed');--> statement-breakpoint
CREATE TABLE "drug_batches" (
	"id" serial PRIMARY KEY,
	"drug_id" integer NOT NULL,
	"batch" varchar(64) NOT NULL,
	"expiry" date NOT NULL,
	"qty" integer DEFAULT 0 NOT NULL,
	"buy_price" numeric(12,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"strength" varchar(64),
	"form" varchar(128),
	"category" varchar(64),
	"sell_price" numeric(12,2) NOT NULL,
	"reorder_level" integer DEFAULT 10 NOT NULL,
	"supplier" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY,
	"reason" varchar(255) NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"category" varchar(64),
	"spent_on" date NOT NULL,
	"by" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_settings" (
	"id" serial PRIMARY KEY,
	"facility_name" varchar(255),
	"currency_symbol" varchar(16),
	"address" varchar(255),
	"phone" varchar(64),
	"paybill" varchar(64),
	"till_no" varchar(64),
	"kra_pin" varchar(32),
	"etims_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" serial PRIMARY KEY,
	"visit_id" integer,
	"patient_id" integer NOT NULL,
	"test_id" integer,
	"test_name" varchar(255) NOT NULL,
	"price" numeric(12,2) NOT NULL,
	"result" text,
	"done" boolean DEFAULT false NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_tests" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"category" varchar(64),
	"price" numeric(12,2) NOT NULL,
	"tat" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY,
	"op_number" varchar(32) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"phone" varchar(64) NOT NULL,
	"gender" "gender" NOT NULL,
	"dob" date NOT NULL,
	"residence" varchar(255),
	"insurance" varchar(64) DEFAULT 'None (Cash)' NOT NULL,
	"member_no" varchar(64),
	"allergies" text,
	"chronic" text,
	"balance" numeric(12,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_lines" (
	"id" serial PRIMARY KEY,
	"sale_id" integer NOT NULL,
	"kind" varchar(16) NOT NULL,
	"ref_id" integer,
	"name" varchar(255) NOT NULL,
	"qty" integer NOT NULL,
	"price" numeric(12,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_payments" (
	"id" serial PRIMARY KEY,
	"sale_id" integer NOT NULL,
	"method" "pay_method" NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"ref" varchar(128)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY,
	"receipt_no" varchar(32) NOT NULL UNIQUE,
	"date" date NOT NULL,
	"patient_id" integer,
	"patient_name" varchar(255) NOT NULL,
	"subtotal" numeric(12,2) NOT NULL,
	"discount" numeric(12,2) DEFAULT '0' NOT NULL,
	"total" numeric(12,2) NOT NULL,
	"etims_cu" varchar(64),
	"cashier" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"price" numeric(12,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"role" varchar(128),
	"phone" varchar(64),
	"shift" varchar(32),
	"salary" numeric(12,2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"phone" varchar(64),
	"email" varchar(255),
	"items" text,
	"balance" numeric(12,2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" serial PRIMARY KEY,
	"patient_id" integer NOT NULL,
	"date" date NOT NULL,
	"time" varchar(16),
	"reason" text NOT NULL,
	"vitals" text,
	"status" "visit_status" DEFAULT 'waiting'::"visit_status" NOT NULL,
	"clinician" varchar(255),
	"diagnosis" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "drug_batches_drug_idx" ON "drug_batches" ("drug_id");--> statement-breakpoint
CREATE INDEX "drug_batches_expiry_idx" ON "drug_batches" ("expiry");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" ("spent_on");--> statement-breakpoint
CREATE INDEX "lab_orders_patient_idx" ON "lab_orders" ("patient_id");--> statement-breakpoint
CREATE INDEX "sale_lines_sale_idx" ON "sale_lines" ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_payments_sale_idx" ON "sale_payments" ("sale_id");--> statement-breakpoint
CREATE INDEX "sales_date_idx" ON "sales" ("date");--> statement-breakpoint
CREATE INDEX "visits_patient_idx" ON "visits" ("patient_id");--> statement-breakpoint
CREATE INDEX "visits_date_idx" ON "visits" ("date");--> statement-breakpoint
ALTER TABLE "drug_batches" ADD CONSTRAINT "drug_batches_drug_id_drugs_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_visit_id_visits_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_test_id_lab_tests_id_fkey" FOREIGN KEY ("test_id") REFERENCES "lab_tests"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "sale_lines" ADD CONSTRAINT "sale_lines_sale_id_sales_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_id_sales_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;