import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { CrossMark } from "../components/MedIcons";
import { authMessage, useAuth } from "../lib/auth";
import { Field, Notice } from "../components/ui";

type Mode = "sign-in" | "sign-up" | "recover";

export function LoginPage() {
  const { user, ready, pending, signIn, signUp, sendRecovery, setNewPassword, acceptInvitation, clearPending } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  if (!ready) return <p className="loading-line">Checking access…</p>;
  if (user && !pending) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNote("");
    setBusy(true);
    try {
      if (pending?.type === "recovery") {
        await setNewPassword(password);
        return;
      }
      if (pending?.type === "invite") {
        await acceptInvitation(password);
        return;
      }
      if (mode === "recover") {
        await sendRecovery(email);
        setNote("Check your email for a link to choose a new password.");
        return;
      }
      if (mode === "sign-up") {
        const created = await signUp(email, password, name);
        if (created.confirmedAt) {
          setNote("Account created. You are signed in.");
        } else {
          setNote("Account created. Confirm the email Netlify sent, then sign in.");
          setMode("sign-in");
          setPassword("");
        }
        return;
      }
      await signIn(email, password);
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const title = pending?.type === "recovery"
    ? "Choose a new password."
    : pending?.type === "invite"
      ? "Accept your invite."
      : mode === "sign-up"
        ? "Create a facility account."
        : mode === "recover"
          ? "Reset your password."
          : "Sign in to the facility.";

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
        <h1>{title}</h1>
        <p className="lede">Access is issued by Netlify Identity. Confirmed accounts can open the queue, pharmacy, and till.</p>
        {error ? <Notice>{error}</Notice> : null}
        {note ? <Notice tone="ok">{note}</Notice> : null}
        <form className="login-form" onSubmit={submit}>
          {mode === "sign-up" && !pending ? (
            <Field id="auth-name" label="Your name">
              <input id="auth-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
          ) : null}
          {!pending ? (
            <Field id="auth-email" label="Email">
              <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
          ) : null}
          {mode !== "recover" || pending ? (
            <Field id="auth-password" label={pending ? "New password" : "Password"}>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "sign-in" && !pending ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          ) : null}
          <button type="submit" className="solid" disabled={busy}>
            {busy ? "Please wait…" : pending ? "Save password" : mode === "sign-up" ? "Create account" : mode === "recover" ? "Send reset link" : "Sign in"}
          </button>
        </form>
        {!pending && mode === "sign-in" ? (
          <button type="button" className="auth-switch" onClick={() => { setMode("recover"); setError(""); setNote(""); }}>Forgot password</button>
        ) : null}
        {!pending && mode !== "recover" ? (
          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setMode(mode === "sign-up" ? "sign-in" : "sign-up");
              setError("");
              setNote("");
            }}
          >
            {mode === "sign-up" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        ) : null}
        {!pending && mode === "recover" ? (
          <button type="button" className="auth-switch" onClick={() => { setMode("sign-in"); setError(""); setNote(""); }}>Back to sign in</button>
        ) : null}
        {pending ? (
          <button type="button" className="auth-switch" onClick={() => { clearPending(); setPassword(""); }}>Back to sign in</button>
        ) : null}
      </div>
    </div>
  );
}
