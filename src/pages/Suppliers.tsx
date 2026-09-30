import { useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore } from "../lib/store";
import { printSupplierInvoice } from "../lib/documents";
import { Field, Notice, PageHeader, Panel, Pill } from "../components/ui";

export function SuppliersPage() {
  const { db, update } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", items: "" });
  const [ok, setOk] = useState("");

  function add() {
    if (!form.name.trim()) return;
    update((d) => {
      d.suppliers.unshift({ id: uid("sp"), name: form.name.trim(), phone: form.phone, email: form.email, items: form.items, balance: 0 });
      return d;
    });
    setOk(`${form.name} added.`);
    setForm({ name: "", phone: "", email: "", items: "" });
  }

  return (
    <>
      <PageHeader kicker="Procurement" title="Suppliers" lead="Drug suppliers, balances owed, purchase history. Reorder before the shelf goes empty." />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="form-grid">
          <Field id="sp-n" label="Supplier"><input id="sp-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cosmos Ltd" /></Field>
          <Field id="sp-p" label="Phone"><input id="sp-p" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field id="sp-e" label="Email"><input id="sp-e" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field id="sp-i" label="Supplies"><input id="sp-i" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="Amoxicillin, ORS" /></Field>
          <div><button type="button" className="solid" style={{ marginTop: 22 }} onClick={add}>Add supplier</button></div>
        </div>
      </Panel>
      <Panel>
        <div className="table-wrap"><table><thead><tr><th>Supplier</th><th>Supplies</th><th>Owed</th><th></th></tr></thead>
          <tbody>{db.suppliers.map((s) => <tr key={s.id}><td data-label="Supplier"><strong>{s.name}</strong><br /><span style={{ color: "var(--mute)" }}>{s.phone} · {s.email}</span></td><td data-label="Supplies">{s.items}</td><td data-label="Owed">{s.balance > 0 ? <Pill tone="amber">{formatMoney(s.balance, db.settings.currencySymbol)}</Pill> : <span style={{ color: "var(--mute)" }}>Settled</span>}</td><td><div className="row-actions"><button type="button" onClick={() => { if (!printSupplierInvoice(db, s)) setOk("Allow pop-ups to open the invoice, then save it as a PDF."); }}>Invoice</button></div></td></tr>)}</tbody></table></div>
      </Panel>
    </>
  );
}
