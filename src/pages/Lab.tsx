import { useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore } from "../lib/store";
import { Field, Notice, PageHeader, Panel, Pill, Empty } from "../components/ui";

export function LabPage() {
  const { db, update } = useStore();
  const [result, setResult] = useState<Record<string, string>>({});
  const [ok, setOk] = useState("");
  const [orderTest, setOrderTest] = useState("");
  const [orderPatient, setOrderPatient] = useState("");

  const pending = db.labOrders.filter((l) => !l.done);
  const done = db.labOrders.filter((l) => l.done);

  function saveResult(id: string) {
    const r = (result[id] ?? "").trim();
    if (!r) return;
    update((d) => {
      const o = d.labOrders.find((x) => x.id === id);
      if (o) { o.result = r; o.done = true; }
      const v = d.visits.find((x) => x.id === o?.visitId);
      if (v && v.status === "in-consult") v.status = "dispensed";
      return d;
    });
    setOk("Result filed — visit moved forward.");
  }

  function order() {
    if (!orderTest || !orderPatient) { setOk("Pick a patient and a test."); return; }
    const test = db.labTests.find((x) => x.id === orderTest);
    if (!test) return;
    update((d) => {
      d.labOrders.unshift({ id: uid("lo"), visitId: "walk-in", patientId: orderPatient, testId: test.id, testName: test.name, price: test.price, result: "", done: false, date: new Date().toISOString().slice(0, 10) });
      return d;
    });
    setOk(`${test.name} ordered.`);
  }

  return (
    <>
      <PageHeader kicker="Diagnostics" title="Laboratory" lead="Order tests from triage or the till, file results, and auto-attach the charge to the patient's bill." />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <div className="pos-grid">
        <div>
          <Panel>
            <p className="kicker">{pending.length} awaiting results</p>
            <h2 style={{ margin: "4px 0 12px" }}>Worklist</h2>
            {pending.length === 0 ? <Empty>Bench is clear. 🎉</Empty> : null}
            {pending.map((l) => {
              const p = db.patients.find((x) => x.id === l.patientId);
              return (
                <div key={l.id} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 14, marginBottom: 10 }}>
                  <strong>{l.testName}</strong>
                  <p style={{ margin: "4px 0", color: "var(--mute)", fontSize: 13 }}>{p?.name} · {l.date} · {formatMoney(l.price, db.settings.currencySymbol)}</p>
                  <Field id={`res-${l.id}`} label="Result"><input id={`res-${l.id}`} placeholder="e.g. Positive — P. falciparum" value={result[l.id] ?? ""} onChange={(e) => setResult({ ...result, [l.id]: e.target.value })} /></Field>
                  <button type="button" className="solid" style={{ marginTop: 8 }} onClick={() => saveResult(l.id)}>File result</button>
                </div>
              );
            })}
          </Panel>
          <Panel>
            <p className="kicker">Catalogue</p>
            <div className="table-wrap"><table><thead><tr><th>Test</th><th>TAT</th><th>Price</th></tr></thead>
              <tbody>{db.labTests.map((x) => <tr key={x.id}><td data-label="Test"><strong>{x.name}</strong><br /><span style={{ color: "var(--mute)" }}>{x.category}</span></td><td data-label="TAT">{x.tat}</td><td data-label="Price">{formatMoney(x.price, db.settings.currencySymbol)}</td></tr>)}</tbody></table></div>
          </Panel>
        </div>
        <div>
          <Panel>
            <p className="kicker">New order</p>
            <div style={{ display: "grid", gap: 12 }}>
              <Field id="lo-pt" label="Patient"><select id="lo-pt" value={orderPatient} onChange={(e) => setOrderPatient(e.target.value)}><option value="">Select…</option>{db.patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
              <Field id="lo-test" label="Test"><select id="lo-test" value={orderTest} onChange={(e) => setOrderTest(e.target.value)}><option value="">Select…</option>{db.labTests.map((x) => <option key={x.id} value={x.id}>{x.name} — {formatMoney(x.price, db.settings.currencySymbol)}</option>)}</select></Field>
              <button type="button" className="solid" onClick={order}>Order test</button>
            </div>
          </Panel>
          <Panel>
            <p className="kicker">{done.length} completed</p>
            <h2 style={{ margin: "4px 0 10px" }}>Recent results</h2>
            {done.slice(0, 6).map((l) => {
              const p = db.patients.find((x) => x.id === l.patientId);
              return <div className="cart-line" key={l.id}><span><strong>{l.testName}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{p?.name} · {l.result}</span></span><Pill tone="green">ready</Pill></div>;
            })}
          </Panel>
        </div>
      </div>
    </>
  );
}
