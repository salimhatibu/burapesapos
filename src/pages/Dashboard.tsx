import { Link } from "react-router-dom";
import { daysUntil, formatMoney, todayISO } from "../../shared/format";
import { useStore, drugStock } from "../lib/store";
import { useCountUp } from "../lib/use-count-up";
import { Field, PageHeader, Panel, Pill } from "../components/ui";
import { FlaskIcon, HeartPulseIcon, PillIcon, PosIcon, StethIcon } from "../components/MedIcons";
import { useState } from "react";

export function DashboardPage() {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const sym = db.settings.currencySymbol;
  const today = todayISO();

  const salesToday = db.sales.filter((s) => s.date === today);
  const revenueToday = salesToday.reduce((a, s) => a + s.total, 0);
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
      <section className="hero">
        <p className="eyebrow kicker-icon"><HeartPulseIcon /> Today at a glance · {db.settings.facilityName}</p>
        <h1>Good morning, daktari<span style={{ color: "var(--accent)" }}>.</span></h1>
        <p className="page-lead">
          {visitsToday.length} visits today · {waiting} waiting · {pendingRx} prescriptions to dispense · {pendingLabs} lab results pending.
          Revenue updates live as the cashier bills.
        </p>
        <div className="ecg-card" aria-hidden="true">
          <span className="ecg-label"><span className="live-dot" /> Live · {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</span>
          <svg viewBox="0 0 600 56" preserveAspectRatio="none">
            <path className="trace" d="M0 28 H170 L184 28 L194 8 L210 48 L222 18 L232 28 H330 L344 28 L354 12 L368 44 L380 20 L388 28 H480 L492 28 L500 10 L514 46 L526 22 L534 28 H600" />
          </svg>
        </div>
      </section>

      <div className="board" aria-live="polite">
        <article className="stat">
          <p className="kicker kicker-icon"><PosIcon /> Revenue today</p>
          <p className="figure">{formatMoney(revenueToday, sym).replace(/[\d,.\s]/g, (m) => m) && `KSh ${rev}`}</p>
          <p className="stat-note">M-Pesa {formatMoney(mpesaToday, sym)} · {salesToday.length} receipts</p>
        </article>
        <article className="stat">
          <p className="kicker kicker-icon"><StethIcon /> Visits today</p>
          <p className="figure">{vis}</p>
          <p className="stat-note">{waiting} in waiting bay · triage vitals captured</p>
        </article>
        <article className="stat">
          <p className="kicker">Patient balances owed</p>
          <p className="figure">KSh {out}</p>
          <p className="stat-note">Across {db.patients.filter((p) => p.balance > 0).length} accounts</p>
        </article>
        <article className="stat">
          <p className="kicker">Expenses today</p>
          <p className="figure">KSh {exp}</p>
          <p className="stat-note">Consumables, lab, utilities</p>
        </article>
        <article className="stat">
          <p className="kicker kicker-icon"><PillIcon /> Dispensary</p>
          <p className="figure">{pendingRx} <span style={{ fontSize: "1rem", fontWeight: 400 }}>to dispense</span></p>
          <p className="stat-note">FEFO picks the earliest-expiry batch first</p>
        </article>
        <article className="stat">
          <p className="kicker kicker-icon"><FlaskIcon /> Laboratory</p>
          <p className="figure">{pendingLabs} <span style={{ fontSize: "1rem", fontWeight: 400 }}>pending</span></p>
          <p className="stat-note">mRDT, haemogram, HbA1c queue</p>
        </article>
        <article className="stat critical">
          <p className="kicker"><span className="heart-beat">♥</span> Stock alerts</p>
          <p className="figure">{lowStock.length + expirySoon.length}</p>
          <p className="stat-note">{lowStock.length} below reorder · {expirySoon.length} expiring ≤ 60 days</p>
        </article>
      </div>

      <div className="pos-grid">
        <Panel>
          <div className="toolbar">
            <div>
              <p className="kicker">Live queue — today</p>
              <h2 style={{ marginTop: 4 }}>Who is waiting?</h2>
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
            <p className="kicker">Payment mix — all time</p>
            <h2 style={{ margin: "4px 0 10px" }}>How patients pay</h2>
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
            <p className="kicker">Expiry radar — ≤ 60 days</p>
            <h2 style={{ margin: "4px 0 10px" }}>Dispense first</h2>
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
