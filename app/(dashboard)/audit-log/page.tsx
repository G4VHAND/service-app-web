"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, User, Clock } from "lucide-react";

interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  detail: string | null;
  createdAt: string;
  user?: {
    username: string;
    role: string;
  } | null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function actionLabel(action: string) {
  return action.replaceAll("_", " ");
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");

  async function loadLogs() {
    const res = await fetch("/api/audit-log");
    const data = await res.json();

    if (Array.isArray(data)) {
      setLogs(data);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const keyword = search.toLowerCase();

    return (
      log.action.toLowerCase().includes(keyword) ||
      log.detail?.toLowerCase().includes(keyword) ||
      log.user?.username?.toLowerCase().includes(keyword) ||
      log.user?.role?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Aktivitas Sistem
        </h2>

        <p className="text-white/40 text-sm mt-1">
          Pantau aktivitas penting admin dan kasir di aplikasi
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            type="text"
            placeholder="Cari user, aksi, atau detail aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#d4af37]" />

          <h3 className="text-white font-semibold">Log Aktivitas</h3>

          <span className="text-white/35 text-sm">
            ({filtered.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {["No", "User", "Role", "Aksi", "Detail", "Waktu"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-white/30 py-14">
                    Belum ada aktivitas
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/4 transition"
                  >
                    <td className="px-4 py-4 text-white/45 text-sm">
                      {i + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2">
                        <User size={15} className="text-white/30" />
                        <span className="text-white font-medium text-sm">
                          {log.user?.username || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex border px-3 py-1.5 rounded-full text-xs font-medium ${
                          log.user?.role === "admin"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
                            : "bg-green-500/15 text-green-300 border-green-500/20"
                        }`}
                      >
                        {log.user?.role || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex border px-3 py-1.5 rounded-full text-xs font-medium bg-[#d4af37]/15 text-[#f0d060] border-[#d4af37]/20">
                        {actionLabel(log.action)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-white/60 text-sm max-w-md truncate">
                      {log.detail || "-"}
                    </td>

                    <td className="px-4 py-4 text-white/60 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <Clock size={14} className="text-white/30" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}