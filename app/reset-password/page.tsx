"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== konfirmasi) {
      setMessage("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          Reset Password
        </h1>

        <p className="text-white/40 text-sm mb-6">
          Masukkan password baru Anda
        </p>

        {!token ? (
          <div>
            <p className="text-red-300 text-sm">
              Token reset password tidak ditemukan.
            </p>

            <Link href="/login" className="block text-[#d4af37] text-sm mt-5">
              Kembali ke login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                required
              />

              <input
                type="password"
                placeholder="Konfirmasi password baru"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-[#152847] font-semibold rounded-lg py-3 disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Reset Password"}
              </button>
            </form>

            {message && <p className="text-white/70 text-sm mt-4">{message}</p>}

            <Link href="/login" className="block text-[#d4af37] text-sm mt-5">
              Kembali ke login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}