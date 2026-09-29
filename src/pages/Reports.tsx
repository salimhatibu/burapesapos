import { formatMoney } from "../../shared/format";
import { useStore, drugStock } from "../lib/store";
import { PageHeader, Panel, Pill } from "../components/ui";

export function ReportsPage() {
  const { db } = useStore();
  const sym = db.settings.currencySymbol;
  const revenue = db.sales.reduce((a, s) => a + s.total, 0);
  const discounts = db.sales.reduce((a, s) => a + s.discount, 0);
  const expenses = db.expenses.reduce((a, e) => a + e.amount, 0);
  const byMethod: Record<string, number> = {};
  db.sales.forEach((s) => s.payments.forEach((p) => { byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount; }));
  const stockValue = db.drugs.reduce((a, d) => a + d.batches.reduce((x, b) => x + b.qty * b.buyPrice, 0), 0);
  const debtors = db.patients.filter((p) => p.balance > 0);

  // daily revenue last 7 receipts
  const last = [...db.sales].slice(0, 7).reverse();
  const max = Math.max(1, ...last.map((s) => s.total));

  return (
    <>
      <PageHeader kicker="Compliance & insight" title="Reports" lead="Daily revenue, payment mix, debtors, stock valuation and expiry — everything a clinic needs for KRA eTIMS reconciliation and SHA claims." />
      <div className="board">
        <article className="stat"><p className="kicker">Total revenue</p><p className="figure">{formatMoney(revenue, sym)}</p><p className="stat-note">{db.sales.length} receipts · discounts {formatMoney(discounts, sym)}</p></article>
        <article className="stat"><p className="kicker">Total expenses</p><p className="figure">{formatMoney(expenses, sym)}</p><p className="stat-note">Net {formatMoney(revenue - expenses, sym)}</p></article>
        <article className="stat"><p className="kicker">Stock value (cost)</p><p className="figure">{formatMoney(stockValue, sym)}</p><p className="stat-note">Across {db.drugs.length} products</p></article>
        <article className="stat"><p className="kicker">Debtors</p><p className="figure">{formatMoney(debtors.reduce((a, p) => a + p.balance, 0), sym)}</p><p className="stat-note">{debtors.length} accounts owe</p></article>
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
