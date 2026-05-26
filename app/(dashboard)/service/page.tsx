"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Wrench,
} from "lucide-react";

interface Customer {
  id: number;
  nama: string;
}

interface Service {
  id: number;
  customer_id: number;
  customer: Customer;
  tanggal_masuk: string;
  jenis_barang: string;
  keluhan: string;
  status: string;
}

const emptyForm = {
  customer_id: "",
  tanggal_masuk: "",
  jenis_barang: "",
  keluhan: "",
  status: "Menunggu",
};

const statusColor: Record<string, string> = {
  Menunggu: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Proses: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Selesai: "bg-green-500/15 text-green-300 border-green-500/20",
};

export default function ServicePage() {
  const [data, setData] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function load() {
    const [svc, cust] = await Promise.all([
      fetch("/api/service").then((r) => r.json()),
      fetch("/api/customer").then((r) => r.json()),
    ]);

    setData(Array.isArray(svc) ? svc : []);
    setCustomers(Array.isArray(cust) ? cust : []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((s) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      s.customer?.nama?.toLowerCase().includes(keyword) ||
      s.jenis_barang?.toLowerCase().includes(keyword) ||
      s.keluhan?.toLowerCase().includes(keyword);

    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;

    return matchSearch && matchStatus;
  });

  function openAdd() {
    setForm({
      ...emptyForm,
      tanggal_masuk: new Date().toISOString().split("T")[0],
    });
    setEditId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(s: Service) {
    setForm({
      customer_id: String(s.customer_id),
      tanggal_masuk: s.tanggal_masuk,
      jenis_barang: s.jenis_barang,
      keluhan: s.keluhan,
      status: s.status,
    });

    setEditId(s.id);
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (
      !form.customer_id ||
      !form.tanggal_masuk ||
      !form.jenis_barang ||
      !form.keluhan
    ) {
      setError("Semua field wajib diisi");
      return;
    }

    setLoading(true);

    const res = await fetch(editId ? `/api/service/${editId}` : "/api/service", {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Gagal menyimpan data");
      return;
    }

    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/service/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Gagal menghapus data");
    }

    setConfirmId(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Service
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Kelola data service masuk dan status pengerjaan
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-5 py-3 rounded-2xl transition text-sm shadow-xl"
        >
          <Plus size={18} />
          Tambah Service
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="text"
              placeholder="Cari customer, barang, atau keluhan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["Semua", "Menunggu", "Proses", "Selesai"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                  filterStatus === s
                    ? "bg-[#d4af37] text-[#152847]"
                    : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <Wrench size={18} className="text-[#d4af37]" />
          <h3 className="text-white font-semibold">Daftar Service</h3>
          <span className="text-white/35 text-sm">({filtered.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {[
                  "No",
                  "Customer",
                  "Tgl Masuk",
                  "Barang",
                  "Keluhan",
                  "Status",
                  "Aksi",
                ].map((h) => (
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
                  <td colSpan={7} className="text-center text-white/30 py-14">
                    Belum ada data service
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 hover:bg-white/4 transition"
                  >
                    <td className="px-4 py-4 text-white/45 text-sm">
                      {i + 1}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-white font-medium text-sm">
                        {s.customer?.nama || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-white/65 text-sm">
                      {s.tanggal_masuk}
                    </td>

                    <td className="px-4 py-4 text-white/70 text-sm">
                      {s.jenis_barang}
                    </td>

                    <td className="px-4 py-4 text-white/60 text-sm max-w-xs truncate">
                      {s.keluhan}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex border text-xs px-3 py-1.5 rounded-full font-medium ${
                          statusColor[s.status] ||
                          "bg-white/10 text-white/60 border-white/10"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="inline-flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs px-3 py-2 rounded-xl transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmId(s.id)}
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

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#14284a] border border-white/10 rounded-3xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-xl">
                  {editId ? "Edit Service" : "Tambah Service"}
                </h3>
                <p className="text-white/35 text-sm">
                  Lengkapi data service pelanggan
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white/60 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-2xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Customer
                </label>
                <select
                  value={form.customer_id}
                  onChange={(e) =>
                    setForm({ ...form, customer_id: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/60 transition"
                >
                  <option value="" className="bg-[#14284a]">
                    Pilih customer
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#14284a]">
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_masuk: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/60 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Jenis Barang
                </label>
                <input
                  type="text"
                  value={form.jenis_barang}
                  onChange={(e) =>
                    setForm({ ...form, jenis_barang: e.target.value })
                  }
                  placeholder="Contoh: Laptop Asus, HP Samsung"
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Keluhan
                </label>
                <textarea
                  value={form.keluhan}
                  onChange={(e) =>
                    setForm({ ...form, keluhan: e.target.value })
                  }
                  placeholder="Contoh: mati total, layar rusak, tidak bisa charge"
                  rows={2}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition resize-none"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/60 transition"
                >
                  <option value="Menunggu" className="bg-[#14284a]">
                    Menunggu
                  </option>
                  <option value="Proses" className="bg-[#14284a]">
                    Proses
                  </option>
                  <option value="Selesai" className="bg-[#14284a]">
                    Selesai
                  </option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 font-medium py-3 rounded-2xl transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-3 rounded-2xl transition disabled:opacity-60"
                >
                  <Save size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#14284a] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              Hapus Service?
            </h3>

            <p className="text-white/45 text-sm mb-6">
              Data service ini akan dihapus permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 font-medium py-3 rounded-2xl transition"
              >
                Batal
              </button>

              <button
                onClick={() => handleDelete(confirmId)}
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