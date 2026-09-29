import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, uid, todayISO } from "../../shared/format";
import { useStore } from "../lib/store";
import { Field, Notice, PageHeader, Panel, Pill, Empty } from "../components/ui";

export function PatientsPage() {
  const { db, update } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", gender: "female", dob: "", residence: "", insurance: "None (Cash)", memberNo: "", allergies: "", chronic: "" });
  const [ok, setOk] = useState("");

  const list = db.patients.filter((p) =>
    !q || (p.name + p.opNumber + p.phone).toLowerCase().includes(q.toLowerCase())
  );

  function register() {
    if (!form.name.trim() || !form.phone.trim()) { setOk(""); return; }
    const n = db.patients.length + 1001;
    const age = form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : 0;
    update((d) => {
      d.patients.unshift({
        id: uid("pt"), opNumber: `OP-${n}`, name: form.name.trim(), phone: form.phone.trim(),
        gender: form.gender as never, dob: form.dob || "2000-01-01", age,
        idNumber: "", residence: form.residence, nextOfKin: "", kinPhone: "",
        insurance: form.insurance, memberNo: form.memberNo, allergies: form.allergies, chronic: form.chronic,
        balance: 0, createdAt: todayISO(),
      });
      return d;
    });
    setOk(`${form.name} registered as OP-${n}.`);
    setForm({ name: "", phone: "", gender: "female", dob: "", residence: "", insurance: "None (Cash)", memberNo: "", allergies: "", chronic: "" });
    setOpen(false);
  }

  return (
    <>
      <PageHeader kicker="Master index" title="Patients" lead="Registration, insurance (SHA / corporate / cash), balances and visit history. Every bill and prescription links back here.">
        <button type="button" className="solid" onClick={() => setOpen(true)}>+ Register patient</button>
      </PageHeader>
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="toolbar">
          <p className="kicker">{list.length} on file · {db.patients.filter((p) => p.balance > 0).length} owe balances</p>
          <div className="search"><Field id="pt-q" label="Search"><input id="pt-q" placeholder="Name, OP number, phone…" value={q} onChange={(e) => setQ(e.target.value)} /></Field></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>OP</th><th>Patient</th><th>Cover</th><th>Balance</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td data-label="OP">{p.opNumber}</td>
                  <td data-label="Patient"><strong>{p.name}</strong><br /><span style={{ color: "var(--mute)" }}>{p.phone} · {p.residence}</span></td>
                  <td data-label="Cover"><Pill tone={p.insurance === "SHA" ? "teal" : p.insurance.startsWith("None") ? "amber" : "blue"}>{p.insurance}</Pill></td>
                  <td data-label="Balance">{p.balance > 0 ? <Pill tone="red">{formatMoney(p.balance, db.settings.currencySymbol)}</Pill> : <span style={{ color: "var(--mute)" }}>Clear</span>}</td>
                  <td><div className="row-actions"><Link to={`/patients/${p.id}`}>Open file</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 ? <Empty>No patients match.</Empty> : null}
      </Panel>

      {open ? (
        <div className="modal-veil" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <p className="kicker">New file</p>
            <h2>Register patient</h2>
            <div className="form-grid" style={{ marginTop: 14 }}>
              <Field id="r-name" label="Full name"><input id="r-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amina Hassan" /></Field>
              <Field id="r-phone" label="Phone"><input id="r-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07…" /></Field>
              <Field id="r-gender" label="Gender"><select id="r-gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></Field>
              <Field id="r-dob" label="Date of birth"><input id="r-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
              <Field id="r-res" label="Residence"><input id="r-res" value={form.residence} onChange={(e) => setForm({ ...form, residence: e.target.value })} /></Field>
              <Field id="r-ins" label="Cover"><select id="r-ins" value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })}><option>None (Cash)</option><option>SHA</option><option>Jubilee</option><option>AAR</option><option>Madison</option></select></Field>
              <Field id="r-mem" label="Member no."><input id="r-mem" value={form.memberNo} onChange={(e) => setForm({ ...form, memberNo: e.target.value })} /></Field>
              <Field id="r-alg" label="Allergies"><input id="r-alg" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="None" /></Field>
              <Field id="r-chr" label="Chronic illness"><input id="r-chr" value={form.chronic} onChange={(e) => setForm({ ...form, chronic: e.target.value })} placeholder="None" /></Field>
            </div>
            <div className="actions" style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button type="button" className="solid" onClick={register}>Save file</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
