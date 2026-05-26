"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCcw,
  Trash2,
  UserCog,
  Shield,
  User,
  Mail,
  Save,
} from "lucide-react";

interface AppUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "kasir",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();

    if (Array.isArray(data)) {
      setUsers(data);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function tambahUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || "Gagal menambahkan user");
      return;
    }

    setForm(emptyForm);
    setMessage("User berhasil ditambahkan");
    loadUsers();
  }

  async function hapusUser(id: number) {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setMessage(data.message || "User dihapus");
    setConfirmId(null);
    loadUsers();
  }

  async function resetPassword(id: number) {
    const newPassword = prompt("Masukkan password baru minimal 6 karakter:");

    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    const data = await res.json();
    setMessage(data.message || "Password berhasil direset");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Manajemen User
        </h2>

        <p className="text-white/40 text-sm mt-1">
          Kelola akun admin dan kasir yang dapat mengakses sistem
        </p>
      </div>

      {message && (
        <div className="bg-white/10 border border-white/10 text-white/80 text-sm rounded-2xl px-5 py-4 shadow-xl">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Form tambah user */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-5">
            <UserCog size={20} className="text-[#d4af37]" />

            <div>
              <h3 className="text-white font-semibold">Tambah User</h3>
              <p className="text-white/35 text-xs">
                Buat akun baru untuk admin atau kasir
              </p>
            </div>
          </div>

          <form onSubmit={tambahUser} className="space-y-3">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Username
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                placeholder="contoh: kasir1"
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="opsional"
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Password
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="minimal 6 karakter"
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Role
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                className="w-full bg-[#14284a] border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/60 transition"
              >
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-2xl transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              <Plus size={18} />
              {loading ? "Menyimpan..." : "Tambah User"}
            </button>
          </form>
        </div>

        {/* Daftar user */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Shield size={18} className="text-[#d4af37]" />

            <div>
              <h3 className="text-white font-semibold">Daftar User</h3>
              <p className="text-white/35 text-xs">
                Admin dan kasir yang dapat login
              </p>
            </div>

            <span className="ml-auto text-white/35 text-sm">
              {users.length} user
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-187.5">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  {["No", "Username", "Email", "Role", "Aksi"].map((h) => (
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
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-white/30 py-14"
                    >
                      Belum ada user
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-b border-white/5 hover:bg-white/4 transition"
                    >
                      <td className="px-4 py-4 text-white/45 text-sm">
                        {i + 1}
                      </td>

                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2">
                          <User size={15} className="text-white/30" />
                          <p className="text-white font-medium text-sm">
                            {u.username}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-white/60 text-sm">
                        <div className="inline-flex items-center gap-2">
                          <Mail size={14} className="text-white/30" />
                          {u.email || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex border px-3 py-1.5 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
                              : "bg-green-500/15 text-green-300 border-green-500/20"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resetPassword(u.id)}
                            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/70 text-xs px-3 py-2 rounded-xl transition"
                          >
                            <RefreshCcw size={14} />
                            Reset
                          </button>

                          <button
                            onClick={() => setConfirmId(u.id)}
                            className="inline-flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs px-3 py-2 rounded-xl transition"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
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

      {/* Modal Konfirmasi Hapus */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#14284a] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              Hapus User?
            </h3>

            <p className="text-white/45 text-sm mb-6">
              User ini tidak akan bisa login lagi setelah dihapus.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 font-medium py-3 rounded-2xl transition"
              >
                Batal
              </button>

              <button
                onClick={() => hapusUser(confirmId)}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold py-3 rounded-2xl transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}