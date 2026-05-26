"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cek apakah perlu setup admin dulu
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.firstSetup) router.push("/setup-admin");
      });
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Username atau password salah");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#152847]">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Service App</h1>
          <p className="text-white/50 text-sm mt-1">Toko & Service Elektronik</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-8">
          <h3 className="text-white font-semibold mb-6">Masuk ke akun Anda</h3>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Masukkan username"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Masukkan password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
            <Link href="/forgot-password" className="text-[#d4af37] text-sm">Lupa password?</Link>
          </div> 
        </div>
      </div>
    </div>
  );
}