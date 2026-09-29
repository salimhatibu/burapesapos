import type { ReactNode } from "react";

type P = { className?: string };

function Stroke({ className, children }: P & { children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function CrossMark({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor" />
    </svg>
  );
}

export function HomeIcon({ className }: P) {
  return (<Stroke className={className}><path d="M3 11 12 3l9 8" /><path d="M5 9v12h14V9" /></Stroke>);
}
export function PosIcon({ className }: P) {
  return (<Stroke className={className}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4M7 9h4M7 12h7" /></Stroke>);
}
export function PatientsIcon({ className }: P) {
  return (<Stroke className={className}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 3-6 6-6s6 2 6 6" /><path d="M17 8v6M14 11h6" /></Stroke>);
}
export function QueueIcon({ className }: P) {
  return (<Stroke className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></Stroke>);
}
export function PillIcon({ className }: P) {
  return (<Stroke className={className}><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)" /><path d="M9.5 9.5l5 5" /></Stroke>);
}
export function FlaskIcon({ className }: P) {
  return (<Stroke className={className}><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /><path d="M8 15h8" /></Stroke>);
}
export function WalletIcon({ className }: P) {
  return (<Stroke className={className}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 15h2" /></Stroke>);
}
export function ChartIcon({ className }: P) {
  return (<Stroke className={className}><path d="M4 18l5-6 4 4 7-9" /><path d="M14 7h6v6" /></Stroke>);
}
export function StaffIcon({ className }: P) {
  return (<Stroke className={className}><circle cx="8" cy="8" r="3" /><path d="M2 20c0-4 2.5-6 6-6s6 2 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M16 20c0-2.5 1.5-4 3.5-4 1.5 0 2.5 1 2.5 3" /></Stroke>);
}
export function BoxIcon({ className }: P) {
  return (<Stroke className={className}><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></Stroke>);
}
export function GearIcon({ className }: P) {
  return (<Stroke className={className}><circle cx="12" cy="12" r="3" /><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1" /></Stroke>);
}
export function HeartPulseIcon({ className }: P) {
  return (<Stroke className={className}><path d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 2 0 3.5 1.2 5.5 3.5C13.9 6.2 15.5 5 17.5 5c3 0 4.7 3.3 3.5 6-2 4.5-9 9-9 9z" /><path d="M4 12h4l2-3 3 6 2-3h5" /></Stroke>);
}
export function StethIcon({ className }: P) {
  return (<Stroke className={className}><path d="M5 3v6a4 4 0 0 0 8 0V3" /><path d="M5 3H3.5M9 3h1.5M15 3h-1.5M19 3h1.5" /><path d="M13 13v3a5 5 0 0 1-10 0v-1" /><circle cx="17" cy="17" r="3" /></Stroke>);
}
export function SyringeIcon({ className }: P) {
  return (<Stroke className={className}><path d="M4 20l3-3M7 17l-2-2 9-9 4 4-9 9-2-2zM13 8l3 3M15 6l3 3M18 3l3 3" /></Stroke>);
}
export function ClipboardIcon({ className }: P) {
  return (<Stroke className={className}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h6" /></Stroke>);
}
export function ReceiptIcon({ className }: P) {
  return (<Stroke className={className}><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" /><path d="M9 8h6M9 12h6" /></Stroke>);
}
export function SunIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" /></g>
    </svg>
  );
}
export function MoonIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M18.2 5.2a10.2 10.2 0 1 0 8.4 15.6 8.2 8.2 0 1 1-8.4-15.6z" />
    </svg>
  );
}
export function MenuIcon({ className }: P) {
  return (<Stroke className={className}><path d="M4 7h16M4 12h16M4 17h16" /></Stroke>);
}
export function CloseIcon({ className }: P) {
  return (<Stroke className={className}><path d="M6 6l12 12M18 6L6 18" /></Stroke>);
}
export function HelpIcon({ className }: P) {
  return (<Stroke className={className}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.4c.2-1.6 1.4-2.4 2.6-2.4 1.4 0 2.4.9 2.4 2.2 0 1.4-1.2 2-2.1 2.6-.5.4-.7.8-.7 1.5M12 16.6v.1" /></Stroke>);
}
export function MpesaIcon({ className }: P) {
  return (<Stroke className={className}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Stroke>);
}
export function ShieldIcon({ className }: P) {
  return (<Stroke className={className}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></Stroke>);
}
