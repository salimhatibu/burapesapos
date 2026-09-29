import type { ReactNode } from "react";

export function PageHeader({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <p className="kicker">{kicker}</p>
      <div className="page-header-row">
        <h1>{title}</h1>
        {children}
      </div>
      {lead ? <p className="page-lead">{lead}</p> : null}
    </header>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="field-hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}

export function Notice({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "ok" }) {
  return <p className={tone === "ok" ? "notice ok" : "notice"} role={tone === "ok" ? "status" : "alert"}>{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel panel-light ${className}`.trim()}>{children}</section>;
}

export function Pill({ tone = "", children }: { tone?: "blue" | "green" | "amber" | "red" | "teal" | ""; children: ReactNode }) {
  return <span className={`pill ${tone}`.trim()}>{children}</span>;
}
