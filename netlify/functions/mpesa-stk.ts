import type { Config } from "@netlify/functions";

// POST /api/mpesa-stk — stub for Safaricom Daraja STK push.
// Wire MPESA_* env vars in the Netlify UI, then replace the stub with a
// Daraja oauth + stkpush call. Never commit secrets to netlify.toml.
export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.json().catch(() => ({}));
  const { phone, amount, receipt } = body as { phone?: string; amount?: number; receipt?: string };
  if (!phone || !amount) return Response.json({ error: "phone and amount required" }, { status: 400 });
  const key = Netlify.env.get("MPESA_CONSUMER_KEY");
  if (!key) {
    // Demo mode — frontend shows "prompt sent ✓"
    return Response.json({ demo: true, message: `STK push simulated to ${phone} for KSh ${amount}`, receipt: receipt ?? null });
  }
  return Response.json({ ok: true, message: "STK push initiated" });
};

export const config: Config = { path: "/api/mpesa-stk", method: ["POST"] };
