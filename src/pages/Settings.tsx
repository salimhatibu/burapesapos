import { useState } from "react";
import { useStore } from "../lib/store";
import { Field, Notice, PageHeader, Panel } from "../components/ui";

export function SettingsPage() {
  const { db, update, reset } = useStore();
  const [s, setS] = useState(db.settings);
  const [ok, setOk] = useState("");

  function save() {
    update((d) => { d.settings = { ...s }; return d; });
    setOk("Settings saved — receipts, paybill and headers update immediately.");
  }

  return (
    <>
      <PageHeader kicker="Facility profile" title="Settings" lead="Name, currency, M-Pesa paybill/till, KRA PIN and eTIMS. Prints on every receipt and report." />
      {ok ? <Notice tone="ok">{ok}</Notice> : null}
      <Panel>
        <div className="form-grid">
          <Field id="s-name" label="Facility name"><input id="s-name" value={s.facilityName} onChange={(e) => setS({ ...s, facilityName: e.target.value })} /></Field>
          <Field id="s-cur" label="Currency symbol"><input id="s-cur" value={s.currencySymbol} onChange={(e) => setS({ ...s, currencySymbol: e.target.value })} /></Field>
          <Field id="s-addr" label="Address"><input id="s-addr" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
          <Field id="s-phone" label="Phone"><input id="s-phone" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
          <Field id="s-pay" label="M-Pesa Paybill"><input id="s-pay" value={s.paybill} onChange={(e) => setS({ ...s, paybill: e.target.value })} /></Field>
          <Field id="s-till" label="Till number"><input id="s-till" value={s.tillNo} onChange={(e) => setS({ ...s, tillNo: e.target.value })} /></Field>
          <Field id="s-pin" label="KRA PIN"><input id="s-pin" value={s.kraPin} onChange={(e) => setS({ ...s, kraPin: e.target.value })} /></Field>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" style={{ width: 18 }} checked={s.etimsEnabled} onChange={(e) => setS({ ...s, etimsEnabled: e.target.checked })} /> eTIMS compliant receipts</label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" style={{ width: 18 }} checked={s.shaEnabled} onChange={(e) => setS({ ...s, shaEnabled: e.target.checked })} /> SHA claims enabled</label>
        </div>
        <div className="actions" style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button type="button" className="solid" onClick={save}>Save settings</button>
          <button type="button" className="danger" onClick={() => { reset(); setS(db.settings); setOk("Demo data restored."); }}>Restore demo data</button>
        </div>
      </Panel>
      <Panel>
        <p className="kicker">Netlify deployment</p>
        <h2 style={{ margin: "4px 0 8px" }}>Go live in 3 steps</h2>
        <ol style={{ lineHeight: 1.8, color: "var(--text-2)" }}>
          <li><code>npx netlify link</code> then <code>npx netlify deploy --build --prod</code></li>
          <li><code>netlify database init --yes</code> to provision Postgres, then <code>npm run db:generate &amp;&amp; npm run db:migrate</code> locally</li>
          <li>Set <code>PAYBILL</code>, <code>KRA_PIN</code>, <code>MPESA_KEY</code> in Netlify env vars — never in <code>netlify.toml</code></li>
        </ol>
      </Panel>
    </>
  );
}
