import { Link, useParams } from "react-router-dom";
import { formatMoney } from "../../shared/format";
import { useStore } from "../lib/store";
import { PageHeader, Panel, Pill, Empty } from "../components/ui";

export function PatientDetailPage() {
  const { id } = useParams();
  const { db } = useStore();
  const p = db.patients.find((x) => x.id === id);
  if (!p) return <PageHeader kicker="Not found" title="No such file" lead="This patient file does not exist." />;
  const visits = db.visits.filter((v) => v.patientId === p.id);
  const sales = db.sales.filter((s) => s.patientId === p.id);
  const rxs = db.prescriptions.filter((r) => r.patientId === p.id);
  const labs = db.labOrders.filter((l) => l.patientId === p.id);

  return (
    <>
      <PageHeader kicker={`${p.opNumber} · ${p.gender} · ${p.age}y`} title={p.name} lead={`${p.phone} · ${p.residence} · Cover: ${p.insurance} ${p.memberNo} · Allergies: ${p.allergies || "none"}`}>
        <Link className="ghost" to="/patients">← All patients</Link>
      </PageHeader>
      <div className="board">
        <article className="stat"><p className="kicker">Balance owed</p><p className="figure">{formatMoney(p.balance, db.settings.currencySymbol)}</p><p className="stat-note">Collect at till or via M-Pesa</p></article>
        <article className="stat"><p className="kicker">Visits</p><p className="figure">{visits.length}</p><p className="stat-note">Across all dates</p></article>
        <article className="stat"><p className="kicker">Prescriptions</p><p className="figure">{rxs.length}</p><p className="stat-note">{rxs.filter((r) => !r.dispensed).length} pending</p></article>
        <article className="stat"><p className="kicker">Billed</p><p className="figure">{formatMoney(sales.reduce((a, s) => a + s.total, 0), db.settings.currencySymbol)}</p><p className="stat-note">Lifetime at this facility</p></article>
      </div>
      <Panel>
        <p className="kicker">Visit history</p>
        {visits.length === 0 ? <Empty>No visits yet.</Empty> : (
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Complaint</th><th>Diagnosis</th><th>Status</th></tr></thead>
            <tbody>{visits.map((v) => <tr key={v.id}><td data-label="Date">{v.date} {v.time}</td><td data-label="Complaint">{v.reason}</td><td data-label="Diagnosis">{v.diagnosis || "—"}</td><td data-label="Status"><Pill tone={v.status === "completed" ? "green" : "blue"}>{v.status}</Pill></td></tr>)}</tbody></table></div>
        )}
      </Panel>
      <Panel>
        <p className="kicker">Prescriptions & lab</p>
        {rxs.length === 0 && labs.length === 0 ? <Empty>Nothing prescribed yet.</Empty> : null}
        {rxs.map((r) => <div className="cart-line" key={r.id}><span><strong>{r.drugName}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{r.dose} · ×{r.qty} · {r.date}</span></span><Pill tone={r.dispensed ? "green" : "amber"}>{r.dispensed ? "dispensed" : "pending"}</Pill></div>)}
        {labs.map((l) => <div className="cart-line" key={l.id}><span><strong>{l.testName}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{l.result || "awaiting result"}</span></span><Pill tone={l.done ? "green" : "blue"}>{l.done ? "ready" : "pending"}</Pill></div>)}
      </Panel>
    </>
  );
}
