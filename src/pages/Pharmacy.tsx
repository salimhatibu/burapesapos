import { useState } from "react";
import { daysUntil, formatMoney } from "../../shared/format";
import { useStore, drugStock } from "../lib/store";
import { Field, Notice, PageHeader, Panel, Pill, Empty } from "../components/ui";

export function PharmacyPage() {
  const { db, update } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "expiry">("all");
  const [dose, setDose] = useState<Record<string, string>>({});
  const [ok, setOk] = useState("");

  const list = db.drugs.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase())).filter((d) => {
    if (filter === "low") return drugStock(d) <= d.reorderLevel;
    if (filter === "expiry") return d.batches.some((b) => daysUntil(b.expiry) <= 60);
    return true;
  });

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
    setOk(`${drugName} dispensed FEFO — earliest expiry first.`);
  }

  return (
    <>
      <PageHeader kicker="Dispensary · FEFO" title="Pharmacy" lead="Batch + expiry tracking with First-Expiry-First-Out dispensing. Anything expiring within 60 days is quarantined to the top of the pick list.">
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "low", "expiry"] as const).map((f) => (
            <button key={f} type="button" className={filter === f ? "solid" : "ghost"} style={{ textTransform: "capitalize" }} onClick={() => setFilter(f)}>{f === "all" ? "All" : f}</button>
          ))}
        </div>
      </PageHeader>
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="toolbar">
          <p className="kicker">{list.length} products · {db.prescriptions.filter((r) => !r.dispensed).length} prescriptions waiting</p>
          <div className="search"><Field id="ph-q" label="Search drugs"><input id="ph-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Amoxicillin…" /></Field></div>
        </div>
        {list.length === 0 ? <Empty>Nothing here. Try another filter.</Empty> : null}
        {list.map((d) => {
          const stock = drugStock(d);
          const low = stock <= d.reorderLevel;
          const soon = d.batches.filter((b) => daysUntil(b.expiry) <= 60);
          return (
            <div key={d.id} style={{ border: "1px solid var(--line)", borderRadius: 18, padding: 16, marginBottom: 12, background: low ? "linear-gradient(180deg, rgba(220,38,38,0.05), transparent)" : "var(--card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
                <div>
                  <strong style={{ fontSize: 17 }}>{d.name}</strong>
                  <p style={{ margin: "4px 0", color: "var(--mute)", fontSize: 13 }}>{d.strength} · {d.form} · {d.category} · {d.supplier} · <strong style={{ color: "var(--accent)" }}>{formatMoney(d.sellPrice, db.settings.currencySymbol)}</strong></p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <Pill tone={low ? "red" : "green"}>{stock} in stock</Pill>
                    {soon.length > 0 ? <Pill tone="amber">⚠ {soon.length} batch{soon.length > 1 ? "es" : ""} ≤ 60d</Pill> : <Pill tone="teal">FEFO clear</Pill>}
                    {d.batches.map((b) => (
                      <Pill key={b.batch} tone={daysUntil(b.expiry) <= 60 ? "red" : ""}>{b.batch} · {b.qty} · exp {b.expiry}</Pill>
                    ))}
                  </div>
                </div>
                <div style={{ minWidth: 220, display: "grid", gap: 8 }}>
                  <Field id={`dose-${d.id}`} label="Dose directions"><input id={`dose-${d.id}`} placeholder="1 tab BD ×5/7" value={dose[d.id] ?? ""} onChange={(e) => setDose({ ...dose, [d.id]: e.target.value })} /></Field>
                  <button type="button" className="solid" disabled={stock <= 0}
                    onClick={() => {
                      const v = db.visits.find((x) => x.date === new Date().toISOString().slice(0, 10));
                      dispense(d.id, v?.id ?? "walk-in", v?.patientId ?? db.patients[0]?.id ?? "walk-in", 1, d.name);
                    }}>Dispense 1 (FEFO)</button>
                </div>
              </div>
            </div>
          );
        })}
      </Panel>
    </>
  );
}
