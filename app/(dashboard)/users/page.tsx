"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Trash2, UserCog } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("kasir");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      body: JSON.stringify({
        username,
        email,
        password,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Gagal menambahkan user");
      setLoading(false);
      return;
    }

    setUsername("");
    setEmail("");
    setPassword("");
    setRole("kasir");
    setMessage("User berhasil ditambahkan");
    setLoading(false);
    loadUsers();
  }

  async function hapusUser(id: number) {
    const yakin = confirm("Yakin ingin menghapus user ini?");

    if (!yakin) return;

    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setMessage(data.message || "User dihapus");
    loadUsers();
  }

  async function resetPassword(id: number) {
    const newPassword = prompt("Masukkan password baru:");

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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Manajemen User</h2>
        <p className="text-white/40 text-sm">
          Kelola akun admin dan kasir
        </p>
      </div>

      {message && (
        <div className="bg-white/10 border border-white/10 text-white/80 text-sm rounded-xl px-4 py-3 mb-5">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCog size={20} className="text-[#d4af37]" />
            <h3 className="text-white font-semibold">Tambah User</h3>
          </div>

          <form onSubmit={tambahUser} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: kasir1"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="opsional"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minimal 6 karakter"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#152847] border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {loading ? "Menyimpan..." : "Tambah User"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Daftar User</h3>
            <p className="text-white/40 text-xs">
              Admin dan kasir yang dapat login
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["No", "Username", "Email", "Role", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3"
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
                      className="text-center text-white/30 py-10"
                    >
                      Belum ada user
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-3 text-white/50 text-sm">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-sm">
                        {u.username}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-sm">
                        {u.email || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => resetPassword(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs transition"
                          >
                            <RefreshCcw size={14} />
                            Reset
                          </button>

                          <button
                            onClick={() => hapusUser(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition"
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
    </div>
  );
}