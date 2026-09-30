import { useId } from "react";

const TRACE =
  "M13,345.056c0,0,181.559,0,197.824,0s19.235-37.914,30.394-37.33c14.786,0.774,9.689,48.615,27.664,48.615c16.654,0,18.426-155.599,20.173-171.027s8.672-6.88,8.672-0.023c0,6.857,3.016,188.349,4.718,210.105c1.251,15.993,8.25,11.16,9.542,1.028c1.311-10.285,4.058-74.211,17.194-74.211s4.376,22.844,25.92,22.844c10.696,0,226.399,0,226.399,0";

/** Monitor trace with a cyan glow and fading echoes. No audio. */
export function PulseMonitor({ className = "", label }: { className?: string; label?: string }) {
  const uid = useId().replace(/:/g, "");
  const glow = `glow-${uid}`;
  return (
    <div className={`pulse-monitor ${className}`.trim()} aria-hidden="true">
      {label ? (
        <span className="pulse-label">
          <span className="live-dot" /> {label}
        </span>
      ) : null}
      <svg viewBox="0 160 600 280" preserveAspectRatio="none">
        <defs>
          <filter id={glow} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0.1, 0.18, 0.3].map((opacity, i) => (
          <path key={i} className="pulse-echo" d={TRACE} style={{ opacity, animationDelay: `${i * 0.16}s` }} />
        ))}
        <path className="pulse-lead" d={TRACE} filter={`url(#${glow})`} />
      </svg>
    </div>
  );
}
