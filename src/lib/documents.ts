import { formatMoney } from "../../shared/format";
import { drugBase, drugStock } from "./store";
import type { DB, Patient, Supplier } from "../types";

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch] ?? ch));
}

function openPrint(title: string, body: string): boolean {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f7f6; color: #2a2a28; font-family: "Segoe UI", system-ui, sans-serif; }
  .sheet { max-width: 820px; margin: 0 auto; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; overflow: hidden; }
  header.banner { background: #1c2420; color: #f2f2f0; padding: 28px 32px 22px; }
  .eyebrow { margin: 0; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #9cb39e; }
  h1 { margin: 8px 0 0; font-family: Georgia, serif; font-weight: 500; font-style: italic; font-size: 32px; letter-spacing: -0.02em; }
  .meta { margin: 8px 0 0; color: #c8c8c6; font-size: 13px; }
  .body { padding: 24px 32px 32px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 0 22px; }
  .stat { border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 12px 14px; }
  .stat span { display: block; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #6a6a68; }
  .stat strong { display: block; margin-top: 4px; font-family: ui-monospace, monospace; font-size: 16px; }
  h2 { margin: 22px 0 8px; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #527057; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #6a6a68; padding: 8px 8px; border-bottom: 1px solid rgba(0,0,0,0.1); }
  td { padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); vertical-align: top; }
  td.num, th.num { text-align: right; font-family: ui-monospace, monospace; }
  .total-row td { border-bottom: 0; font-weight: 700; padding-top: 12px; }
  footer.note { margin-top: 22px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08); color: #6a6a68; font-size: 12px; }
  @media print {
    body { background: #fff; }
    .sheet { border: 0; border-radius: 0; }
  }
</style></head><body><div class="sheet">${body}</div></body></html>`;
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

export function lineBase(db: DB, line: { refId: string; kind: string; price: number; basePrice?: number }): number {
  if (typeof line.basePrice === "number") return line.basePrice;
  if (line.kind === "drug") {
    const drug = db.drugs.find((d) => d.id === line.refId);
    if (drug) return drugBase(drug);
  }
  return line.price;
}

export function printPatientInvoice(db: DB, patient: Patient): boolean {
  const sym = db.settings.currencySymbol;
  const money = (n: number) => formatMoney(n, sym);
  const sales = db.sales.filter((s) => s.patientId === patient.id);
  const lines = sales.flatMap((s) => s.lines.map((l) => ({
    date: s.date,
    receipt: s.receiptNo,
    name: l.name,
    qty: l.qty,
    price: l.price,
    amount: l.qty * l.price,
  })));
  const billed = lines.reduce((a, l) => a + l.amount, 0);
  const paid = sales.reduce((a, s) => a + s.payments.reduce((x, p) => x + p.amount, 0), 0);
  const when = new Date().toLocaleString("en-KE");
  const no = `INV-${patient.opNumber}-${Date.now().toString(36).toUpperCase()}`;
  const rows = lines.length
    ? lines.map((l) => `<tr><td>${esc(l.date)}</td><td>${esc(l.receipt)}</td><td>${esc(l.name)}</td><td class="num">${l.qty}</td><td class="num">${esc(money(l.price))}</td><td class="num">${esc(money(l.amount))}</td></tr>`).join("")
    : `<tr><td colspan="6">No receipts yet. Outstanding balance is shown below.</td></tr>`;

  return openPrint(`Invoice ${patient.name}`, `
    <header class="banner">
      <p class="eyebrow">${esc(db.settings.facilityName)}</p>
      <h1>Patient invoice</h1>
      <p class="meta">${esc(no)} · ${esc(when)}</p>
    </header>
    <div class="body">
      <div class="stats">
        <div class="stat"><span>Patient</span><strong>${esc(patient.name)}</strong></div>
        <div class="stat"><span>File</span><strong>${esc(patient.opNumber)}</strong></div>
        <div class="stat"><span>Cover</span><strong>${esc(patient.insurance || "Cash")}</strong></div>
        <div class="stat"><span>Balance due</span><strong>${esc(money(patient.balance))}</strong></div>
      </div>
      <p>${esc(patient.phone)} · ${esc(patient.residence || "—")}</p>
      <h2>Charges</h2>
      <table>
        <thead><tr><th>Date</th><th>Receipt</th><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row"><td colspan="5">Billed</td><td class="num">${esc(money(billed))}</td></tr>
          <tr class="total-row"><td colspan="5">Paid</td><td class="num">${esc(money(paid))}</td></tr>
          <tr class="total-row"><td colspan="5">Balance on account</td><td class="num">${esc(money(patient.balance))}</td></tr>
        </tbody>
      </table>
      <footer class="note">${esc(db.settings.address)} · ${esc(db.settings.phone)} · Paybill ${esc(db.settings.paybill)} · KRA ${esc(db.settings.kraPin)}</footer>
    </div>`);
}

export function printSupplierInvoice(db: DB, supplier: Supplier): boolean {
  const sym = db.settings.currencySymbol;
  const money = (n: number) => formatMoney(n, sym);
  const drugs = db.drugs.filter((d) => d.supplier.trim().toLowerCase() === supplier.name.trim().toLowerCase()
    || (supplier.items && d.supplier.toLowerCase().includes(supplier.name.trim().toLowerCase())));
  const matched = drugs.length ? drugs : db.drugs.filter((d) => supplier.name && d.supplier.toLowerCase().includes(supplier.name.toLowerCase().split(" ")[0] ?? ""));
  const lines = matched.map((d) => {
    const qty = drugStock(d);
    const base = drugBase(d);
    return { name: d.name, qty, base, amount: qty * base };
  });
  const stockCost = lines.reduce((a, l) => a + l.amount, 0);
  const when = new Date().toLocaleString("en-KE");
  const no = `INV-S-${supplier.id.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const rows = lines.length
    ? lines.map((l) => `<tr><td>${esc(l.name)}</td><td class="num">${l.qty}</td><td class="num">${esc(money(l.base))}</td><td class="num">${esc(money(l.amount))}</td></tr>`).join("")
    : `<tr><td colspan="4">No products are linked to this supplier yet.</td></tr>`;

  return openPrint(`Invoice ${supplier.name}`, `
    <header class="banner">
      <p class="eyebrow">${esc(db.settings.facilityName)}</p>
      <h1>Supplier invoice</h1>
      <p class="meta">${esc(no)} · ${esc(when)}</p>
    </header>
    <div class="body">
      <div class="stats">
        <div class="stat"><span>Supplier</span><strong>${esc(supplier.name)}</strong></div>
        <div class="stat"><span>Phone</span><strong>${esc(supplier.phone || "—")}</strong></div>
        <div class="stat"><span>Stock at base</span><strong>${esc(money(stockCost))}</strong></div>
        <div class="stat"><span>Amount due</span><strong>${esc(money(supplier.balance))}</strong></div>
      </div>
      <p>${esc(supplier.email || "")} ${supplier.items ? `· Supplies ${esc(supplier.items)}` : ""}</p>
      <h2>Products on hand</h2>
      <table>
        <thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Base price</th><th class="num">Extended</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row"><td colspan="3">Amount due on account</td><td class="num">${esc(money(supplier.balance))}</td></tr>
        </tbody>
      </table>
      <footer class="note">${esc(db.settings.address)} · ${esc(db.settings.phone)} · KRA ${esc(db.settings.kraPin)}</footer>
    </div>`);
}

export function monthFigures(db: DB, ym: string) {
  const sales = db.sales.filter((s) => s.date.startsWith(ym));
  const expenses = db.expenses.filter((e) => e.spentOn.startsWith(ym));
  const visits = db.visits.filter((v) => v.date.startsWith(ym));
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const spent = expenses.reduce((a, e) => a + e.amount, 0);
  const profit = sales.reduce((a, s) => a + s.lines.reduce((x, l) => x + (l.price - lineBase(db, l)) * l.qty, 0), 0);
  return { sales, expenses, visits, revenue, spent, profit };
}

export function printMonthlyReport(db: DB, ym: string): boolean {
  const sym = db.settings.currencySymbol;
  const money = (n: number) => formatMoney(n, sym);
  const { sales, expenses, visits, revenue, spent, profit } = monthFigures(db, ym);
  const byProduct = new Map<string, { name: string; qty: number; base: number; charged: number; profit: number }>();
  for (const sale of sales) {
    for (const line of sale.lines) {
      const base = lineBase(db, line);
      const cur = byProduct.get(line.name) ?? { name: line.name, qty: 0, base: 0, charged: 0, profit: 0 };
      cur.qty += line.qty;
      cur.base += base * line.qty;
      cur.charged += line.price * line.qty;
      cur.profit += (line.price - base) * line.qty;
      byProduct.set(line.name, cur);
    }
  }
  const products = [...byProduct.values()].sort((a, b) => b.profit - a.profit);

  return openPrint(`Monthly report ${monthLabel(ym)}`, `
    <header class="banner">
      <p class="eyebrow">${esc(db.settings.facilityName)} · Monthly report</p>
      <h1>${esc(monthLabel(ym))}</h1>
      <p class="meta">${esc(db.settings.address)} · KRA ${esc(db.settings.kraPin)} · eTIMS ${db.settings.etimsEnabled ? "on" : "off"}</p>
    </header>
    <div class="body">
      <div class="stats">
        <div class="stat"><span>Revenue</span><strong>${esc(money(revenue))}</strong></div>
        <div class="stat"><span>Expenses</span><strong>${esc(money(spent))}</strong></div>
        <div class="stat"><span>Gross profit</span><strong>${esc(money(profit))}</strong></div>
        <div class="stat"><span>Net</span><strong>${esc(money(revenue - spent))}</strong></div>
      </div>
      <h2>Receipts · ${sales.length}</h2>
      <table>
        <thead><tr><th>Receipt</th><th>Date</th><th>Patient</th><th class="num">Total</th></tr></thead>
        <tbody>${sales.length ? sales.map((s) => `<tr><td>${esc(s.receiptNo)}</td><td>${esc(s.date)} ${esc(s.time)}</td><td>${esc(s.patientName)}</td><td class="num">${esc(money(s.total))}</td></tr>`).join("") : `<tr><td colspan="4">No receipts this month.</td></tr>`}</tbody>
      </table>
      <h2>Profit by product</h2>
      <table>
        <thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Base</th><th class="num">Charged</th><th class="num">Profit</th></tr></thead>
        <tbody>${products.length ? products.map((p) => `<tr><td>${esc(p.name)}</td><td class="num">${p.qty}</td><td class="num">${esc(money(p.base))}</td><td class="num">${esc(money(p.charged))}</td><td class="num">${esc(money(p.profit))}</td></tr>`).join("") : `<tr><td colspan="5">No sales this month.</td></tr>`}</tbody>
      </table>
      <h2>Expenses · ${visits.length} visits</h2>
      <table>
        <thead><tr><th>Date</th><th>Reason</th><th>Category</th><th class="num">Amount</th></tr></thead>
        <tbody>${expenses.length ? expenses.map((e) => `<tr><td>${esc(e.spentOn)}</td><td>${esc(e.reason)}</td><td>${esc(e.category)}</td><td class="num">${esc(money(e.amount))}</td></tr>`).join("") : `<tr><td colspan="4">No expenses this month.</td></tr>`}</tbody>
      </table>
      <footer class="note">Gross profit is the charged price minus the base price, before expenses. Save this page as a PDF from the print dialog.</footer>
    </div>`);
}
