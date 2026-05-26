"use client";

import { Fragment ,useEffect, useState } from "react";
import {
  Wrench,
  ShoppingCart,
  Wallet,
} from "lucide-react";

interface Riwayat {
  id: string;
  jenis: "service" | "penjualan";
  tanggal: string;
  nama: string;
  keterangan: string;
  detail: string;
  total: number;
  dibuatOleh: string;
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function RiwayatPage() {
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [data, setData] = useState<Riwayat[]>([]);
  const [bulan, setBulan] = useState(defaultBulan);
  const [filterJenis, setFilterJenis] = useState<"Semua" | "service" | "penjualan">("Semua");
  const [search, setSearch] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(b: string) {
    setLoading(true);
    const res = await fetch(`/api/riwayat?bulan=${b}`);
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(bulan); }, [bulan]);

  const filtered = data.filter((r) => {
    const matchJenis = filterJenis === "Semua" || r.jenis === filterJenis;
    const matchSearch =
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.keterangan.toLowerCase().includes(search.toLowerCase()) ||
      r.detail.toLowerCase().includes(search.toLowerCase());
    return matchJenis && matchSearch;
  });

  const totalService = filtered
    .filter((r) => r.jenis === "service")
    .reduce((sum, r) => sum + r.total, 0);

  const totalPenjualan = filtered
    .filter((r) => r.jenis === "penjualan")
    .reduce((sum, r) => sum + r.total, 0);

  const grandTotal = totalService + totalPenjualan;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Riwayat Transaksi</h2>
          <p className="text-white/40 text-sm">Semua transaksi service dan penjualan</p>
        </div>
        <input
          type="month"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37] transition"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-500/20 to-blue-600/10 border border-white/10 rounded-2xl p-5">
          <div className="mb-3 text-blue-300"><Wrench size={28} /></div>
          <p className="text-white/50 text-xs mb-1">Pemasukan Service</p>
          <p className="text-white font-bold text-lg">{formatRupiah(totalService)}</p>
          <p className="text-white/30 text-xs mt-1">
            {filtered.filter((r) => r.jenis === "service").length} transaksi
          </p>
        </div>
        <div className="bg-linear-to-br from-purple-500/20 to-purple-600/10 border border-white/10 rounded-2xl p-5">
          <div className="mb-3 text-purple-300"><ShoppingCart size={28} /></div>
          <p className="text-white/50 text-xs mb-1">Pemasukan Penjualan</p>
          <p className="text-white font-bold text-lg">{formatRupiah(totalPenjualan)}</p>
          <p className="text-white/30 text-xs mt-1">
            {filtered.filter((r) => r.jenis === "penjualan").length} transaksi
          </p>
        </div>
        <div className="bg-linear-to-br from-green-500/20 to-green-600/10 border border-white/10 rounded-2xl p-5">
          <div className="mb-3 text-green-300"><Wallet size={28} /></div>
          <p className="text-white/50 text-xs mb-1">Total Pemasukan</p>
          <p className="text-white font-bold text-lg">{formatRupiah(grandTotal)}</p>
          <p className="text-white/30 text-xs mt-1">{filtered.length} transaksi</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Cari nama, barang, keluhan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition"
        />
        {(["Semua", "service", "penjualan"] as const).map((j) => (
          <button
            key={j}
            onClick={() => setFilterJenis(j)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              filterJenis === j
                ? "bg-[#d4af37] text-[#152847]"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
           <div className="flex items-center gap-2">
            {j === "service" ? (
                <>
                <Wrench size={16} />
                <span>Service</span>
                </>
            ) : j === "penjualan" ? (
            <>
            <ShoppingCart size={16} />
            <span>Penjualan</span>
            </>
            ) : (
            <span>Semua</span>
            )}
            </div>
            </button>
        ))}
        </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["No", "Tanggal", "Jenis", "Nama / Barang", "Keterangan", "Dibuat Oleh", "Total", ""].map((h) => (
                <th key={h} className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-white/30 py-10">
                  Memuat data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-white/30 py-10">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
              <Fragment key={r.id}>
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => setExpandId(expandId === r.id ? null : r.id)}
                  >
                    <td className="px-4 py-3 text-white/50 text-sm">{i + 1}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{r.tanggal}</td>
                    <td className="px-4 py-3">
  <span
    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
      r.jenis === "service"
        ? "bg-blue-500/20 text-blue-300"
        : "bg-purple-500/20 text-purple-300"
    }`}
  >
    {r.jenis === "service" ? (
      <>
        <Wrench size={14} className="shrink-0" />
        <span>Service</span>
      </>
    ) : (
      <>
        <ShoppingCart size={14} className="shrink-0" />
        <span>Penjualan</span>
      </>
    )}
  </span>
</td>
                    <td className="px-4 py-3 text-white font-medium text-sm">{r.nama}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{r.keterangan}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{r.dibuatOleh}</td>
                    <td className="px-4 py-3 text-green-300 font-semibold text-sm">
                      {formatRupiah(r.total)}
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {expandId === r.id ? "▲" : "▼"}
                    </td>
                  </tr>

                  {/* Expand detail */}
                  {expandId === r.id && (
                    <tr key={`detail-${r.id}`} className="border-b border-white/5 bg-white/3">
                      <td colSpan={8} className="px-8 py-3">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Detail</p>
                        <p className="text-white/70 text-sm">{r.detail}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>

          {/* Footer total */}
          {filtered.length > 0 && !loading && (
            <tfoot>
              <tr className="border-t border-white/10 bg-white/5">
                <td colSpan={6} className="px-4 py-3 text-white/50 text-sm font-semibold">
                  Grand Total ({filtered.length} transaksi)
                </td>
                <td className="px-4 py-3 text-green-300 font-bold">
                  {formatRupiah(grandTotal)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}