"use client";

import { useState } from "react";

const ROLES = [
  { value: "agent", label: "Agent" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "brokerage", label: "Brokerage" },
];

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function EarlyAccess() {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.role) errs.role = "Please select a role.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 201) setStatus("success");
      else if (res.status === 409) setStatus("duplicate");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <section id="early-access" className="bg-[#FAF8F5] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-[#1D8A8A]/10 border border-[#1D8A8A]/30 rounded-xl p-8">
            <p className="font-serif text-xl text-[#1D8A8A]">
              {status === "success"
                ? "You're on the list."
                : "You're already on the list."}
            </p>
            <p className="text-stone-500 mt-2">
              We&apos;ll be in touch when your spot opens up.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="early-access" className="bg-[#FAF8F5] py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
          Be among the first to use TurnKey.
        </h2>
        <p className="text-stone-500 text-lg mb-10">
          We&apos;re opening early access to a small group who want to help
          shape what TurnKey becomes. No commitment required — just a chance to
          get in early.
        </p>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 text-left">
          <div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-5 py-4 rounded-lg border border-[#F0ECE6] bg-white text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1D8A8A]/40 text-base"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-5 py-4 rounded-lg border border-[#F0ECE6] bg-white text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1D8A8A]/40 text-base"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-5 py-4 rounded-lg border border-[#F0ECE6] bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1D8A8A]/40 text-base"
            >
              <option value="">I am a...</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>
          {status === "error" && (
            <p className="text-red-500 text-sm">
              Something went wrong. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#C4674A] hover:bg-[#a8553a] text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
          >
            {status === "loading" ? "Submitting..." : "Request Early Access"}
          </button>
        </form>
        <p className="text-stone-400 text-sm mt-4">
          No spam. No pressure. Just a seat at the table.
        </p>
      </div>
    </section>
  );
}
