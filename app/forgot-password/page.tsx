"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-1">Lupa Password</h1>
        <p className="text-white/40 text-sm mb-6">
          Masukkan email admin yang terdaftar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#152847] font-semibold rounded-lg py-3 disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        {message && (
          <p className="text-white/70 text-sm mt-4">{message}</p>
        )}

        <Link href="/login" className="block text-[#d4af37] text-sm mt-5">
          Kembali ke login
        </Link>
      </div>
    </div>
  );
}