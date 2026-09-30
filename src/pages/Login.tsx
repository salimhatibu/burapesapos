import { useNavigate } from "react-router-dom";
import { CrossMark } from "../components/MedIcons";

export function LoginPage() {
  const nav = useNavigate();

  function enter() {
    try { sessionStorage.setItem("burapesa-auth", "1"); } catch { /* noop */ }
    nav("/");
  }

  return (
    <div className="login">
      <div className="night-sky" aria-hidden="true">
        <div className="sky-parallax">
          <div className="star-rotation"><div className="stars" /></div>
        </div>
      </div>
      <div className="login-copy">
        <span className="logo-mark" aria-hidden="true"><CrossMark /></span>
        <p className="eyebrow">BuraPesa</p>
        <h1>Hospital operations, in one place.</h1>
        <p className="lede">Pharmacy, billing, laboratory, and the day’s queue — kept in one record for the facility.</p>
        <button type="button" className="solid" onClick={enter}>Enter facility</button>
      </div>
    </div>
  );
}

export function requireAuth(): boolean {
  try { return !!sessionStorage.getItem("burapesa-auth"); } catch { return true; }
}
