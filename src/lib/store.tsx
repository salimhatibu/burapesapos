import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DB } from "../types";
import { seedDB } from "./seed";

const KEY = "burapesa-hms-v1";

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && Array.isArray(parsed.patients)) return parsed;
    }
  } catch { /* fresh seed */ }
  return seedDB();
}

type Store = {
  db: DB;
  save: (next: DB) => void;
  update: (fn: (d: DB) => DB) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ }
  }, [db]);

  const save = useCallback((next: DB) => setDb(next), []);
  const update = useCallback((fn: (d: DB) => DB) => setDb((prev) => fn(structuredClone(prev))), []);
  const reset = useCallback(() => setDb(seedDB()), []);

  const value = useMemo(() => ({ db, save, update, reset }), [db, save, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

export function drugStock(drug: DB["drugs"][number]): number {
  return drug.batches.reduce((a, b) => a + b.qty, 0);
}
