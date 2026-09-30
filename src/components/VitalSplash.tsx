import { useEffect, useState } from "react";

export function VitalSplash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 700);
    const t2 = setTimeout(onDone, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`vital-splash${leaving ? " leaving" : ""}`} aria-hidden="true">
      <div className="splash-layout">
        <p className="eyebrow">BuraPesa</p>
        <h1>Medical Centre</h1>
      </div>
    </div>
  );
}
