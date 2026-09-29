import {
  date, index, integer, numeric, pgEnum, pgTable, serial, text, timestamp, varchar, boolean,
} from "drizzle-orm/pg-core";

export const gender = pgEnum("gender", ["male", "female", "other"]);
export const visitStatus = pgEnum("visit_status", ["waiting", "in-consult", "dispensed", "paid", "completed"]);
export const payMethod = pgEnum("pay_method", ["cash", "mpesa", "sha", "insurance", "card"]);

const money = (name: string) => numeric(name, { precision: 12, scale: 2 });
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const patients = pgTable("patients", {
  id: serial().primaryKey(),
  opNumber: varchar("op_number", { length: 32 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 64 }).notNull(),
  gender: gender().notNull(),
  dob: date("dob").notNull(),
  residence: varchar({ length: 255 }),
  insurance: varchar({ length: 64 }).notNull().default("None (Cash)"),
  memberNo: varchar("member_no", { length: 64 }),
  allergies: text(),
  chronic: text(),
  balance: money("balance").notNull().default("0"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const drugs = pgTable("drugs", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  strength: varchar({ length: 64 }),
  form: varchar({ length: 128 }),
  category: varchar({ length: 64 }),
  sellPrice: money("sell_price").notNull(),
  reorderLevel: integer("reorder_level").notNull().default(10),
  supplier: varchar({ length: 255 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const drugBatches = pgTable(
  "drug_batches",
  {
    id: serial().primaryKey(),
    drugId: integer("drug_id").notNull().references(() => drugs.id, { onDelete: "cascade" }),
    batch: varchar({ length: 64 }).notNull(),
    expiry: date("expiry").notNull(),
    qty: integer("qty").notNull().default(0),
    buyPrice: money("buy_price").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("drug_batches_drug_idx").on(t.drugId), index("drug_batches_expiry_idx").on(t.expiry)],
);

export const services = pgTable("services", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 64 }).notNull(),
  price: money("price").notNull(),
});

export const labTests = pgTable("lab_tests", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 64 }),
  price: money("price").notNull(),
  tat: varchar({ length: 64 }),
});

export const visits = pgTable(
  "visits",
  {
    id: serial().primaryKey(),
    patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    time: varchar({ length: 16 }),
    reason: text("reason").notNull(),
    vitals: text("vitals"),
    status: visitStatus().notNull().default("waiting"),
    clinician: varchar({ length: 255 }),
    diagnosis: text(),
    createdAt: createdAt(),
  },
  (t) => [index("visits_patient_idx").on(t.patientId), index("visits_date_idx").on(t.date)],
);

export const sales = pgTable(
  "sales",
  {
    id: serial().primaryKey(),
    receiptNo: varchar("receipt_no", { length: 32 }).notNull().unique(),
    date: date("date").notNull(),
    patientId: integer("patient_id").references(() => patients.id, { onDelete: "set null" }),
    patientName: varchar("patient_name", { length: 255 }).notNull(),
    subtotal: money("subtotal").notNull(),
    discount: money("discount").notNull().default("0"),
    total: money("total").notNull(),
    etimsCu: varchar("etims_cu", { length: 64 }),
    cashier: varchar({ length: 128 }),
    createdAt: createdAt(),
  },
  (t) => [index("sales_date_idx").on(t.date)],
);

export const saleLines = pgTable(
  "sale_lines",
  {
    id: serial().primaryKey(),
    saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
    kind: varchar({ length: 16 }).notNull(),
    refId: integer("ref_id"),
    name: varchar({ length: 255 }).notNull(),
    qty: integer("qty").notNull(),
    price: money("price").notNull(),
  },
  (t) => [index("sale_lines_sale_idx").on(t.saleId)],
);

export const salePayments = pgTable(
  "sale_payments",
  {
    id: serial().primaryKey(),
    saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
    method: payMethod().notNull(),
    amount: money("amount").notNull(),
    ref: varchar({ length: 128 }),
  },
  (t) => [index("sale_payments_sale_idx").on(t.saleId)],
);

export const labOrders = pgTable(
  "lab_orders",
  {
    id: serial().primaryKey(),
    visitId: integer("visit_id").references(() => visits.id, { onDelete: "set null" }),
    patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
    testId: integer("test_id").references(() => labTests.id, { onDelete: "set null" }),
    testName: varchar("test_name", { length: 255 }).notNull(),
    price: money("price").notNull(),
    result: text(),
    done: boolean().notNull().default(false),
    date: date("date").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("lab_orders_patient_idx").on(t.patientId)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: serial().primaryKey(),
    reason: varchar({ length: 255 }).notNull(),
    amount: money("amount").notNull(),
    category: varchar({ length: 64 }),
    spentOn: date("spent_on").notNull(),
    by: varchar({ length: 128 }),
    createdAt: createdAt(),
  },
  (t) => [index("expenses_date_idx").on(t.spentOn)],
);

export const staff = pgTable("staff", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 128 }),
  phone: varchar({ length: 64 }),
  shift: varchar({ length: 32 }),
  salary: money("salary").notNull().default("0"),
});

export const suppliers = pgTable("suppliers", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 64 }),
  email: varchar({ length: 255 }),
  items: text(),
  balance: money("balance").notNull().default("0"),
});

export const facilitySettings = pgTable("facility_settings", {
  id: serial().primaryKey(),
  facilityName: varchar("facility_name", { length: 255 }),
  currencySymbol: varchar("currency_symbol", { length: 16 }),
  address: varchar({ length: 255 }),
  phone: varchar({ length: 64 }),
  paybill: varchar({ length: 64 }),
  tillNo: varchar("till_no", { length: 64 }),
  kraPin: varchar("kra_pin", { length: 32 }),
  etimsEnabled: boolean("etims_enabled").notNull().default(true),
});
