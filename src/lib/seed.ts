import type { DB } from "../types";

function d(offsetDays = 0): string {
  const t = new Date();
  t.setDate(t.getDate() + offsetDays);
  return t.toISOString().slice(0, 10);
}

function t(): string {
  return new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export function seedDB(): DB {
  return {
    patients: [
      { id: "pt-1", opNumber: "OP-1001", name: "Amina Hassan", phone: "0712 445 901", gender: "female", dob: "1994-03-12", age: 32, idNumber: "33445566", residence: "Kileleshwa", nextOfKin: "Yusuf Hassan", kinPhone: "0733 112 008", insurance: "SHA", memberNo: "SHA-88213", allergies: "Penicillin", chronic: "Asthma", balance: 1250, createdAt: d(-40) },
      { id: "pt-2", opNumber: "OP-1002", name: "Brian Otieno", phone: "0722 908 334", gender: "male", dob: "2018-07-02", age: 8, idNumber: "", residence: "Kawangware", nextOfKin: "Mercy Otieno", kinPhone: "0722 908 335", insurance: "None (Cash)", memberNo: "", allergies: "None", chronic: "None", balance: 0, createdAt: d(-31) },
      { id: "pt-3", opNumber: "OP-1003", name: "Wanjiku Mwangi", phone: "0734 221 109", gender: "female", dob: "1981-11-25", age: 44, idNumber: "22114455", residence: "Lavington", nextOfKin: "Kamau Mwangi", kinPhone: "0720 555 781", insurance: "Jubilee", memberNo: "JUB-44120", allergies: "Sulfa", chronic: "Hypertension", balance: 3800, createdAt: d(-22) },
      { id: "pt-4", opNumber: "OP-1004", name: "Daniel Kiprop", phone: "0715 556 559", gender: "male", dob: "1975-01-30", age: 51, idNumber: "11223344", residence: "Ngong Rd", nextOfKin: "Faith Kiprop", kinPhone: "0715 556 560", insurance: "SHA", memberNo: "SHA-10987", allergies: "None", chronic: "Diabetes T2", balance: 0, createdAt: d(-9) },
      { id: "pt-5", opNumber: "OP-1005", name: "Zawadi Mkenya", phone: "0701 334 882", gender: "female", dob: "2001-05-19", age: 25, idNumber: "44556677", residence: "Dagoretti", nextOfKin: "Baraka Mkenya", kinPhone: "0701 334 883", insurance: "None (Cash)", memberNo: "", allergies: "None", chronic: "None", balance: 600, createdAt: d(-2) },
    ],
    drugs: [
      { id: "dr-1", name: "Amoxicillin 500mg", strength: "500mg", form: "Capsules ×20", category: "Antibiotic", basePrice: 210, sellPrice: 350, reorderLevel: 40, supplier: "Cosmos Ltd", batches: [{ batch: "AMX-2401", manufactured: d(-280), expiry: d(120), qty: 140, buyPrice: 210 }, { batch: "AMX-2311", manufactured: d(-420), expiry: d(38), qty: 22, buyPrice: 205 }] },
      { id: "dr-2", name: "Paracetamol 500mg", strength: "500mg", form: "Tablets ×100", category: "Analgesic", basePrice: 140, sellPrice: 250, reorderLevel: 60, supplier: "Lab & Allied", batches: [{ batch: "PCM-2502", manufactured: d(-90), expiry: d(300), qty: 320, buyPrice: 140 }] },
      { id: "dr-3", name: "ORS Sachets", strength: "27.9g", form: "Sachets ×50", category: "Rehydration", basePrice: 170, sellPrice: 300, reorderLevel: 30, supplier: "Universal Corp", batches: [{ batch: "ORS-2409", manufactured: d(-340), expiry: d(25), qty: 18, buyPrice: 170 }] },
      { id: "dr-4", name: "Metformin 850mg", strength: "850mg", form: "Tablets ×60", category: "Antidiabetic", basePrice: 300, sellPrice: 480, reorderLevel: 25, supplier: "Cosmos Ltd", batches: [{ batch: "MET-2412", manufactured: d(-60), expiry: d(400), qty: 90, buyPrice: 300 }] },
      { id: "dr-5", name: "Amlodipine 5mg", strength: "5mg", form: "Tablets ×30", category: "Antihypertensive", basePrice: 190, sellPrice: 320, reorderLevel: 25, supplier: "GSK Kenya", batches: [{ batch: "AML-2405", manufactured: d(-200), expiry: d(210), qty: 12, buyPrice: 190 }] },
      { id: "dr-6", name: "Ventolin Inhaler", strength: "100mcg", form: "Inhaler 200 doses", category: "Respiratory", basePrice: 620, sellPrice: 950, reorderLevel: 10, supplier: "GSK Kenya", batches: [{ batch: "VEN-2403", manufactured: d(-150), expiry: d(500), qty: 26, buyPrice: 620 }] },
      { id: "dr-7", name: "Ciprofloxacin 500mg", strength: "500mg", form: "Tablets ×14", category: "Antibiotic", basePrice: 260, sellPrice: 420, reorderLevel: 30, supplier: "Lab & Allied", batches: [{ batch: "CIP-2312", manufactured: d(-310), expiry: d(52), qty: 44, buyPrice: 260 }] },
      { id: "dr-8", name: "Zinc 20mg + Vit A", strength: "20mg", form: "Tablets ×10 (Child)", category: "Supplement", basePrice: 95, sellPrice: 180, reorderLevel: 50, supplier: "Universal Corp", batches: [{ batch: "ZNC-2501", manufactured: d(-40), expiry: d(330), qty: 210, buyPrice: 95 }] },
    ],
    services: [
      { id: "sv-1", name: "General Consultation — Adult", category: "consultation", price: 800 },
      { id: "sv-2", name: "Paediatric Consultation", category: "consultation", price: 1000 },
      { id: "sv-3", name: "Specialist Review (Obs/Gyn)", category: "consultation", price: 2000 },
      { id: "sv-4", name: "Wound Dressing", category: "procedure", price: 500 },
      { id: "sv-5", name: "IV Drip Administration", category: "procedure", price: 1200 },
      { id: "sv-6", name: "Nebulization Session", category: "procedure", price: 700 },
      { id: "sv-7", name: "Antenatal Visit (ANC)", category: "consultation", price: 600 },
      { id: "sv-8", name: "Day Ward Observation", category: "ward", price: 2500 },
    ],
    labTests: [
      { id: "lb-1", name: "Full Haemogram", category: "Haematology", price: 900, tat: "2 hrs" },
      { id: "lb-2", name: "Malaria RDT (mRDT)", category: "Parasitology", price: 350, tat: "20 min" },
      { id: "lb-3", name: "Urinalysis", category: "Clinical chemistry", price: 400, tat: "1 hr" },
      { id: "lb-4", name: "HbA1c (Diabetes)", category: "Clinical chemistry", price: 1500, tat: "Same day" },
      { id: "lb-5", name: "Typhoid (Widal + Culture)", category: "Microbiology", price: 800, tat: "Same day" },
      { id: "lb-6", name: "Pregnancy Test (hCG)", category: "Serology", price: 300, tat: "15 min" },
    ],
    visits: [
      { id: "vs-1", patientId: "pt-1", date: d(0), time: "08:12", reason: "Chest tightness, wheezing", vitals: { temp: "37.1°C", bp: "118/76", pulse: "96", weight: "64kg", spo2: "97%" }, status: "in-consult", clinician: "Dr. N. Achieng", diagnosis: "Asthma exacerbation — mild", prescriptionIds: ["rx-1"], labOrderIds: [] },
      { id: "vs-2", patientId: "pt-2", date: d(0), time: "08:40", reason: "Fever + vomiting, 2 days", vitals: { temp: "38.9°C", bp: "—", pulse: "118", weight: "22kg", spo2: "98%" }, status: "waiting", clinician: "", diagnosis: "", prescriptionIds: [], labOrderIds: ["lo-1"] },
      { id: "vs-3", patientId: "pt-3", date: d(0), time: "09:05", reason: "BP review + refill", vitals: { temp: "36.7°C", bp: "148/92", pulse: "82", weight: "78kg", spo2: "99%" }, status: "dispensed", clinician: "Dr. K. Mutua", diagnosis: "Hypertension — uncontrolled", prescriptionIds: ["rx-2"], labOrderIds: ["lo-2"] },
      { id: "vs-4", patientId: "pt-4", date: d(-1), time: "14:20", reason: "Diabetes review", vitals: { temp: "36.8°C", bp: "132/84", pulse: "78", weight: "84kg", spo2: "98%" }, status: "completed", clinician: "Dr. N. Achieng", diagnosis: "Diabetes T2 — stable", prescriptionIds: ["rx-3"], labOrderIds: ["lo-3"] },
    ],
    prescriptions: [
      { id: "rx-1", visitId: "vs-1", patientId: "pt-1", drugId: "dr-6", drugName: "Ventolin Inhaler", dose: "2 puffs q6h PRN", qty: 1, dispensed: true, date: d(0) },
      { id: "rx-2", visitId: "vs-3", patientId: "pt-3", drugId: "dr-5", drugName: "Amlodipine 5mg", dose: "1 tab OD", qty: 30, dispensed: false, date: d(0) },
      { id: "rx-3", visitId: "vs-4", patientId: "pt-4", drugId: "dr-4", drugName: "Metformin 850mg", dose: "1 tab BD", qty: 60, dispensed: true, date: d(-1) },
    ],
    labOrders: [
      { id: "lo-1", visitId: "vs-2", patientId: "pt-2", testId: "lb-2", testName: "Malaria RDT (mRDT)", price: 350, result: "", done: false, date: d(0) },
      { id: "lo-2", visitId: "vs-3", patientId: "pt-3", testId: "lb-1", testName: "Full Haemogram", price: 900, result: "Hb 12.4, WBC normal", done: true, date: d(0) },
      { id: "lo-3", visitId: "vs-4", patientId: "pt-4", testId: "lb-4", testName: "HbA1c (Diabetes)", price: 1500, result: "7.1% — fair control", done: true, date: d(-1) },
    ],
    sales: [
      { id: "sa-1", receiptNo: "RCT-000121", date: d(-1), time: "15:02", patientId: "pt-4", patientName: "Daniel Kiprop", walkIn: false, lines: [{ key: "sv-1", kind: "service", refId: "sv-1", name: "General Consultation — Adult", qty: 1, basePrice: 800, price: 800 }, { key: "lb-4", kind: "lab", refId: "lb-4", name: "HbA1c (Diabetes)", qty: 1, basePrice: 1500, price: 1500 }, { key: "dr-4", kind: "drug", refId: "dr-4", name: "Metformin 850mg", qty: 1, basePrice: 300, price: 480 }], subtotal: 2780, discount: 0, total: 2780, payments: [{ method: "mpesa", amount: 2780, ref: "QK7X2AB11D" }], cashier: "Reception — Faith", etimsCu: "CU-88213-01" },
      { id: "sa-2", receiptNo: "RCT-000122", date: d(0), time: "09:44", patientId: null, patientName: "Walk-in", walkIn: true, lines: [{ key: "dr-2", kind: "drug", refId: "dr-2", name: "Paracetamol 500mg", qty: 2, basePrice: 140, price: 250 }], subtotal: 500, discount: 0, total: 500, payments: [{ method: "cash", amount: 500, ref: "" }], cashier: "Pharmacy — Brian", etimsCu: "CU-88213-02" },
    ],
    expenses: [
      { id: "ex-1", reason: "Gloves + syringes restock", amount: 8400, category: "Consumables", spentOn: d(-3), by: "Admin" },
      { id: "ex-2", reason: "Lab reagents — mRDT kits ×100", amount: 15000, category: "Lab", spentOn: d(-1), by: "Lab tech" },
      { id: "ex-3", reason: "Generator diesel 40L", amount: 7200, category: "Utilities", spentOn: d(0), by: "Admin" },
    ],
    staff: [
      { id: "st-1", name: "Dr. N. Achieng", role: "Clinical Officer", phone: "0720 111 222", shift: "Day", salary: 95000 },
      { id: "st-2", name: "Dr. K. Mutua", role: "Medical Officer", phone: "0733 444 555", shift: "Day", salary: 140000 },
      { id: "st-3", name: "Faith W.", role: "Receptionist / Cashier", phone: "0711 222 333", shift: "Day", salary: 38000 },
      { id: "st-4", name: "Brian K.", role: "Pharm Tech", phone: "0722 777 888", shift: "Day", salary: 52000 },
      { id: "st-5", name: "Night Nurse — J. Barasa", role: "Nurse", phone: "0700 999 111", shift: "Night", salary: 60000 },
    ],
    suppliers: [
      { id: "sp-1", name: "Cosmos Ltd", phone: "020 222 3344", email: "orders@cosmos.co.ke", items: "Amoxicillin, Metformin", balance: 24500 },
      { id: "sp-2", name: "Lab & Allied", phone: "020 555 6677", email: "sales@laballied.co.ke", items: "Paracetamol, Ciprofloxacin", balance: 12000 },
      { id: "sp-3", name: "GSK Kenya", phone: "020 888 9900", email: "ke@gsk.com", items: "Ventolin, Amlodipine", balance: 0 },
    ],
    settings: {
      facilityName: "BuraPesa Medical Centre",
      currencySymbol: "KSh",
      address: "Suite 03 Laikipia Road, Kileleshwa, Nairobi",
      phone: "+254 715 556 559",
      paybill: "522522 · Acc 118822",
      tillNo: "Buy Goods 886644",
      kraPin: "P05188213X",
      etimsEnabled: true,
      shaEnabled: true,
    },
    receiptSeq: 123,
    reports: [],
  };
}

export { d, t };
