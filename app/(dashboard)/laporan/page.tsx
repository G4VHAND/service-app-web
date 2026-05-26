"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Wallet, Wrench } from "lucide-react";

interface Transaksi {
  id: number;
  tanggal: string;
  total: number;
  biaya_service: number;
  service: {
    customer: { nama: string };
    jenis_barang: string;
  };
}

interface Penjualan {
  id: number;
  tanggal: string;
  total: number;
  detailPenjualans: {
    barang: { nama_barang: string };
    jumlah: number;
    subtotal: number;
  }[];
}

interface Laporan {
  bulan: string;
  totalService: number;
  totalPenjualan: number;
  grandTotal: number;
  transaksiService: Transaksi[];
  transaksiPenjualan: Penjualan[];
}

function formatRupiah(n: number) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export default function LaporanPage() {
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const [bulan, setBulan] = useState(defaultBulan);
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [tab, setTab] = useState<"service" | "penjualan">("service");

  async function load(b: string) {
    const res = await fetch(`/api/laporan?bulan=${b}`);
    const data = await res.json();
    setLaporan(data);
  }

  useEffect(() => {
    load(bulan);
  }, [bulan]);

  const cards = laporan
    ? [
        {
          label: "Pemasukan Service",
          value: laporan.totalService,
          color: "from-blue-500/20 to-blue-600/10",
          icon: <Wrench size={26} />,
          iconColor: "text-blue-300",
        },
        {
          label: "Pemasukan Penjualan",
          value: laporan.totalPenjualan,
          color: "from-purple-500/20 to-purple-600/10",
          icon: <ShoppingCart size={26} />,
          iconColor: "text-purple-300",
        },
        {
          label: "Total Pemasukan",
          value: laporan.grandTotal,
          color: "from-green-500/20 to-green-600/10",
          icon: <Wallet size={26} />,
          iconColor: "text-green-300",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Pemasukan</h2>
          <p className="text-white/40 text-sm">Rekap pemasukan per bulan</p>
        </div>

        <input
          type="month"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37] transition"
        />
      </div>

      {laporan && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {cards.map((c) => (
              <div
                key={c.label}
                className={`bg-linear-to-br ${c.color} border border-white/10 rounded-2xl p-5`}
              >
                <div className={`mb-3 ${c.iconColor}`}>{c.icon}</div>
                <p className="text-white/50 text-xs mb-1">{c.label}</p>
                <p className="text-white font-bold text-lg">
                  {formatRupiah(c.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {(["service", "penjualan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  tab === t
                    ? "bg-[#d4af37] text-[#152847]"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t === "service" ? (
                    <>
                      <Wrench size={16} />
                      <span>Transaksi Service</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span>Transaksi Penjualan</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {tab === "service" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["No", "Tanggal", "Customer", "Barang", "Total"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {laporan.transaksiService.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-white/30 py-10"
                      >
                        Tidak ada data service bulan ini
                      </td>
                    </tr>
                  ) : (
                    laporan.transaksiService.map((t, i) => (
                      <tr
                        key={t.id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-white/50 text-sm">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {t.tanggal}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {t.service.customer.nama}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {t.service.jenis_barang}
                        </td>
                        <td className="px-4 py-3 text-green-300 font-semibold text-sm">
                          {formatRupiah(t.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {laporan.transaksiService.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/5">
                      <td
                        colSpan={4}
                        className="px-4 py-3 text-white/50 text-sm font-semibold"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-green-300 font-bold">
                        {formatRupiah(laporan.totalService)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {tab === "penjualan" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["No", "Tanggal", "Items", "Total"].map((h) => (
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
                  {laporan.transaksiPenjualan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-white/30 py-10"
                      >
                        Tidak ada data penjualan bulan ini
                      </td>
                    </tr>
                  ) : (
                    laporan.transaksiPenjualan.map((p, i) => (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-white/50 text-sm">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {p.tanggal}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {p.detailPenjualans
                            .map(
                              (d) => `${d.barang.nama_barang} x${d.jumlah}`
                            )
                            .join(", ")}
                        </td>
                        <td className="px-4 py-3 text-green-300 font-semibold text-sm">
                          {formatRupiah(p.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {laporan.transaksiPenjualan.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/5">
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-white/50 text-sm font-semibold"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-green-300 font-bold">
                        {formatRupiah(laporan.totalPenjualan)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}