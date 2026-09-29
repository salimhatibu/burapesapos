import { useEffect, useState } from "react";

const STEPS = [
  { title: "Karibu — BuraPesa Hospital POS", body: "Reception registers patients, triage takes vitals, clinicians consult, pharmacy dispenses FEFO, lab runs tests, and the cashier bills everything in one consolidated receipt." },
  { title: "Start at the POS", body: "Use Till / POS to bill walk-in pharmacy sales or a patient's full visit — services + lab + drugs — with split Cash, M-Pesa, SHA and Insurance payments." },
  { title: "Watch expiries & stock", body: "Pharmacy tracks every batch with expiry dates. The dashboard flags anything expiring in 60 days and anything below reorder level, so nothing expires on the shelf." },
  { title: "Everything works on Netlify", body: "Run locally with demo data now. Connect Netlify Database (Postgres + Drizzle) and Functions later for multi-user, eTIMS receipts and M-Pesa STK push — no code changes needed." },
];

export function GuideTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState({ top: 120, left: 24 });

  useEffect(() => {
    const el = document.querySelector("[data-guide='nav']");
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ top: Math.min(window.innerHeight - 320, r.bottom + 12), left: 16 });
    }
  }, [step]);

  const s = STEPS[step];
  return (
    <>
      <div className="guide-layer"><div className="guide-hole" style={{ top: 8, left: 12, right: 12, height: 70 }} /></div>
      <div className="guide-card" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="Guide">
        <p className="kicker">Quick tour · {step + 1} of {STEPS.length}</p>
        <h2>{s.title}</h2>
        <p className="guide-body">{s.body}</p>
        <div className="guide-dots">{STEPS.map((_, i) => <span key={i} className={i === step ? "is-on" : ""} />)}</div>
        <div className="guide-actions">
          <button type="button" className="ghost" onClick={onClose}>Skip</button>
          {step > 0 ? <button type="button" className="ghost" onClick={() => setStep(step - 1)}>Back</button> : null}
          {step < STEPS.length - 1
            ? <button type="button" className="solid" onClick={() => setStep(step + 1)}>Next</button>
            : <button type="button" className="solid" onClick={onClose}>Start billing</button>}
        </div>
      </div>
    </>
  );
}

export function hasFinishedGuide(): boolean {
  try { return localStorage.getItem("burapesa-guide") === "done"; } catch { return true; }
}
export function finishGuide() {
  try { localStorage.setItem("burapesa-guide", "done"); } catch { /* noop */ }
}
