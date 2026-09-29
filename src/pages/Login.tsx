import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrossMark } from "../components/MedIcons";
import { Field } from "../components/ui";

export function LoginPage() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");

  function enter(e: React.FormEvent) {
    e.preventDefault();
    try { sessionStorage.setItem("burapesa-auth", "1"); } catch { /* noop */ }
    nav("/");
  }

  return (
    <div className="login">
      <div className="login-copy">
        <svg className="login-ecg" viewBox="0 0 600 90" preserveAspectRatio="none">
          <path d="M0 45 H180 L196 45 L208 15 L226 75 L240 28 L250 45 H380 L394 45 L406 18 L422 72 L434 30 L442 45 H600" />
        </svg>
        <p className="eyebrow" style={{ color: "#fff" }}>Clinic POS · Kenya</p>
        <h1>BuraPesa<br />Hospital POS</h1>
        <p className="lede">Pharmacy FEFO, patient billing with M-Pesa + SHA, lab orders, eTIMS-ready receipts and shift reports — one till for the whole facility.</p>
        <p className="lede" style={{ marginTop: 12, fontSize: 14 }}>Demo PIN: anything works — e.g. <strong>1234</strong>. Data stays in this browser until you connect Netlify Database.</p>
      </div>
      <div className="login-panel">
        <span className="logo-mark" style={{ width: 48, height: 48 }}><CrossMark /></span>
        <h2>Sign in to the till</h2>
        <form onSubmit={enter}>
          <Field id="login-user" label="Staff name"><input id="login-user" placeholder="Faith — Reception" defaultValue="Faith — Reception" /></Field>
          <Field id="login-pin" label="PIN"><input id="login-pin" type="password" inputMode="numeric" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
          <button type="submit" className="solid">Open dashboard</button>
        </form>
      </div>
    </div>
  );
}

export function requireAuth(): boolean {
  try { return !!sessionStorage.getItem("burapesa-auth"); } catch { return true; }
}
