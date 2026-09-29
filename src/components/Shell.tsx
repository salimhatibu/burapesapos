import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { displayName } from "../../shared/format";
import { applyTheme, readTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { finishGuide, GuideTour, hasFinishedGuide } from "./GuideTour";
import { PageSlide } from "./PageSlide";
import { VitalSplash } from "./VitalSplash";
import {
  BoxIcon, ChartIcon, ClipboardIcon, CloseIcon, CrossMark, FlaskIcon,
  GearIcon, HelpIcon, HomeIcon, MenuIcon, MoonIcon, PatientsIcon,
  PillIcon, PosIcon, QueueIcon, StaffIcon, SunIcon, WalletIcon,
} from "./MedIcons";

const LINKS = [
  { to: "/", label: "Dashboard", end: true, icon: HomeIcon },
  { to: "/pos", label: "Till / POS", end: false, icon: PosIcon },
  { to: "/queue", label: "Queue", end: false, icon: QueueIcon },
  { to: "/patients", label: "Patients", end: false, icon: PatientsIcon },
  { to: "/pharmacy", label: "Pharmacy", end: false, icon: PillIcon },
  { to: "/lab", label: "Lab", end: false, icon: FlaskIcon },
  { to: "/expenses", label: "Expenses", end: false, icon: WalletIcon },
  { to: "/reports", label: "Reports", end: false, icon: ChartIcon },
  { to: "/staff", label: "Staff", end: false, icon: StaffIcon },
  { to: "/suppliers", label: "Suppliers", end: false, icon: BoxIcon },
  { to: "/settings", label: "Settings", end: false, icon: GearIcon },
];

export function Shell() {
  const location = useLocation();
  const { db } = useStore();
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);
  const [splash, setSplash] = useState(() => {
    try { return !sessionStorage.getItem("burapesa-splash"); } catch { return true; }
  });
  const [guideOpen, setGuideOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 1180);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!splash && !hasFinishedGuide()) setGuideOpen(true);
  }, [splash]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const critical = db.drugs.filter((d) => {
    const stock = d.batches.reduce((a, b) => a + b.qty, 0);
    return stock <= d.reorderLevel;
  }).length;

  return (
    <div className={`app${guideOpen ? " is-guided" : ""}`}>
      <a className="skip" href="#content">Skip to content</a>
      <div className="bg-wash" aria-hidden="true">
        <div className="wave-glow" />
        <div className="wave-glow b" />
        <svg className="ecg-line" viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path d="M0 45 H380 L400 45 L412 15 L430 75 L444 28 L454 45 H700 L714 45 L724 20 L740 70 L752 30 L760 45 H1200" />
        </svg>
        <svg className="bg-text" viewBox="0 0 360 80" preserveAspectRatio="xMidYMid meet">
          <text x="180" y="62" textAnchor="middle">BURA + PESA</text>
        </svg>
      </div>

      <div className="header-wrap">
        <header ref={barRef} className={`topbar${compact ? " is-compact" : ""}${menuOpen ? " is-open" : ""}`} data-guide="nav">
          <NavLink to="/" className="brand" end>
            <span className="logo-mark" aria-hidden="true"><CrossMark /></span>
            <span className="logo-text">
              <span className="a">{displayName(db.settings.facilityName).split(" ").slice(0, 2).join(" ")} <em>POS</em></span>
              <span className="b">Clinic · Pharmacy · Lab</span>
            </span>
          </NavLink>
          <nav className="nav-pills" aria-label="Primary" hidden={compact}>
            {LINKS.slice(0, 7).map((l) => {
              const Icon = l.icon;
              return (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "nav-pill active" : "nav-pill")}>
                  <Icon />{l.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="top-actions">
            {critical > 0 ? (
              <NavLink to="/pharmacy" className="alert-pill">{critical} low stock</NavLink>
            ) : null}
            {compact ? (
              <button type="button" className="nav-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            ) : null}
            <button type="button" className="help-toggle" aria-label="How to use this site" onClick={() => setGuideOpen(true)}>
              <HelpIcon />
            </button>
            <button
              type="button"
              className={`theme-toggle theme-toggle-${theme}`}
              aria-label={theme === "light" ? "Switch to dark" : "Switch to light"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <span className="theme-toggle-knob" aria-hidden="true">
                <SunIcon className="theme-icon-sun" />
                <MoonIcon className="theme-icon-moon" />
              </span>
              <span className="theme-toggle-label">{theme}</span>
            </button>
          </div>
          {compact ? (
            <nav id="primary-menu" className={`nav-drawer${menuOpen ? " is-open" : ""}`} aria-label="Primary" hidden={!menuOpen}>
              {LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? "nav-pill active" : "nav-pill")}>
                    <Icon />{l.label}
                  </NavLink>
                );
              })}
            </nav>
          ) : null}
        </header>
      </div>

      <main id="content" className="content">
        <PageSlide><Outlet /></PageSlide>
      </main>

      <footer className="footer">
        <dl className="footer-grid">
          <div><dt className="kicker">Facility</dt><dd>{db.settings.facilityName}</dd></div>
          <div><dt className="kicker">Paybill</dt><dd>{db.settings.paybill} · {db.settings.tillNo}</dd></div>
          <div><dt className="kicker">KRA PIN</dt><dd>{db.settings.kraPin} · eTIMS {db.settings.etimsEnabled ? "on" : "off"}</dd></div>
          <div><dt className="kicker">Support</dt><dd><ClipboardIcon /> dpos-style demo data · Netlify-ready</dd></div>
        </dl>
      </footer>

      {splash ? (
        <VitalSplash onDone={() => {
          try { sessionStorage.setItem("burapesa-splash", "1"); } catch { /* noop */ }
          setSplash(false);
        }} />
      ) : null}
      {guideOpen && !splash ? (
        <GuideTour onClose={() => { finishGuide(); setGuideOpen(false); }} />
      ) : null}
    </div>
  );
}
