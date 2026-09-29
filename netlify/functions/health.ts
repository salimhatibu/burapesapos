import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _ctx: Context) => {
  return Response.json({
    ok: true,
    service: "burapesa-hospital-pos",
    time: new Date().toISOString(),
    modules: ["patients", "queue", "pharmacy-fefo", "lab", "pos", "expenses", "reports"],
  });
};

export const config: Config = { path: "/api/health" };
