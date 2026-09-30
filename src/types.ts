export type PayMethod = "cash" | "mpesa" | "sha" | "insurance" | "card";
export type VisitStatus = "waiting" | "in-consult" | "dispensed" | "paid" | "completed";
export type Gender = "male" | "female" | "other";

export type Patient = {
  id: string;
  opNumber: string;
  name: string;
  phone: string;
  gender: Gender;
  dob: string;
  age: number;
  idNumber: string;
  residence: string;
  nextOfKin: string;
  kinPhone: string;
  insurance: string; // e.g. SHA, Jubilee, none
  memberNo: string;
  allergies: string;
  chronic: string;
  balance: number;
  createdAt: string;
};

export type DrugBatch = {
  batch: string;
  manufactured: string;
  expiry: string;
  qty: number;
  buyPrice: number;
};

export type Drug = {
  id: string;
  name: string;
  strength: string;
  form: string; // tablets, syrup, injection…
  category: string;
  basePrice: number;
  sellPrice: number;
  reorderLevel: number;
  batches: DrugBatch[];
  supplier: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  category: "consultation" | "procedure" | "lab" | "imaging" | "ward" | "other";
  price: number;
};

export type LabTest = {
  id: string;
  name: string;
  category: string;
  price: number;
  tat: string;
};

export type Visit = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  vitals: { temp: string; bp: string; pulse: string; weight: string; spo2: string };
  status: VisitStatus;
  clinician: string;
  diagnosis: string;
  prescriptionIds: string[];
  labOrderIds: string[];
};

export type Prescription = {
  id: string;
  visitId: string;
  patientId: string;
  drugId: string;
  drugName: string;
  dose: string;
  qty: number;
  dispensed: boolean;
  date: string;
};

export type LabOrder = {
  id: string;
  visitId: string;
  patientId: string;
  testId: string;
  testName: string;
  price: number;
  result: string;
  done: boolean;
  date: string;
};

export type CartLine = {
  key: string;
  kind: "drug" | "service" | "lab";
  refId: string;
  name: string;
  qty: number;
  basePrice: number;
  price: number;
};

export type Sale = {
  id: string;
  receiptNo: string;
  date: string;
  time: string;
  patientId: string | null;
  patientName: string;
  walkIn: boolean;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  payments: { method: PayMethod; amount: number; ref: string }[];
  cashier: string;
  etimsCu: string;
};

export type Expense = {
  id: string;
  reason: string;
  amount: number;
  category: string;
  spentOn: string;
  by: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
  salary: number;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  items: string;
  balance: number;
};

export type Settings = {
  facilityName: string;
  currencySymbol: string;
  address: string;
  phone: string;
  paybill: string;
  tillNo: string;
  kraPin: string;
  etimsEnabled: boolean;
  shaEnabled: boolean;
};

export type SavedReport = {
  id: string;
  createdAt: string;
  title: string;
  revenue: number;
  expenses: number;
  net: number;
  patients: number;
  visits: number;
  sales: number;
};

export type DB = {
  patients: Patient[];
  drugs: Drug[];
  services: ServiceItem[];
  labTests: LabTest[];
  visits: Visit[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  sales: Sale[];
  expenses: Expense[];
  staff: Staff[];
  suppliers: Supplier[];
  settings: Settings;
  receiptSeq: number;
  reports: SavedReport[];
};
