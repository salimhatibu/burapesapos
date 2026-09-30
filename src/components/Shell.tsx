import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { displayName } from "../../shared/format";
import { applyTheme, readTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { useStore } from "../lib/store";
import { finishGuide, GuideTour, hasFinishedGuide } from "./GuideTour";
import { PageSlide } from "./PageSlide";
import { PulseMonitor } from "./PulseMonitor";
import { VitalSplash } from "./VitalSplash";
import {
  BoxIcon, ChartIcon, CloseIcon, CrossMark, FlaskIcon,
  GearIcon, HelpIcon, HomeIcon, MenuIcon, MoonIcon, PatientsIcon,
  PillIcon, PosIcon, QueueIcon, StaffIcon, SunIcon, WalletIcon,
} from "./MedIcons";

const GROUPS = [
  {
    label: "Clinical",
    links: [
      { to: "/", label: "Dashboard", end: true, icon: HomeIcon },
      { to: "/queue", label: "Queue", end: false, icon: QueueIcon },
      { to: "/patients", label: "Patients", end: false, icon: PatientsIcon },
      { to: "/lab", label: "Laboratory", end: false, icon: FlaskIcon },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/pos", label: "Till", end: false, icon: PosIcon },
      { to: "/pharmacy", label: "Pharmacy", end: false, icon: PillIcon },
    ],
  },
  {
    label: "Finance",
    links: [
      { to: "/expenses", label: "Expenses", end: false, icon: WalletIcon },
      { to: "/reports", label: "Reports", end: false, icon: ChartIcon },
      { to: "/suppliers", label: "Suppliers", end: false, icon: BoxIcon },
    ],
  },
  {
    label: "Administration",
    links: [
      { to: "/staff", label: "Staff", end: false, icon: StaffIcon },
      { to: "/settings", label: "Settings", end: false, icon: GearIcon },
    ],
  },
];

export function Shell() {
  const location = useLocation();
  const nav = useNavigate();
  const { db } = useStore();
  const { signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);
  const [splash, setSplash] = useState(() => {
    try { return !sessionStorage.getItem("burapesa-splash"); } catch { return true; }
  });
  const [guideOpen, setGuideOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      document.documentElement.style.setProperty("--mouse-x", String(x));
      document.documentElement.style.setProperty("--mouse-y", String(y));
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!splash && !hasFinishedGuide()) setGuideOpen(true);
  }, [splash]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const critical = db.drugs.filter((d) => {
    const stock = d.batches.reduce((a, b) => a + b.qty, 0);
    return stock <= d.reorderLevel;
  }).length;

  const facility = displayName(db.settings.facilityName);

  return (
    <div className={`app${guideOpen ? " is-guided" : ""}`}>
      <a className="skip" href="#content">Skip to content</a>
      <div className="night-sky" aria-hidden="true">
        <div className="sky-parallax">
          <div className="star-rotation"><div className="stars" /></div>
        </div>
      </div>
      <div className="global-glow" aria-hidden="true" />
      <button type="button" className={`side-veil${menuOpen ? " is-open" : ""}`} aria-label="Close menu" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
      <aside id="primary-menu" className={`side-menu${menuOpen ? " is-open" : ""}`} data-guide="nav">
        <NavLink to="/" className="side-brand" end>
          <span className="logo-mark" aria-hidden="true"><CrossMark /></span>
          <span className="logo-text">
            <span className="a">BuraPesa</span>
            <span className="b">{facility}</span>
          </span>
        </NavLink>
        <nav aria-label="Primary">
          {GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <p className="nav-label">{group.label}</p>
              {group.links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? "nav-pill active" : "nav-pill")}>
                    <Icon />
                    <span>{l.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <p className="side-foot">
          <span className="side-dot" aria-hidden="true" />
          eTIMS {db.settings.etimsEnabled ? "on" : "off"}
        </p>
      </aside>

      <div className="workspace">
        <PulseMonitor className="is-bg" />
        <div className="header-wrap">
          <header className="topbar">
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="primary-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <p className="topbar-context">{facility}</p>
            <div className="top-actions">
              {critical > 0 ? (
                <Link to="/pharmacy" className="alert-pill">{critical} low stock</Link>
              ) : null}
              <button type="button" className="help-toggle" aria-label="How to use this site" onClick={() => setGuideOpen(true)}>
                <HelpIcon />
              </button>
              <button
                type="button"
                className="text-button sign-out"
                onClick={() => {
                  signOut().finally(() => nav("/login", { replace: true }));
                }}
              >
                Sign out
              </button>
              <label className="theme-switch">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  aria-label={theme === "light" ? "Switch to dark" : "Switch to light"}
                  onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
                />
                <span className="slider">
                  <SunIcon className="theme-icon-sun" />
                  <MoonIcon className="theme-icon-moon" />
                </span>
              </label>
            </div>
          </header>
        </div>

        <main id="content" className="content">
          <PageSlide><Outlet /></PageSlide>
        </main>

        <footer className="footer">
          <p>
            {facility}
            <span>Paybill {db.settings.paybill}</span>
            <span>KRA {db.settings.kraPin}</span>
            <span>eTIMS {db.settings.etimsEnabled ? "on" : "off"}</span>
          </p>
        </footer>
      </div>

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
