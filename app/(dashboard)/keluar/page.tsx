"use client";

import { useEffect, useState } from "react";

interface Service {
  id: number;
  jenis_barang: string;
  keluhan: string;
  customer: { id: number; nama: string; };
}
interface BarangKeluar {
  id: number;
  tanggal_keluar: string;
  service: Service;
  customer: { nama: string; };
}

export default function KeluarPage() {
  const [data, setData] = useState<BarangKeluar[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const [keluar, svc] = await Promise.all([
      fetch("/api/keluar").then((r) => r.json()),
      fetch("/api/service").then((r) => r.json()),
    ]);
    setData(keluar);
    // Hanya service Selesai yang belum dicatat keluar
    const keluarIds = new Set(keluar.map((k: BarangKeluar) => k.service.id));
    setServices(svc.filter((s: Service & { status: string }) =>
      s.status === "Selesai" && !keluarIds.has(s.id)
    ));
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter((k) =>
    k.customer.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.service.jenis_barang.toLowerCase().includes(search.toLowerCase())
  );

  const svcSelected = services.find((s) => s.id === Number(selectedService));

  async function handleSave() {
    if (!selectedService) { setError("Pilih service terlebih dahulu"); return; }
    setLoading(true);
    const res = await fetch("/api/keluar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: Number(selectedService),
        customer_id: svcSelected?.customer.id,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Barang Keluar</h2>
          <p className="text-white/40 text-sm">Pencatatan pengambilan barang service</p>
        </div>
        <button
          onClick={() => { setSelectedService(""); setError(""); setShowModal(true); }}
          className="bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Catat Barang Keluar
        </button>
      </div>

      {/* Info */}
      {services.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-xl px-4 py-3 mb-4">
          📦 {services.length} barang service selesai menunggu pengambilan
        </div>
      )}

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
              {["No", "Tgl Keluar", "Customer", "Barang", "Keluhan"].map((h) => (
                <th key={h} className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-white/30 py-10">
                  Belum ada barang keluar
                </td>
              </tr>
            ) : (
              filtered.map((k, i) => (
                <tr key={k.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-white/50 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-white/70 text-sm">{k.tanggal_keluar}</td>
                  <td className="px-4 py-3 text-white font-medium">{k.customer.nama}</td>
                  <td className="px-4 py-3 text-white/70 text-sm">{k.service.jenis_barang}</td>
                  <td className="px-4 py-3 text-white/70 text-sm max-w-xs truncate">{k.service.keluhan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a3260] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-5">Catat Barang Keluar</h3>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Pilih Service Selesai</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37] transition"
                >
                  <option value="" className="bg-[#1a3260]">Pilih service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1a3260]">
                      {s.customer.nama} — {s.jenis_barang}
                    </option>
                  ))}
                </select>
              </div>

              {svcSelected && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm space-y-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Detail</p>
                  <p className="text-white/70">Customer: <span className="text-white">{svcSelected.customer.nama}</span></p>
                  <p className="text-white/70">Barang: <span className="text-white">{svcSelected.jenis_barang}</span></p>
                  <p className="text-white/70">Keluhan: <span className="text-white">{svcSelected.keluhan}</span></p>
                  <p className="text-white/70">Tanggal Keluar: <span className="text-[#d4af37]">{new Date().toISOString().split("T")[0]}</span></p>
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
                {loading ? "Menyimpan..." : "Catat Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}