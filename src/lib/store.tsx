import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DB } from "../types";
import { seedDB } from "./seed";

const KEY = "burapesa-hms-v1";

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && Array.isArray(parsed.patients)) {
        if (!Array.isArray(parsed.reports)) parsed.reports = [];
        for (const drug of parsed.drugs ?? []) {
          for (const batch of drug.batches ?? []) {
            if (!batch.manufactured) batch.manufactured = "";
          }
          if (typeof drug.basePrice !== "number") {
            drug.basePrice = drug.batches?.[0]?.buyPrice ?? drug.sellPrice ?? 0;
          }
        }
        for (const sale of parsed.sales ?? []) {
          for (const line of sale.lines ?? []) {
            if (typeof line.basePrice !== "number") {
              const drug = parsed.drugs?.find((d) => d.id === line.refId);
              line.basePrice = drug?.basePrice ?? line.price;
            }
          }
        }
        return parsed;
      }
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

export function drugBase(drug: DB["drugs"][number]): number {
  if (typeof drug.basePrice === "number" && drug.basePrice > 0) return drug.basePrice;
  return drug.batches[0]?.buyPrice ?? 0;
}
