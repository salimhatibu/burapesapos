import { formatMoney } from "../../shared/format";
import { drugStock } from "./store";
import type { DB } from "../types";

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch] ?? ch));
}

function rows(cells: string[]): string {
  return `<tr>${cells.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`;
}

/** Full facility overview, opened in a print window. */
export function printOverview(db: DB) {
  const sym = db.settings.currencySymbol;
  const money = (n: number) => formatMoney(n, sym);
  const revenue = db.sales.reduce((a, s) => a + s.total, 0);
  const expenses = db.expenses.reduce((a, e) => a + e.amount, 0);
  const stock = db.drugs.reduce((a, d) => a + d.batches.reduce((x, b) => x + b.qty * b.buyPrice, 0), 0);
  const owed = db.patients.reduce((a, p) => a + p.balance, 0);
  const when = new Date().toLocaleString("en-KE");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Overview · ${esc(db.settings.facilityName)}</title>
<style>
  body { font-family: Georgia, serif; color: #10211f; margin: 28px; }
  h1 { margin: 0 0 4px; font-size: 28px; }
  h2 { margin: 28px 0 8px; font-size: 16px; letter-spacing: 0.04em; text-transform: uppercase; }
  p { margin: 0 0 8px; color: #3d5550; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #d5e4e0; }
  th { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #5c746e; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 16px; }
  .stats div { border: 1px solid #d5e4e0; border-radius: 10px; padding: 10px 12px; }
  .stats strong { display: block; font-size: 18px; }
  @media print { body { margin: 12px; } }
</style></head><body>
<h1>${esc(db.settings.facilityName)}</h1>
<p>Facility overview · ${esc(when)} · ${esc(db.settings.address)} · KRA ${esc(db.settings.kraPin)}</p>
<div class="stats">
  <div>Revenue<strong>${esc(money(revenue))}</strong></div>
  <div>Expenses<strong>${esc(money(expenses))}</strong></div>
  <div>Net<strong>${esc(money(revenue - expenses))}</strong></div>
  <div>Patient balances<strong>${esc(money(owed))}</strong></div>
  <div>Stock at cost<strong>${esc(money(stock))}</strong></div>
  <div>Patients<strong>${db.patients.length}</strong></div>
  <div>Visits<strong>${db.visits.length}</strong></div>
  <div>Receipts<strong>${db.sales.length}</strong></div>
</div>
<h2>Receipts</h2>
<table><thead><tr><th>Receipt</th><th>Date</th><th>Patient</th><th>Total</th><th>Paid by</th></tr></thead><tbody>
${db.sales.map((s) => rows([s.receiptNo, `${s.date} ${s.time}`, s.patientName, money(s.total), s.payments.map((p) => p.method).join(", ")])).join("")}
</tbody></table>
<h2>Patients</h2>
<table><thead><tr><th>OP</th><th>Name</th><th>Phone</th><th>Cover</th><th>Balance</th></tr></thead><tbody>
${db.patients.map((p) => rows([p.opNumber, p.name, p.phone, p.insurance, money(p.balance)])).join("")}
</tbody></table>
<h2>Pharmacy</h2>
<table><thead><tr><th>Drug</th><th>Stock</th><th>Sell price</th><th>Cost value</th></tr></thead><tbody>
${db.drugs.map((d) => rows([d.name, String(drugStock(d)), money(d.sellPrice), money(d.batches.reduce((a, b) => a + b.qty * b.buyPrice, 0))])).join("")}
</tbody></table>
<h2>Laboratory</h2>
<table><thead><tr><th>Order</th><th>Patient</th><th>Result</th><th>Price</th></tr></thead><tbody>
${db.labOrders.map((l) => rows([l.testName, db.patients.find((p) => p.id === l.patientId)?.name ?? "—", l.done ? l.result : "Pending", money(l.price)])).join("")}
</tbody></table>
<h2>Expenses</h2>
<table><thead><tr><th>Date</th><th>Reason</th><th>Category</th><th>Amount</th></tr></thead><tbody>
${db.expenses.map((e) => rows([e.spentOn, e.reason, e.category, money(e.amount)])).join("")}
</tbody></table>
<h2>Staff</h2>
<table><thead><tr><th>Name</th><th>Role</th><th>Shift</th><th>Salary</th></tr></thead><tbody>
${db.staff.map((s) => rows([s.name, s.role, s.shift, money(s.salary)])).join("")}
</tbody></table>
<h2>Suppliers</h2>
<table><thead><tr><th>Name</th><th>Phone</th><th>Supplies</th><th>Owed</th></tr></thead><tbody>
${db.suppliers.map((s) => rows([s.name, s.phone, s.items, money(s.balance)])).join("")}
</tbody></table>
</body></html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
