"use client";

import { useState } from "react";
import { profile } from "@/content/site";

const TOPICS = ["Collaboration", "Partnership", "Speaking", "Esports / Gaming", "Sports", "Media", "Other"];

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; delivered: boolean }
  | { kind: "error"; message: string; fields?: Record<string, string> };

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setState({ kind: "error", message: json.error ?? "Please check the highlighted fields.", fields: json.errors });
        return;
      }
      form.reset();
      setState({ kind: "sent", delivered: json.delivered });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div className="border border-line bg-graphite/60 p-8" role="status">
        <p className="label text-crimson">Message received</p>
        <p className="display mt-4 text-4xl">Thank you.</p>
        <p className="mt-4 text-platinum/70">
          {state.delivered
            ? "Your enquiry has been delivered. Expect a reply by email."
            : "Your enquiry was accepted, but this site's delivery channel isn't connected yet."}
          {!state.delivered && profile.email && (
            <> Please also email <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>.</>
          )}
        </p>
        <button type="button" onClick={() => setState({ kind: "idle" })} className="label mt-6 underline">
          Send another
        </button>
      </div>
    );
  }

  const fieldErr = state.kind === "error" ? state.fields ?? {} : {};
  const input =
    "w-full border-b border-platinum/25 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-concrete/50 focus:border-crimson";

  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-8 ${compact ? "" : "md:grid-cols-2"}`}>
      <input type="text" name="company_site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="block">
        <span className="label text-concrete">Name</span>
        <input name="name" required autoComplete="name" className={input} aria-invalid={!!fieldErr.name} />
        {fieldErr.name && <span className="mt-1 block text-sm text-crimson">{fieldErr.name}</span>}
      </label>
      <label className="block">
        <span className="label text-concrete">Email</span>
        <input name="email" type="email" required autoComplete="email" className={input} aria-invalid={!!fieldErr.email} />
        {fieldErr.email && <span className="mt-1 block text-sm text-crimson">{fieldErr.email}</span>}
      </label>
      <label className={`block ${compact ? "" : "md:col-span-2"}`}>
        <span className="label text-concrete">Topic</span>
        <select name="topic" defaultValue="Collaboration" className={`${input} [&>option]:bg-graphite`}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={`block ${compact ? "" : "md:col-span-2"}`}>
        <span className="label text-concrete">Message</span>
        <textarea name="message" required rows={compact ? 4 : 6} className={`${input} resize-y`} aria-invalid={!!fieldErr.message} />
        {fieldErr.message && <span className="mt-1 block text-sm text-crimson">{fieldErr.message}</span>}
      </label>
      <div className={`flex flex-wrap items-center gap-6 ${compact ? "" : "md:col-span-2"}`}>
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="label bg-crimson px-8 py-4 transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {state.kind === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        {state.kind === "error" && <p className="text-sm text-crimson" role="alert">{state.message}</p>}
      </div>
    </form>
  );
}
