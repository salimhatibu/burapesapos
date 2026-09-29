import { useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore } from "../lib/store";
import { Field, Notice, PageHeader, Panel, Empty } from "../components/ui";

export function ExpensesPage() {
  const { db, update } = useStore();
  const [form, setForm] = useState({ reason: "", amount: "", category: "Consumables", spentOn: new Date().toISOString().slice(0, 10) });
  const [ok, setOk] = useState("");
  const total = db.expenses.reduce((a, e) => a + e.amount, 0);

  function add() {
    if (!form.reason.trim() || !Number(form.amount)) return;
    update((d) => {
      d.expenses.unshift({ id: uid("ex"), reason: form.reason.trim(), amount: Number(form.amount), category: form.category, spentOn: form.spentOn, by: "Admin" });
      return d;
    });
    setOk("Expense recorded.");
    setForm({ reason: "", amount: "", category: "Consumables", spentOn: new Date().toISOString().slice(0, 10) });
  }

  return (
    <>
      <PageHeader kicker="Money out" title="Expenses" lead={`Every shilling out — reagents, diesel, consumables. Total on books: ${formatMoney(total, db.settings.currencySymbol)}.`} />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="form-grid">
          <Field id="ex-r" label="Reason"><input id="ex-r" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Gloves restock" /></Field>
          <Field id="ex-a" label="Amount (KSh)"><input id="ex-a" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field id="ex-c" label="Category"><select id="ex-c" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Consumables</option><option>Lab</option><option>Utilities</option><option>Salaries</option><option>Rent</option><option>Other</option></select></Field>
          <Field id="ex-d" label="Date"><input id="ex-d" type="date" value={form.spentOn} onChange={(e) => setForm({ ...form, spentOn: e.target.value })} /></Field>
          <div><button type="button" className="solid" style={{ marginTop: 22 }} onClick={add}>Record expense</button></div>
        </div>
      </Panel>
      <Panel>
        <div className="table-wrap"><table><thead><tr><th>Date</th><th>Reason</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>{db.expenses.map((e) => <tr key={e.id}><td data-label="Date">{e.spentOn}</td><td data-label="Reason">{e.reason}</td><td data-label="Category">{e.category}</td><td data-label="Amount">{formatMoney(e.amount, db.settings.currencySymbol)}</td></tr>)}</tbody></table></div>
        {db.expenses.length === 0 ? <Empty>No expenses yet.</Empty> : null}
      </Panel>
    </>
  );
}
