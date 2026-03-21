"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");

    const res = await fetch("/api/admin/signups", {
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      setToken(password);
    } else {
      setError("Incorrect password.");
    }
    setChecking(false);
  }

  async function handleDownload() {
    const res = await fetch("/api/admin/signups", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "turnkey-waitlist.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-8 text-center">
          TurnKey Admin
        </h1>
        {token ? (
          <div className="text-center">
            <p className="text-stone-500 mb-6">You&apos;re in.</p>
            <button
              onClick={handleDownload}
              className="bg-[#1D8A8A] hover:bg-[#166868] text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200"
            >
              Download Waitlist CSV
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="px-5 py-4 rounded-lg border border-[#F0ECE6] bg-white text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1D8A8A]/40 text-base"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={checking}
              className="bg-[#C4674A] hover:bg-[#a8553a] text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {checking ? "Checking..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
