"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer { id: number; nama: string; }
interface Service {
  id: number;
  customer: Customer;
  jenis_barang: string;
  keluhan: string;
  status: string;
}
interface Transaksi {
  id: number;
  service_id: number;
  service: Service;
  biaya_service: number;
  total: number;
  tanggal: string;
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function TransaksiPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ service_id: "", biaya_service: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    const [trx, svc] = await Promise.all([
      fetch("/api/transaksi").then((r) => r.json()),
      fetch("/api/service").then((r) => r.json()),
    ]);
    setData(trx);
    // Hanya service yang sudah Selesai atau Proses yang bisa dibuat transaksi
    setServices(svc.filter((s: Service) => s.status !== "Selesai"));
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter((t) =>
    t.service.customer.nama.toLowerCase().includes(search.toLowerCase()) ||
    t.service.jenis_barang.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm({ service_id: "", biaya_service: "" });
    setError("");
    setShowModal(true);
  }

  const selectedService = services.find((s) => s.id === Number(form.service_id));

  async function handleSave() {
    if (!form.service_id || !form.biaya_service) {
      setError("Semua field wajib diisi");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: form.service_id,
        biaya_service: Number(form.biaya_service),
        total: Number(form.biaya_service),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/transaksi/${id}`, { method: "DELETE" });
    setConfirmId(null);
    load();
  }

  const totalBulanIni = data
    .filter((t) => t.tanggal.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaksi Service</h2>
          <p className="text-white/40 text-sm">Pembayaran biaya service</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Buat Transaksi
        </button>
      </div>

      {/* Summary */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
        <span className="text-white/60 text-sm">Total pemasukan service bulan ini</span>
        <span className="text-green-300 font-bold text-lg">{formatRupiah(totalBulanIni)}</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Cari customer atau barang..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition mb-4"
      />

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["No", "Tanggal", "Customer", "Barang", "Keluhan", "Biaya Service", "Aksi"].map((h) => (
                <th key={h} className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-white/30 py-10">
                  Belum ada transaksi service
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-white/50 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-white/70 text-sm">{t.tanggal}</td>
                  <td className="px-4 py-3 text-white font-medium">{t.service.customer.nama}</td>
                  <td className="px-4 py-3 text-white/70 text-sm">{t.service.jenis_barang}</td>
                  <td className="px-4 py-3 text-white/70 text-sm max-w-xs truncate">{t.service.keluhan}</td>
                  <td className="px-4 py-3 text-green-300 font-semibold text-sm">{formatRupiah(t.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/nota/service/${t.id}`}
                        target="_blank"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Nota
                      </Link>

                      <button
                        onClick={() => setConfirmId(t.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-lg transition"
                      >
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

      {/* Modal Buat Transaksi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a3260] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-5">Buat Transaksi Service</h3>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Pilih Service</label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37] transition"
                >
                  <option value="" className="bg-[#1a3260]">Pilih service aktif</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1a3260]">
                      {s.customer.nama} — {s.jenis_barang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detail service terpilih */}
              {selectedService && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm space-y-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Detail Service</p>
                  <p className="text-white/70">Customer: <span className="text-white">{selectedService.customer.nama}</span></p>
                  <p className="text-white/70">Barang: <span className="text-white">{selectedService.jenis_barang}</span></p>
                  <p className="text-white/70">Keluhan: <span className="text-white">{selectedService.keluhan}</span></p>
                  <p className="text-white/70">Status: <span className="text-amber-300">{selectedService.status}</span></p>
                </div>
              )}

              <div>
                <label className="text-white/70 text-sm mb-1 block">Biaya Service (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={form.biaya_service}
                  onChange={(e) => setForm({ ...form, biaya_service: e.target.value })}
                  placeholder="Masukkan biaya service"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition"
                />
              </div>

              {form.biaya_service && (
                <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg px-4 py-3">
                  <p className="text-white/50 text-xs">Total Pembayaran</p>
                  <p className="text-[#d4af37] font-bold text-xl">{formatRupiah(Number(form.biaya_service))}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Selesaikan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a3260] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Hapus Transaksi?</h3>
            <p className="text-white/50 text-sm mb-6">Data transaksi yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition text-sm"
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