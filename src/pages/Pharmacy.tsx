import { useState } from "react";
import { daysUntil, formatMoney, uid } from "../../shared/format";
import { useStore, drugBase, drugStock } from "../lib/store";
import { PillIcon } from "../components/MedIcons";
import { Field, Notice, PageHeader, Panel, Pill, Empty } from "../components/ui";
import type { Drug } from "../types";

const blank = {
  name: "",
  strength: "",
  form: "Tablets",
  category: "General",
  basePrice: "",
  sellPrice: "",
  reorderLevel: "10",
  supplier: "",
  batch: "",
  manufactured: "",
  expiry: "",
  qty: "",
  buyPrice: "",
};

export function PharmacyPage() {
  const { db, update } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "expiry">("all");
  const [dose, setDose] = useState<Record<string, string>>({});
  const [ok, setOk] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const sym = db.settings.currencySymbol;

  const list = db.drugs.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase())).filter((d) => {
    if (filter === "low") return drugStock(d) <= d.reorderLevel;
    if (filter === "expiry") return d.batches.some((b) => daysUntil(b.expiry) <= 60);
    return true;
  });

  function set<K extends keyof typeof blank>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }

  function openEdit(drug: Drug) {
    const batch = [...drug.batches].sort((a, b) => a.expiry.localeCompare(b.expiry))[0];
    setEditing(drug.id);
    setForm({
      name: drug.name,
      strength: drug.strength,
      form: drug.form,
      category: drug.category,
      basePrice: String(drugBase(drug)),
      sellPrice: String(drug.sellPrice),
      reorderLevel: String(drug.reorderLevel),
      supplier: drug.supplier,
      batch: batch?.batch ?? "",
      manufactured: batch?.manufactured ?? "",
      expiry: batch?.expiry ?? "",
      qty: batch ? String(batch.qty) : "",
      buyPrice: batch ? String(batch.buyPrice) : "",
    });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim() || !form.batch.trim() || !form.manufactured || !form.expiry) return;
    const qty = Number(form.qty);
    if (!Number.isFinite(qty) || qty < 0) return;
    const line = {
      batch: form.batch.trim(),
      manufactured: form.manufactured,
      expiry: form.expiry,
      qty,
      buyPrice: Number(form.buyPrice) || 0,
    };
    const fields = {
      name: form.name.trim(),
      strength: form.strength.trim(),
      form: form.form.trim() || "Tablets",
      category: form.category.trim() || "General",
      basePrice: Number(form.basePrice) || Number(form.buyPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      supplier: form.supplier.trim(),
    };
    if (editing) {
      update((d) => {
        const drug = d.drugs.find((x) => x.id === editing);
        if (!drug) return d;
        Object.assign(drug, fields);
        const existing = drug.batches.find((b) => b.batch === line.batch);
        if (existing) Object.assign(existing, line);
        else drug.batches.push(line);
        return d;
      });
      setOk(`${fields.name} updated.`);
    } else {
      update((d) => {
        d.drugs.unshift({ id: uid("dr"), ...fields, batches: [line] });
        return d;
      });
      setOk(`${fields.name} added to the shelf.`);
    }
    setOpen(false);
    setEditing(null);
    setForm(blank);
  }

  function remove(drug: Drug) {
    if (!window.confirm(`Remove ${drug.name} from the pharmacy?`)) return;
    update((d) => {
      d.drugs = d.drugs.filter((x) => x.id !== drug.id);
      return d;
    });
    setOk(`${drug.name} removed.`);
  }

  function dispense(drugId: string, visitId: string, patientId: string, qty: number, drugName: string) {
    const doseText = dose[drugId] || "As directed";
    update((d) => {
      const drug = d.drugs.find((x) => x.id === drugId);
      if (!drug) return d;
      let need = qty;
      drug.batches.sort((a, b) => a.expiry.localeCompare(b.expiry));
      for (const b of drug.batches) {
        if (need <= 0) break;
        const take = Math.min(b.qty, need);
        b.qty -= take; need -= take;
      }
      drug.batches = drug.batches.filter((b) => b.qty > 0);
      d.prescriptions.unshift({ id: `rx-${Date.now()}`, visitId, patientId, drugId, drugName, dose: doseText, qty, dispensed: true, date: new Date().toISOString().slice(0, 10) });
      return d;
    });
    setOk(`${drugName} dispensed. Earliest expiry went out first.`);
  }

  return (
    <>
      <PageHeader kicker="Dispensary" title="Pharmacy" lead="Record each drug with its stock, the date it was made, and the date it expires. Dispensing still takes the earliest expiry first.">
        <button type="button" className="solid icon-btn" onClick={openNew}><PillIcon /> Add drug</button>
      </PageHeader>
      {ok ? <Notice tone="ok">{ok}</Notice> : null}

      {open ? (
        <Panel>
          <h2>{editing ? "Update drug" : "New drug"}</h2>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <Field id="dr-name" label="Drug name"><input id="dr-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Amoxicillin 500mg" /></Field>
            <Field id="dr-strength" label="Strength"><input id="dr-strength" value={form.strength} onChange={(e) => set("strength", e.target.value)} placeholder="500mg" /></Field>
            <Field id="dr-form" label="Form"><input id="dr-form" value={form.form} onChange={(e) => set("form", e.target.value)} placeholder="Tablets ×20" /></Field>
            <Field id="dr-cat" label="Category"><input id="dr-cat" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Antibiotic" /></Field>
            <Field id="dr-base" label="Base price"><input id="dr-base" inputMode="decimal" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} placeholder="210" /></Field>
            <Field id="dr-sell" label="Sell price"><input id="dr-sell" inputMode="decimal" value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)} placeholder="350" /></Field>
            <Field id="dr-reorder" label="Reorder at"><input id="dr-reorder" inputMode="numeric" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} /></Field>
            <Field id="dr-sup" label="Supplier"><input id="dr-sup" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="Cosmos Ltd" /></Field>
            <Field id="dr-batch" label="Batch number"><input id="dr-batch" value={form.batch} onChange={(e) => set("batch", e.target.value)} placeholder="AMX-2401" /></Field>
            <Field id="dr-mfg" label="Date of manufacture"><input id="dr-mfg" type="date" value={form.manufactured} onChange={(e) => set("manufactured", e.target.value)} /></Field>
            <Field id="dr-exp" label="Expiry date"><input id="dr-exp" type="date" value={form.expiry} onChange={(e) => set("expiry", e.target.value)} /></Field>
            <Field id="dr-qty" label="Quantity in stock"><input id="dr-qty" inputMode="numeric" value={form.qty} onChange={(e) => set("qty", e.target.value)} placeholder="100" /></Field>
            <Field id="dr-buy" label="Buy price"><input id="dr-buy" inputMode="decimal" value={form.buyPrice} onChange={(e) => set("buyPrice", e.target.value)} placeholder="210" /></Field>
          </div>
          <p className="field-hint" style={{ marginTop: 10 }}>
            Profit per unit {formatMoney((Number(form.sellPrice) || 0) - (Number(form.basePrice) || 0), sym)}. A new batch number on an existing drug adds that stock. The same batch number updates it.
          </p>
          <div className="actions" style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="button" className="solid" onClick={save}>{editing ? "Save changes" : "Save drug"}</button>
            <button type="button" className="ghost" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</button>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="toolbar">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["all", "low", "expiry"] as const).map((f) => (
              <button key={f} type="button" className={filter === f ? "solid" : "ghost"} onClick={() => setFilter(f)}>
                {f === "all" ? "All stock" : f === "low" ? "Low stock" : "Expiring"}
              </button>
            ))}
          </div>
          <div className="search"><Field id="ph-q" label="Search drugs"><input id="ph-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name" /></Field></div>
        </div>
        {list.length === 0 ? <Empty>No drugs match.</Empty> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Drug</th><th>Stock</th><th>Batches</th><th>Base</th><th>Sell</th><th>Profit</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const stock = drugStock(d);
                const low = stock <= d.reorderLevel;
                return (
                  <tr key={d.id}>
                    <td data-label="Drug">
                      <strong>{d.name}</strong>
                      <br /><span style={{ color: "var(--mute)" }}>{d.strength} · {d.form} · {d.category}</span>
                    </td>
                    <td data-label="Stock"><Pill tone={low ? "blue" : "green"}>{stock} {low ? "low" : "in stock"}</Pill></td>
                    <td data-label="Batches">
                      {d.batches.map((b) => (
                        <div key={b.batch} style={{ marginBottom: 4 }}>
                          {b.batch} · {b.qty} · made {b.manufactured || "—"} · exp {b.expiry}
                          {daysUntil(b.expiry) <= 60 ? " · soon" : ""}
                        </div>
                      ))}
                    </td>
                    <td data-label="Base">{formatMoney(drugBase(d), sym)}</td>
                    <td data-label="Sell">{formatMoney(d.sellPrice, sym)}<br /><span style={{ color: "var(--mute)" }}>{d.supplier}</span></td>
                    <td data-label="Profit">{formatMoney(d.sellPrice - drugBase(d), sym)}</td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button type="button" onClick={() => openEdit(d)}>Edit</button>
                        <button type="button" onClick={() => remove(d)}>Delete</button>
                      </div>
                      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                        <input aria-label={`Dose for ${d.name}`} placeholder="Dose, e.g. 1 tab BD" value={dose[d.id] ?? ""} onChange={(e) => setDose({ ...dose, [d.id]: e.target.value })} />
                        <button type="button" className="ghost" disabled={stock <= 0}
                          onClick={() => {
                            const v = db.visits.find((x) => x.date === new Date().toISOString().slice(0, 10));
                            dispense(d.id, v?.id ?? "walk-in", v?.patientId ?? db.patients[0]?.id ?? "walk-in", 1, d.name);
                          }}>Dispense 1</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
