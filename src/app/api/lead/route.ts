// Lead capture. No database in the MVP: we log the lead so it shows up in
// the Vercel function logs. Replace `sendToCrm` with a real CRM call later.

interface Lead {
  name: string;
  email: string;
  whatsapp: string;
  country?: string;
  examDate?: string;
  scenario?: string;
  predicted?: number;
  grade?: string;
  price?: string;
  plan?: string;
  black_friday?: boolean;
  source?: string;
}

const PLANS = ["last_minute", "exam_pass", "pro"];

const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function sendToCrm(lead: Lead & { createdAt: string }) {
  // Placeholder: e.g. POST to HubSpot / Airtable / Google Sheets webhook.
  console.log("[lead]", JSON.stringify(lead));
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lead: Lead = {
    name: s(body.name, 120),
    email: s(body.email, 200),
    whatsapp: s(body.whatsapp, 40),
    country: s(body.country, 40),
    examDate: s(body.examDate, 20),
    scenario: s(body.scenario, 40),
    predicted: typeof body.predicted === "number" ? body.predicted : undefined,
    grade: s(body.grade, 4),
    price: s(body.price, 20),
    plan: PLANS.includes(s(body.plan, 20)) ? s(body.plan, 20) : undefined,
    black_friday: typeof body.black_friday === "boolean" ? body.black_friday : undefined,
    source: s(body.source, 20) || undefined,
  };

  if (!lead.name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (lead.whatsapp.replace(/\D/g, "").length < 7)
    return Response.json({ error: "Please enter your WhatsApp number with country code." }, { status: 400 });

  await sendToCrm({ ...lead, createdAt: new Date().toISOString() });
  return Response.json({ ok: true });
}
