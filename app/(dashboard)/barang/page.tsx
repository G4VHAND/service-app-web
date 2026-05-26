"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Package,
  AlertTriangle,
  Boxes,
} from "lucide-react";

interface Barang {
  id: number;
  nama_barang: string;
  stok: number;
  harga: number;
}

const emptyForm = {
  nama_barang: "",
  stok: "",
  harga: "",
};

function formatRupiah(n?: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

function stokStyle(stok: number) {
  if (stok <= 3) {
    return "bg-red-500/15 text-red-300 border-red-500/20";
  }

  if (stok <= 10) {
    return "bg-amber-500/15 text-amber-300 border-amber-500/20";
  }

  return "bg-green-500/15 text-green-300 border-green-500/20";
}

export default function BarangPage() {
  const [data, setData] = useState<Barang[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/barang");
    const result = await res.json();

    setData(Array.isArray(result) ? result : []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((b) =>
    b.nama_barang.toLowerCase().includes(search.toLowerCase())
  );

  const stokHabis = data.filter((b) => b.stok <= 3).length;

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(b: Barang) {
    setForm({
      nama_barang: b.nama_barang,
      stok: String(b.stok),
      harga: String(b.harga),
    });

    setEditId(b.id);
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nama_barang || form.stok === "" || form.harga === "") {
      setError("Semua field wajib diisi");
      return;
    }

    setLoading(true);

    const res = await fetch(editId ? `/api/barang/${editId}` : "/api/barang", {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Gagal menyimpan data barang");
      return;
    }

    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/barang/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Gagal menghapus barang");
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
            Barang
          </h2>

          <p className="text-white/40 text-sm mt-1">
            Kelola stok dan harga barang toko
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-5 py-3 rounded-2xl transition text-sm shadow-xl"
        >
          <Plus size={18} />
          Tambah Barang
        </button>
      </div>

      {/* Warning stok */}
      {stokHabis > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/25 text-amber-300 text-sm rounded-3xl px-5 py-4 flex items-center gap-3 shadow-xl">
          <AlertTriangle size={20} className="shrink-0" />
          <span>
            {stokHabis} barang memiliki stok ≤ 3. Segera lakukan restok.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <Boxes size={18} className="text-[#d4af37]" />

          <h3 className="text-white font-semibold">Daftar Barang</h3>

          <span className="text-white/35 text-sm">({filtered.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {["No", "Nama Barang", "Stok", "Harga", "Aksi"].map((h) => (
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
                  <td colSpan={5} className="text-center text-white/30 py-14">
                    Belum ada data barang
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 hover:bg-white/4 transition"
                  >
                    <td className="px-4 py-4 text-white/45 text-sm">
                      {i + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2">
                        <Package size={15} className="text-white/30" />

                        <p className="text-white font-medium text-sm">
                          {b.nama_barang}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex border text-xs px-3 py-1.5 rounded-full font-medium ${stokStyle(
                          b.stok
                        )}`}
                      >
                        {b.stok} stok
                      </span>
                    </td>

                    <td className="px-4 py-4 text-green-300 font-semibold text-sm">
                      {formatRupiah(b.harga)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="inline-flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs px-3 py-2 rounded-xl transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmId(b.id)}
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
                <h3 className="text-white font-semibold text-lg">
                  {editId ? "Edit Barang" : "Tambah Barang"}
                </h3>

                <p className="text-white/35 text-sm">
                  Lengkapi data stok barang
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
                  Nama Barang
                </label>

                <input
                  type="text"
                  value={form.nama_barang}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nama_barang: e.target.value,
                    })
                  }
                  placeholder="Contoh: RAM DDR4 8GB"
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Stok
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.stok}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stok: e.target.value,
                    })
                  }
                  placeholder="Jumlah stok"
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  Harga
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.harga}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      harga: e.target.value,
                    })
                  }
                  placeholder="Harga satuan"
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 font-medium py-2.5 rounded-2xl transition"
              >
                Batal
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-2xl transition disabled:opacity-60"
              >
                <Save size={18} />
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#14284a] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              Hapus Barang?
            </h3>

            <p className="text-white/45 text-sm mb-6">
              Data barang yang dihapus tidak dapat dikembalikan.
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