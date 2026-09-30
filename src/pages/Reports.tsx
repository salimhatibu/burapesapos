import { useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore, drugStock } from "../lib/store";
import { monthFigures, printMonthlyReport } from "../lib/documents";
import { RingStat } from "../components/RingStat";
import { Field, Notice, PageHeader, Panel, Pill } from "../components/ui";

function ringMoney(amount: number, symbol: string) {
  const n = (Number(amount) || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <>
      <span className="ring-currency">{symbol}</span>
      {n}
    </>
  );
}

export function ReportsPage() {
  const { db, update } = useStore();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [note, setNote] = useState("");
  const sym = db.settings.currencySymbol;
  const revenue = db.sales.reduce((a, s) => a + s.total, 0);
  const discounts = db.sales.reduce((a, s) => a + s.discount, 0);
  const expenses = db.expenses.reduce((a, e) => a + e.amount, 0);
  const byMethod: Record<string, number> = {};
  db.sales.forEach((s) => s.payments.forEach((p) => { byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount; }));
  const stockValue = db.drugs.reduce((a, d) => a + d.batches.reduce((x, b) => x + b.qty * b.buyPrice, 0), 0);
  const debtors = db.patients.filter((p) => p.balance > 0);
  const owed = debtors.reduce((a, p) => a + p.balance, 0);
  const flow = revenue + expenses;

  // daily revenue last 7 receipts
  const last = [...db.sales].slice(0, 7).reverse();
  const max = Math.max(1, ...last.map((s) => s.total));

  return (
    <>
      <PageHeader kicker="Compliance & insight" title="Reports" lead="Daily revenue, payment mix, debtors, stock valuation and a monthly PDF in the same sage theme as the desk.">
        <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <Field id="report-month" label="Month">
            <input id="report-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </Field>
          <button type="button" className="solid" onClick={() => {
            const ok = printMonthlyReport(db, month);
            if (!ok) { setNote("Allow pop-ups, then choose Save as PDF in the print dialog."); return; }
            const fig = monthFigures(db, month);
            update((d) => {
              d.reports.unshift({
                id: uid("rp"),
                createdAt: new Date().toISOString(),
                title: `Monthly report ${month}`,
                revenue: fig.revenue,
                expenses: fig.spent,
                net: fig.revenue - fig.spent,
                patients: d.patients.length,
                visits: fig.visits.length,
                sales: fig.sales.length,
              });
              return d;
            });
            setNote(`Monthly report for ${month} is ready. Choose Save as PDF in the print dialog.`);
          }}>Monthly PDF</button>
        </div>
      </PageHeader>
      {note ? <Notice tone="ok">{note}</Notice> : null}
      <div className="board board-rings">
        <RingStat
          label="Total revenue"
          value={ringMoney(revenue, sym)}
          note={`${db.sales.length} receipts · discounts ${formatMoney(discounts, sym)}`}
          percent={flow === 0 ? 0 : Math.round((revenue / flow) * 100)}
        />
        <RingStat
          label="Total expenses"
          value={ringMoney(expenses, sym)}
          note={`Net ${formatMoney(revenue - expenses, sym)}`}
          percent={flow === 0 ? 0 : Math.round((expenses / flow) * 100)}
          critical={expenses > revenue}
        />
        <RingStat
          label="Stock value (cost)"
          value={ringMoney(stockValue, sym)}
          note={`Across ${db.drugs.length} products`}
          percent={stockValue + revenue === 0 ? 0 : Math.round((stockValue / (stockValue + revenue)) * 100)}
        />
        <RingStat
          label="Debtors"
          value={ringMoney(owed, sym)}
          note={`${debtors.length} accounts owe`}
          percent={db.patients.length === 0 ? 0 : Math.round((debtors.length / db.patients.length) * 100)}
        />
      </div>
      <div className="pos-grid">
        <Panel>
          <p className="kicker">Recent receipts</p>
          <div style={{ display: "flex", alignItems: "end", gap: 8, height: 140, margin: "12px 0" }}>
            {last.map((s) => (
              <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }} title={`${s.receiptNo} · ${formatMoney(s.total, sym)}`}>
                <div style={{ width: "100%", borderRadius: 8, background: "linear-gradient(180deg,#0b63e5,#0ea5e9)", height: `${Math.max(8, (s.total / max) * 110)}px`, animation: "bar-shimmer 2s linear infinite", backgroundSize: "200% 100%" }} />
                <span style={{ fontSize: 11, color: "var(--mute)" }}>{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
          <div className="table-wrap"><table><thead><tr><th>Receipt</th><th>Patient</th><th>Total</th><th>Method</th></tr></thead>
            <tbody>{db.sales.map((s) => <tr key={s.id}><td data-label="Receipt">{s.receiptNo}<br /><span style={{ color: "var(--mute)" }}>{s.date} {s.time}</span></td><td data-label="Patient">{s.patientName}</td><td data-label="Total">{formatMoney(s.total, sym)}</td><td data-label="Method">{s.payments.map((p) => p.method).join(" + ")}</td></tr>)}</tbody></table></div>
        </Panel>
        <div>
          <Panel>
            <p className="kicker">Payment mix</p>
            {Object.entries(byMethod).map(([m, v]) => (
              <div className="bar-row" key={m}><span style={{ width: 80, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--mute)" }}>{m}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((v / revenue) * 100)}%` }} /></div>
                <span style={{ fontFamily: "var(--nums)", fontSize: 13 }}>{formatMoney(v, sym)}</span></div>
            ))}
          </Panel>
          <Panel>
            <p className="kicker">Debtors</p>
            {debtors.length === 0 ? <p className="empty">All clear.</p> : debtors.map((p) => (
              <div className="cart-line" key={p.id}><span><strong>{p.name}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{p.opNumber} · {p.phone}</span></span><Pill tone="red">{formatMoney(p.balance, sym)}</Pill></div>
            ))}
          </Panel>
          <Panel>
            <p className="kicker">Low stock valuation</p>
            {db.drugs.map((d) => (
              <div className="cart-line" key={d.id}><span>{d.name}</span><span style={{ fontFamily: "var(--nums)" }}>{drugStock(d)} · {formatMoney(d.batches.reduce((a, b) => a + b.qty * b.buyPrice, 0), sym)}</span></div>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}
