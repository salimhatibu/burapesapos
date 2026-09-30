import { Link } from "react-router-dom";
import { daysUntil, formatMoney, todayISO } from "../../shared/format";
import { useStore, drugStock } from "../lib/store";
import { useCountUp } from "../lib/use-count-up";
import { Field, PageHeader, Panel, Pill } from "../components/ui";
import { RingStat } from "../components/RingStat";
import { useState } from "react";

export function DashboardPage() {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const sym = db.settings.currencySymbol;
  const today = todayISO();

  const salesToday = db.sales.filter((s) => s.date === today);
  const revenueToday = salesToday.reduce((a, s) => a + s.total, 0);
  const revenueAll = db.sales.reduce((a, s) => a + s.total, 0);
  const mpesaToday = salesToday.flatMap((s) => s.payments).filter((p) => p.method === "mpesa").reduce((a, p) => a + p.amount, 0);
  const visitsToday = db.visits.filter((v) => v.date === today);
  const waiting = visitsToday.filter((v) => v.status === "waiting").length;
  const outstanding = db.patients.reduce((a, p) => a + p.balance, 0);
  const expensesToday = db.expenses.filter((e) => e.spentOn === today).reduce((a, e) => a + e.amount, 0);
  const pendingLabs = db.labOrders.filter((l) => !l.done).length;
  const pendingRx = db.prescriptions.filter((r) => !r.dispensed).length;

  const expirySoon = db.drugs.flatMap((d) =>
    d.batches.filter((b) => daysUntil(b.expiry) <= 60).map((b) => ({ drug: d, batch: b, days: daysUntil(b.expiry) }))
  ).sort((a, b) => a.days - b.days).slice(0, 6);

  const lowStock = db.drugs
    .map((d) => ({ drug: d, stock: drugStock(d) }))
    .filter((x) => x.stock <= x.drug.reorderLevel)
    .slice(0, 6);

  const payMix: Record<string, number> = {};
  db.sales.forEach((s) => s.payments.forEach((p) => { payMix[p.method] = (payMix[p.method] ?? 0) + p.amount; }));
  const payTotal = Object.values(payMix).reduce((a, b) => a + b, 0) || 1;

  const rev = useCountUp(revenueToday, 1100, 2);
  const vis = useCountUp(visitsToday.length, 800);
  const out = useCountUp(outstanding, 1000, 2);
  const exp = useCountUp(expensesToday, 900, 2);

  const filteredQueue = visitsToday.filter((v) => {
    const p = db.patients.find((x) => x.id === v.patientId);
    return !q || (p?.name.toLowerCase().includes(q.toLowerCase()) || v.reason.toLowerCase().includes(q.toLowerCase()));
  });

  return (
    <>
      <header className="dash-head">
        <div>
          <h1>Today</h1>
          <time className="dash-date" dateTime={today}>
            {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
          </time>
        </div>
        <ul className="dash-facts">
          <li><strong>{visitsToday.length}</strong> visits</li>
          <li><strong>{waiting}</strong> waiting</li>
          <li><strong>{pendingRx}</strong> to dispense</li>
          <li><strong>{pendingLabs}</strong> lab results</li>
        </ul>
      </header>

      <div className="board board-rings" aria-live="polite">
        <RingStat
          label="Revenue"
          value={<><span className="ring-currency">KSh</span>{rev}</>}
          note={`${salesToday.length} receipt${salesToday.length === 1 ? "" : "s"} · M-Pesa ${formatMoney(mpesaToday, sym)}`}
          percent={revenueAll === 0 ? 0 : Math.round((revenueToday / revenueAll) * 100)}
        />
        <RingStat
          label="Visits"
          value={String(vis)}
          note={`${waiting} waiting`}
          percent={visitsToday.length === 0 ? 0 : Math.round((waiting / visitsToday.length) * 100)}
        />
        <RingStat
          label="Balances"
          value={<><span className="ring-currency">KSh</span>{out}</>}
          note={`${db.patients.filter((p) => p.balance > 0).length} accounts`}
          percent={db.patients.length === 0 ? 0 : Math.round((db.patients.filter((p) => p.balance > 0).length / db.patients.length) * 100)}
        />
        <RingStat
          label="Expenses"
          value={<><span className="ring-currency">KSh</span>{exp}</>}
          note="Posted today"
          percent={revenueToday + expensesToday === 0 ? 0 : Math.round((expensesToday / (revenueToday + expensesToday)) * 100)}
        />
        <RingStat
          label="Dispensary"
          value={String(pendingRx)}
          note="To dispense"
          percent={db.prescriptions.length === 0 ? 0 : Math.round((pendingRx / db.prescriptions.length) * 100)}
        />
        <RingStat
          label="Laboratory"
          value={String(pendingLabs)}
          note="Results pending"
          percent={db.labOrders.length === 0 ? 0 : Math.round((pendingLabs / db.labOrders.length) * 100)}
        />
        <RingStat
          critical
          label="Alerts"
          value={String(lowStock.length + expirySoon.length)}
          note={`${lowStock.length} low · ${expirySoon.length} expiring`}
          percent={db.drugs.length === 0 ? 0 : Math.round(((lowStock.length + expirySoon.length) / db.drugs.length) * 100)}
        />
      </div>

      <div className="pos-grid">
        <Panel>
          <div className="toolbar">
            <div>
              <p className="kicker">Today</p>
              <h2 style={{ marginTop: 4 }}>Queue</h2>
            </div>
            <div className="search">
              <Field id="q" label="Search queue"><input id="q" placeholder="Patient or complaint…" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Complaint</th><th>Vitals</th><th>Status</th></tr></thead>
              <tbody>
                {filteredQueue.map((v) => {
                  const p = db.patients.find((x) => x.id === v.patientId);
                  return (
                    <tr key={v.id}>
                      <td data-label="Time">{v.time}</td>
                      <td data-label="Patient"><Link to={`/patients/${v.patientId}`} className="row-link">{p?.name ?? "—"}</Link><br /><span style={{ color: "var(--mute)" }}>{p?.opNumber}</span></td>
                      <td data-label="Complaint">{v.reason}</td>
                      <td data-label="Vitals">{v.vitals.bp} · {v.vitals.temp} · SpO₂ {v.vitals.spo2}</td>
                      <td data-label="Status">
                        <span className="queue-chip"><span className={`queue-dot ${v.status}`} />{v.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredQueue.length === 0 ? <p className="empty">No visits match. Add one from the Queue page.</p> : null}
        </Panel>

        <div>
          <Panel>
            <p className="kicker">All receipts</p>
            <h2 style={{ margin: "4px 0 12px" }}>Payments</h2>
            {(["mpesa", "cash", "sha", "insurance", "card"] as const).map((m) => (
              <div className="bar-row" key={m}>
                <span style={{ width: 76, textTransform: "uppercase", fontSize: 12, fontWeight: 700, color: "var(--mute)" }}>{m}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(((payMix[m] ?? 0) / payTotal) * 100)}%` }} /></div>
                <span style={{ fontFamily: "var(--nums)", fontSize: 13 }}>{Math.round(((payMix[m] ?? 0) / payTotal) * 100)}%</span>
              </div>
            ))}
            <div className="actions" style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <Link className="solid" to="/pos">Open till</Link>
              <Link className="ghost" to="/reports">Reports</Link>
            </div>
          </Panel>

          <Panel>
            <p className="kicker">Within 60 days</p>
            <h2 style={{ margin: "4px 0 12px" }}>Use these first</h2>
            {expirySoon.length === 0 ? <p className="empty">No batches expiring soon. FEFO is happy.</p> : null}
            {expirySoon.map(({ drug, batch, days }) => (
              <div className="cart-line" key={batch.batch}>
                <span><strong>{drug.name}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{batch.batch} · exp {batch.expiry} · {batch.qty} left</span></span>
                <Pill tone={days <= 30 ? "red" : "amber"}>{days}d</Pill>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}
