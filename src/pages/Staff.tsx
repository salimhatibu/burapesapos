import { useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore } from "../lib/store";
import { Field, Notice, PageHeader, Panel, Empty } from "../components/ui";

export function StaffPage() {
  const { db, update } = useStore();
  const [form, setForm] = useState({ name: "", role: "Nurse", phone: "", shift: "Day", salary: "" });
  const [ok, setOk] = useState("");
  const wage = db.staff.reduce((a, s) => a + s.salary, 0);

  function add() {
    if (!form.name.trim()) return;
    update((d) => {
      d.staff.unshift({ id: uid("st"), name: form.name.trim(), role: form.role, phone: form.phone, shift: form.shift, salary: Number(form.salary) || 0 });
      return d;
    });
    setOk(`${form.name} added to roster.`);
    setForm({ name: "", role: "Nurse", phone: "", shift: "Day", salary: "" });
  }

  return (
    <>
      <PageHeader kicker={`Monthly wage ${formatMoney(wage, db.settings.currencySymbol)}`} title="Staff & clinicians" lead="Doctors, nurses, pharm techs and cashiers — shifts and salaries for payroll." />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="form-grid">
          <Field id="st-n" label="Name"><input id="st-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Doe" /></Field>
          <Field id="st-r" label="Role"><select id="st-r" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>Medical Officer</option><option>Clinical Officer</option><option>Nurse</option><option>Pharm Tech</option><option>Lab Tech</option><option>Receptionist / Cashier</option></select></Field>
          <Field id="st-p" label="Phone"><input id="st-p" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field id="st-s" label="Shift"><select id="st-s" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}><option>Day</option><option>Night</option><option>Rotating</option></select></Field>
          <Field id="st-w" label="Salary (KSh)"><input id="st-w" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></Field>
          <div><button type="button" className="solid" style={{ marginTop: 22 }} onClick={add}>Add staff</button></div>
        </div>
      </Panel>
      <Panel>
        <div className="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Shift</th><th>Salary</th></tr></thead>
          <tbody>{db.staff.map((s) => <tr key={s.id}><td data-label="Name"><strong>{s.name}</strong><br /><span style={{ color: "var(--mute)" }}>{s.phone}</span></td><td data-label="Role">{s.role}</td><td data-label="Shift">{s.shift}</td><td data-label="Salary">{formatMoney(s.salary, db.settings.currencySymbol)}</td></tr>)}</tbody></table></div>
        {db.staff.length === 0 ? <Empty>No staff yet.</Empty> : null}
      </Panel>
    </>
  );
}
