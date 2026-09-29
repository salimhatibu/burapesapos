import type { Config } from "@netlify/functions";
import { db } from "../../db";
import { patients } from "../../db/schema";
import { desc } from "drizzle-orm";

// GET /api/patients — list patients (Netlify Database / Drizzle).
// Falls back to a friendly 503 when the DB isn't provisioned yet
// (the frontend then uses its built-in demo data).
export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  try {
    const rows = await db.select().from(patients).orderBy(desc(patients.createdAt)).limit(100);
    return Response.json({ patients: rows });
  } catch (e) {
    return Response.json(
      { error: "Database not provisioned yet. Run `netlify database init --yes`.", detail: String(e).slice(0, 300) },
      { status: 503 }
    );
  }
};

export const config: Config = { path: "/api/patients", method: ["GET"] };
