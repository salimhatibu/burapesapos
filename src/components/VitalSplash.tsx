import { useEffect, useState } from "react";
import { CrossMark } from "./MedIcons";

export function VitalSplash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1700);
    const t2 = setTimeout(onDone, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`vital-splash${leaving ? " leaving" : ""}`} aria-hidden="true">
      <div className="vital-inner">
        <div className="vital-cross"><CrossMark /></div>
        <h1>BuraPesa</h1>
        <p>Hospital POS · Pharmacy · Lab · Billing</p>
        <svg className="vital-ecg" viewBox="0 0 400 70" preserveAspectRatio="none">
          <path d="M0 35 H110 L125 35 L135 12 L150 58 L162 22 L172 35 H230 L244 35 L252 18 L266 52 L276 28 L284 35 H400" />
        </svg>
      </div>
    </div>
  );
}
