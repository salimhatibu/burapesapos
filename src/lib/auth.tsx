import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthError,
  MissingIdentityError,
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  requestPasswordRecovery,
  signup,
  updateUser,
  type User,
} from "@netlify/identity";

type Pending =
  | { type: "recovery" }
  | { type: "invite"; token: string }
  | null;

type AuthState = {
  user: User | null;
  ready: boolean;
  pending: Pending;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  sendRecovery: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
  acceptInvitation: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearPending: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function authMessage(error: unknown): string {
  if (error instanceof MissingIdentityError) {
    return "Netlify Identity is not enabled for this site yet. Turn it on under Project configuration, then Identity.";
  }
  if (error instanceof AuthError) {
    if (error.status === 404) return "Netlify Identity is not enabled for this site yet. Turn it on under Project configuration, then Identity.";
    if (error.status === 401) return "That email or password is not recognised.";
    if (error.status === 403) return "New accounts are not open on this site.";
    if (error.status === 422) return error.message || "Check the email and use a longer password.";
    return error.message;
  }
  return "Could not reach Netlify Identity. Try again in a moment.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const result = await handleAuthCallback();
        if (result?.type === "recovery") {
          setPending({ type: "recovery" });
          nav("/login", { replace: true });
        } else if (result?.type === "invite" && result.token) {
          setPending({ type: "invite", token: result.token });
          nav("/login", { replace: true });
        }
      } catch {
        /* Login page explains callback failures. */
      }
      const current = await getUser();
      if (!cancel) {
        setUser(current);
        setReady(true);
      }
    })();
    const unsubscribe = onAuthChange((_event, current) => setUser(current));
    return () => {
      cancel = true;
      unsubscribe();
    };
  }, [nav]);

  const value = useMemo<AuthState>(() => ({
    user,
    ready,
    pending,
    clearPending: () => setPending(null),
    signIn: (email, password) => login(email, password),
    signUp: (email, password, name) => signup(email, password, { full_name: name }),
    sendRecovery: (email) => requestPasswordRecovery(email),
    setNewPassword: async (password) => {
      await updateUser({ password });
      setPending(null);
    },
    acceptInvitation: async (password) => {
      if (pending?.type !== "invite") throw new AuthError("This invite link is no longer valid.");
      await acceptInvite(pending.token, password);
      setPending(null);
    },
    signOut: async () => {
      await logout();
      setUser(null);
      setPending(null);
    },
  }), [user, ready, pending]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(Ctx);
  if (!value) throw new Error("AuthProvider missing");
  return value;
}
