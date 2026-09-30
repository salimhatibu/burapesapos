import type { ReactNode } from "react";

export function RingStat({
  label,
  value,
  note,
  percent,
  critical,
}: {
  label: ReactNode;
  value: ReactNode;
  note: string;
  percent: number;
  critical?: boolean;
}) {
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const drawn = (clamped / 100) * circ;
  return (
    <article className={critical ? "stat stat-ring critical" : "stat stat-ring"}>
      <div className="ring" role="img" aria-label={`${clamped}%`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="ring-track" cx="60" cy="60" r={radius} />
          <circle
            className="ring-value"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={`${drawn} ${circ - drawn}`}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="ring-copy">
          <p className="figure ring-figure">{value}</p>
          <p className="kicker">{label}</p>
          <p className="stat-note">{note}</p>
        </div>
      </div>
    </article>
  );
}
