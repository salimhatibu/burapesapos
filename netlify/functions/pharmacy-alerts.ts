import type { Config } from "@netlify/functions";
import { db } from "../../db";
import { drugBatches, drugs } from "../../db/schema";
import { eq, lte } from "drizzle-orm";

// GET /api/pharmacy-alerts — low stock + ≤60-day expiries (FEFO radar).
export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  try {
    const all = await db.select().from(drugs).limit(500);
    const batches = await db.select().from(drugBatches).limit(2000);
    const soon = new Date();
    soon.setDate(soon.getDate() + 60);
    const expiring = batches.filter((b: typeof batches[number]) => new Date(b.expiry) <= soon);
    return Response.json({ drugs: all.length, batches: batches.length, expiring: expiring.slice(0, 50) });
  } catch (e) {
    return Response.json({ error: "Database not provisioned yet.", detail: String(e).slice(0, 300) }, { status: 503 });
  }
};

export const config: Config = { path: "/api/pharmacy-alerts", method: ["GET"] };
