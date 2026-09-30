import { useMemo, useState } from "react";
import { formatMoney, uid } from "../../shared/format";
import { useStore, drugBase, drugStock } from "../lib/store";
import { d, t } from "../lib/seed";
import type { CartLine, PayMethod, Sale } from "../types";
import { Field, Notice, PageHeader, Panel, Pill } from "../components/ui";

const METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: "cash", label: "Cash", hint: "Till" },
  { id: "mpesa", label: "M-Pesa", hint: "STK push" },
  { id: "sha", label: "SHA", hint: "Claims" },
  { id: "insurance", label: "Insurance", hint: "Corporate" },
  { id: "card", label: "Card", hint: "PDQ" },
];

export function PosPage() {
  const { db, update } = useStore();
  const [tab, setTab] = useState<"drugs" | "services" | "lab">("drugs");
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payments, setPayments] = useState<{ method: PayMethod; amount: number; ref: string }[]>([{ method: "mpesa", amount: 0, ref: "" }]);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [done, setDone] = useState<Sale | null>(null);
  const [error, setError] = useState("");

  const sym = db.settings.currencySymbol;

  const catalog = useMemo(() => {
    const s = search.toLowerCase();
    const drugs = db.drugs.filter((x) => !s || x.name.toLowerCase().includes(s)).map((x) => ({ kind: "drug" as const, id: x.id, name: x.name, sub: `${x.strength} · ${x.form} · stock ${drugStock(x)}`, base: drugBase(x), price: x.sellPrice, stock: drugStock(x) }));
    const services = db.services.filter((x) => !s || x.name.toLowerCase().includes(s)).map((x) => ({ kind: "service" as const, id: x.id, name: x.name, sub: x.category, base: x.price, price: x.price, stock: 9999 }));
    const labs = db.labTests.filter((x) => !s || x.name.toLowerCase().includes(s)).map((x) => ({ kind: "lab" as const, id: x.id, name: x.name, sub: `${x.category} · ${x.tat}`, base: x.price, price: x.price, stock: 9999 }));
    if (tab === "drugs") return drugs;
    if (tab === "services") return services;
    return labs;
  }, [db, search, tab]);

  const subtotal = cart.reduce((a, l) => a + l.qty * l.price, 0);
  const profit = cart.reduce((a, l) => a + l.qty * (l.price - l.basePrice), 0);
  const total = Math.max(0, subtotal - discount);
  const paid = payments.reduce((a, p) => a + (Number(p.amount) || 0), 0);
  const due = total - paid;

  function add(kind: CartLine["kind"], refId: string, name: string, basePrice: number, price: number) {
    const key = `${kind}:${refId}`;
    setCart((c) => {
      const ex = c.find((l) => l.key === key);
      if (ex) return c.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { key, kind, refId, name, qty: 1, basePrice, price }];
    });
  }

  function checkout() {
    setError("");
    if (cart.length === 0) { setError("Add at least one item to the bill."); return; }
    if (due > 0.5) { setError(`Short by ${formatMoney(due, sym)}. Record full payment or leave the rest as a patient balance.`); return; }
    const patient = db.patients.find((p) => p.id === patientId) ?? null;
    const seq = db.receiptSeq + 1;
    const receiptNo = `RCT-${String(seq).padStart(6, "0")}`;
    const sale: Sale = {
      id: uid("sa"), receiptNo, date: d(0), time: t(),
      patientId: patient?.id ?? null, patientName: patient?.name ?? "Walk-in",
      walkIn: !patient, lines: cart, subtotal, discount, total,
      payments: payments.filter((p) => p.amount > 0),
      cashier: "Reception — Faith",
      etimsCu: db.settings.etimsEnabled ? `CU-${Date.now().toString(36).toUpperCase()}` : "OFFLINE",
    };
    update((draft) => {
      draft.receiptSeq = seq;
      draft.sales.unshift(sale);
      // FEFO deduct drug batches
      cart.filter((l) => l.kind === "drug").forEach((l) => {
        const drug = draft.drugs.find((x) => x.id === l.refId);
        if (!drug) return;
        let need = l.qty;
        drug.batches.sort((a, b) => a.expiry.localeCompare(b.expiry));
        for (const b of drug.batches) {
          if (need <= 0) break;
          const take = Math.min(b.qty, need);
          b.qty -= take; need -= take;
        }
        drug.batches = drug.batches.filter((b) => b.qty > 0);
      });
      return draft;
    });
    setDone(sale);
    setCart([]); setDiscount(0);
    setPayments([{ method: "mpesa", amount: 0, ref: "" }]);
  }

  return (
    <>
      <PageHeader kicker="Till / Point of sale" title="Bill in seconds" lead="Walk-in pharmacy sales or a full visit — services, lab and drugs on one receipt. Split across Cash, M-Pesa, SHA and Insurance like dPOS-style clinic tills." />

      {error ? <Notice>{error}</Notice> : null}

      <div className="pos-grid">
        <Panel>
          <div className="toolbar">
            <div style={{ display: "flex", gap: 8 }}>
              {(["drugs", "services", "lab"] as const).map((x) => (
                <button key={x} type="button" className={tab === x ? "solid" : "ghost"} style={{ textTransform: "capitalize" }} onClick={() => setTab(x)}>{x}</button>
              ))}
            </div>
            <div className="search">
              <Field id="pos-search" label="Search catalogue"><input id="pos-search" placeholder="Amoxicillin, consultation, malaria…" value={search} onChange={(e) => setSearch(e.target.value)} /></Field>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Base</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {catalog.map((c) => (
                  <tr key={c.kind + c.id}>
                    <td data-label="Item"><strong>{c.name}</strong><br /><span style={{ color: "var(--mute)", fontSize: 13 }}>{c.sub}</span></td>
                    <td data-label="Base">{formatMoney(c.base, sym)}</td>
                    <td data-label="Price">{formatMoney(c.price, sym)}</td>
                    <td><div className="row-actions"><button type="button" disabled={c.stock <= 0} onClick={() => add(c.kind, c.id, c.name, c.base, c.price)}>{c.stock <= 0 ? "Out" : "+ Add"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {catalog.length === 0 ? <p className="empty">Nothing found. Try another search.</p> : null}
        </Panel>

        <Panel className="cart">
          <p className="kicker">Current bill</p>
          <Field id="pos-patient" label="Patient (optional — walk-in if blank)">
            <select id="pos-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Walk-in sale</option>
              {db.patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.opNumber}</option>)}
            </select>
          </Field>
          {cart.length === 0 ? <p className="empty" style={{ marginTop: 12 }}>Cart is empty. Tap + Add.</p> : null}
          {cart.map((l) => (
            <div className="cart-line" key={l.key}>
              <span>
                <strong>{l.name}</strong><br />
                <span style={{ color: "var(--mute)", fontSize: 13 }}>Base {formatMoney(l.basePrice, sym)} · profit {formatMoney((l.price - l.basePrice) * l.qty, sym)}</span>
                <input aria-label={`Price for ${l.name}`} type="number" min={0} value={l.price} style={{ width: 96, marginTop: 6 }}
                  onChange={(e) => setCart((c) => c.map((x) => x.key === l.key ? { ...x, price: Math.max(0, Number(e.target.value) || 0) } : x))} />
              </span>
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" className="qty-btn" onClick={() => setCart((c) => c.map((x) => x.key === l.key ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>−</button>
                <strong>{l.qty}</strong>
                <button type="button" className="qty-btn" onClick={() => setCart((c) => c.map((x) => x.key === l.key ? { ...x, qty: x.qty + 1 } : x))}>+</button>
                <button type="button" className="qty-btn" onClick={() => setCart((c) => c.filter((x) => x.key !== l.key))}>×</button>
              </span>
            </div>
          ))}
          <Field id="pos-disc" label="Discount (KSh)">
            <input id="pos-disc" type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))} />
          </Field>
          <div className="cart-total"><span>Total</span><span>{formatMoney(total, sym)}</span></div>
          <p className="field-hint">Profit on this bill {formatMoney(profit, sym)}, from the price you enter minus each item’s base price.</p>

          <p className="kicker">Split payments</p>
          <div className="pay-grid">
            {METHODS.map((m) => {
              const on = payments.some((p) => p.method === m.id);
              return (
                <button key={m.id} type="button" className={`pay-opt${on ? " is-on" : ""}`}
                  onClick={() => setPayments((ps) => on ? ps.filter((p) => p.method !== m.id) : [...ps, { method: m.id, amount: 0, ref: "" }])}>
                  {m.label}<br /><span style={{ fontWeight: 400, fontSize: 12 }}>{m.hint}</span>
                </button>
              );
            })}
          </div>
          {payments.map((p, i) => (
            <div key={p.method} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <Field id={`amt-${i}`} label={`${p.method.toUpperCase()} amount`}>
                <input id={`amt-${i}`} type="number" min={0} value={p.amount || ""} placeholder="0"
                  onChange={(e) => setPayments((ps) => ps.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) || 0 } : x))} />
              </Field>
              <Field id={`ref-${i}`} label="Ref / approval">
                <input id={`ref-${i}`} value={p.ref} placeholder={p.method === "mpesa" ? "QK7X…" : "Claim no."}
                  onChange={(e) => setPayments((ps) => ps.map((x, j) => j === i ? { ...x, ref: e.target.value } : x))} />
              </Field>
            </div>
          ))}
          <Field id="mpesa-phone" label="M-Pesa phone (STK push — demo)">
            <input id="mpesa-phone" placeholder="0712 000 000" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} />
          </Field>
          <p className="field-hint">Demo STK: {mpesaPhone ? `prompt sent to ${mpesaPhone} ✓` : "enter a number to simulate the push"}</p>
          <p style={{ fontFamily: "var(--nums)", fontWeight: 600 }}>Paid {formatMoney(paid, sym)} · {due <= 0.5 ? "Balanced ✓" : `Due ${formatMoney(due, sym)}`}</p>
          <div className="actions" style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" className="ghost" onClick={() => { setCart([]); setDiscount(0); }}>Clear</button>
            <button type="button" className="solid" style={{ flex: 1 }} onClick={checkout}>Charge {formatMoney(total, sym)}</button>
          </div>
          <p className="field-hint" style={{ marginTop: 10 }}>eTIMS {db.settings.etimsEnabled ? `ON · ${db.settings.kraPin}` : "OFF"} · Receipt prints with control unit code.</p>
        </Panel>
      </div>

      {done ? (
        <div className="modal-veil" onClick={() => setDone(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <button type="button" className="modal-close" onClick={() => setDone(null)} aria-label="Close">×</button>
            <div className="receipt">
              <h3>{db.settings.facilityName}</h3>
              <p className="r-center">{db.settings.address}<br />{db.settings.phone} · {db.settings.kraPin}</p>
              <hr />
              <p>{done.receiptNo} · {done.date} {done.time}<br />Patient: {done.patientName}<br />Cashier: {done.cashier}</p>
              <hr />
              {done.lines.map((l) => (
                <p key={l.key} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{l.name} ×{l.qty}</span><span>{formatMoney(l.qty * l.price, sym)}</span>
                </p>
              ))}
              <hr />
              <p style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{formatMoney(done.subtotal, sym)}</span></p>
              <p style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>{formatMoney(done.discount, sym)}</span></p>
              <p style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15 }}><span>TOTAL</span><span>{formatMoney(done.total, sym)}</span></p>
              <p style={{ display: "flex", justifyContent: "space-between" }}><span>Profit</span><span>{formatMoney(done.lines.reduce((a, l) => a + l.qty * (l.price - (l.basePrice ?? l.price)), 0), sym)}</span></p>
              {done.payments.map((p, i) => <p key={i} style={{ display: "flex", justifyContent: "space-between" }}><span>{p.method.toUpperCase()} {p.ref}</span><span>{formatMoney(p.amount, sym)}</span></p>)}
              <hr />
              <p className="r-center">eTIMS CU: {done.etimsCu}<br />Paybill {db.settings.paybill}<br />*** Asante — Get well soon ***</p>
            </div>
            <div className="actions" style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" className="ghost" onClick={() => setDone(null)}>Close</button>
              <button type="button" className="solid" onClick={() => window.print()}>Print receipt</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
