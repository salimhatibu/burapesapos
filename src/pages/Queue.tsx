import { useState } from "react";
import { Link } from "react-router-dom";
import { uid, todayISO } from "../../shared/format";
import { t } from "../lib/seed";
import { useStore } from "../lib/store";
import type { VisitStatus } from "../types";
import { Field, Notice, PageHeader, Panel, Empty } from "../components/ui";

export function QueuePage() {
  const { db, update } = useStore();
  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [vitals, setVitals] = useState({ temp: "", bp: "", pulse: "", weight: "", spo2: "" });
  const [ok, setOk] = useState("");

  const today = db.visits.filter((v) => v.date === todayISO());

  function addVisit() {
    if (!patientId || !reason.trim()) { setOk("Pick a patient and a complaint first."); return; }
    update((d) => {
      d.visits.unshift({
        id: uid("vs"), patientId, date: todayISO(), time: t(), reason: reason.trim(),
        vitals: { temp: vitals.temp || "—", bp: vitals.bp || "—", pulse: vitals.pulse || "—", weight: vitals.weight || "—", spo2: vitals.spo2 || "—" },
        status: "waiting", clinician: "", diagnosis: "", prescriptionIds: [], labOrderIds: [],
      });
      return d;
    });
    setOk("Added to today's queue.");
    setReason(""); setVitals({ temp: "", bp: "", pulse: "", weight: "", spo2: "" });
  }

  function setStatus(id: string, status: VisitStatus) {
    update((d) => {
      const v = d.visits.find((x) => x.id === id);
      if (v) v.status = status;
      return d;
    });
  }

  return (
    <>
      <PageHeader kicker="OPD flow" title="Today's queue" lead="Reception checks in, triage captures vitals, clinician consults, dispensary + lab clear, cashier closes. Move each card along." />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <p className="kicker">Check in a walk-in</p>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <Field id="q-pt" label="Patient"><select id="q-pt" value={patientId} onChange={(e) => setPatientId(e.target.value)}><option value="">Select…</option>{db.patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.opNumber}</option>)}</select></Field>
          <Field id="q-reason" label="Complaint"><input id="q-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Fever, cough…" /></Field>
          <Field id="q-temp" label="Temp"><input id="q-temp" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} placeholder="37.2°C" /></Field>
          <Field id="q-bp" label="BP"><input id="q-bp" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} placeholder="120/80" /></Field>
          <Field id="q-pulse" label="Pulse / SpO₂"><input id="q-pulse" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} placeholder="88 · 98%" /></Field>
          <div><button type="button" className="solid" onClick={addVisit} style={{ marginTop: 22 }}>+ Add to queue</button></div>
        </div>
      </Panel>
      <Panel>
        <p className="kicker">{today.length} today</p>
        {today.length === 0 ? <Empty>Queue is clear.</Empty> : (
          <div className="table-wrap"><table><thead><tr><th>Time</th><th>Patient</th><th>Vitals</th><th>Status</th><th>Move</th></tr></thead>
            <tbody>
              {today.map((v) => {
                const p = db.patients.find((x) => x.id === v.patientId);
                return (
                  <tr key={v.id}>
                    <td data-label="Time">{v.time}</td>
                    <td data-label="Patient"><Link to={`/patients/${v.patientId}`}>{p?.name}</Link><br /><span style={{ color: "var(--mute)" }}>{v.reason}</span></td>
                    <td data-label="Vitals">{v.vitals.temp} · {v.vitals.bp} · {v.vitals.pulse}</td>
                    <td data-label="Status"><span className="queue-chip"><span className={`queue-dot ${v.status}`} />{v.status}</span></td>
                    <td><div className="row-actions">
                      {(["waiting", "in-consult", "dispensed", "paid", "completed"] as VisitStatus[]).filter((s) => s !== v.status).slice(0, 2).map((s) => (
                        <button key={s} type="button" onClick={() => setStatus(v.id, s)}>→ {s}</button>
                      ))}
                    </div></td>
                  </tr>
                );
              })}
            </tbody></table></div>
        )}
      </Panel>
    </>
  );
}
