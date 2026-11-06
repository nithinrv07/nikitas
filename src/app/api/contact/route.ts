import { NextResponse } from "next/server";

/**
 * Contact endpoint.
 * Delivery: set CONTACT_WEBHOOK_URL (e.g. a Slack/Discord/Zapier/Make webhook or
 * your own mail service endpoint). The validated message is POSTed there as JSON.
 * Without it, the message is logged on the server and the UI says so honestly.
 */
const TOPICS = ["Collaboration", "Partnership", "Speaking", "Esports / Gaming", "Sports", "Media", "Other"];

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields.
  if (typeof data.company_site === "string" && data.company_site.length > 0) {
    return NextResponse.json({ ok: true, delivered: true });
  }

  const name = String(data.name ?? "").trim().slice(0, 120);
  const email = String(data.email ?? "").trim().slice(0, 200);
  const topic = String(data.topic ?? "Other");
  const message = String(data.message ?? "").trim().slice(0, 5000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email.";
  if (!TOPICS.includes(topic)) errors.topic = "Please choose a topic.";
  if (message.length < 10) errors.message = "Please write a little more (10+ characters).";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const payload = { name, email, topic, message, receivedAt: new Date().toISOString() };
  const hook = process.env.CONTACT_WEBHOOK_URL;

  if (!hook) {
    console.info("[contact] (no CONTACT_WEBHOOK_URL set) message received:", payload);
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `New enquiry from ${name} <${email}> — ${topic}\n\n${message}`, ...payload }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json({ ok: false, error: "Delivery failed. Please try again later." }, { status: 502 });
  }
}
