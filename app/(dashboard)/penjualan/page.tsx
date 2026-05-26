"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface Barang { id: number; nama_barang: string; stok: number; harga: number; }
interface DetailPenjualan { barang: Barang; jumlah: number; subtotal: number; }
interface Penjualan {
  id: number;
  tanggal: string;
  total: number;
  detailPenjualans: DetailPenjualan[];
}
interface CartItem { barang: Barang; jumlah: number; }

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PenjualanPage() {
  const [data, setData] = useState<Penjualan[]>([]);
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBarang, setSelectedBarang] = useState("");
  const [jumlah, setJumlah] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [expandId, setExpandId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    const [pjl, brg] = await Promise.all([
      fetch("/api/penjualan").then((r) => r.json()),
      fetch("/api/barang").then((r) => r.json()),
    ]);
    setData(pjl);
    setBarangs(brg);
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter((p) =>
    p.detailPenjualans.some((d) =>
      d.barang.nama_barang.toLowerCase().includes(search.toLowerCase())
    ) || p.tanggal.includes(search)
  );

  function openAdd() {
    setCart([]);
    setSelectedBarang("");
    setJumlah("1");
    setError("");
    setShowModal(true);
  }

  function addToCart() {
    if (!selectedBarang) return;
    const barang = barangs.find((b) => b.id === Number(selectedBarang));
    if (!barang) return;

    const qty = Number(jumlah);
    if (qty <= 0) { setError("Jumlah harus lebih dari 0"); return; }

    // Cek apakah sudah ada di cart
    const existing = cart.find((c) => c.barang.id === barang.id);
    const totalQty = (existing?.jumlah || 0) + qty;

    if (totalQty > barang.stok) {
      setError(`Stok ${barang.nama_barang} tidak cukup (sisa: ${barang.stok})`);
      return;
    }

    if (existing) {
      setCart(cart.map((c) =>
        c.barang.id === barang.id ? { ...c, jumlah: c.jumlah + qty } : c
      ));
    } else {
      setCart([...cart, { barang, jumlah: qty }]);
    }

    setSelectedBarang("");
    setJumlah("1");
    setError("");
  }

  function removeFromCart(id: number) {
    setCart(cart.filter((c) => c.barang.id !== id));
  }

  const totalCart = cart.reduce((sum, c) => sum + c.barang.harga * c.jumlah, 0);

  async function handleSave() {
    if (cart.length === 0) { setError("Keranjang masih kosong"); return; }
    setLoading(true);
    const res = await fetch("/api/penjualan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({
          barang_id: c.barang.id,
          jumlah: c.jumlah,
          subtotal: c.barang.harga * c.jumlah,
        })),
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
    await fetch(`/api/penjualan/${id}`, { method: "DELETE" });
    setConfirmId(null);
    load();
  }

  const totalBulanIni = data
    .filter((p) => p.tanggal.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, p) => sum + p.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Penjualan Barang</h2>
          <p className="text-white/40 text-sm">Transaksi penjualan stok toko</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Transaksi Baru
        </button>
      </div>

      {/* Summary */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
        <span className="text-white/60 text-sm">Total penjualan barang bulan ini</span>
        <span className="text-green-300 font-bold text-lg">{formatRupiah(totalBulanIni)}</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Cari barang atau tanggal..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37] transition mb-4"
      />

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["No", "Tanggal", "Items", "Total", "Aksi"].map((h) => (
                <th key={h} className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-white/30 py-10">
                  Belum ada transaksi penjualan
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <Fragment key={p.id}>
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-white/50 text-sm">{i + 1}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{p.tanggal}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandId(expandId === p.id ? null : p.id)}
                        className="text-blue-300 text-xs hover:underline"
                      >
                        {p.detailPenjualans.length} item — lihat detail
                      </button>
                    </td>
                    <td className="px-4 py-3 text-green-300 font-semibold text-sm">{formatRupiah(p.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/nota/penjualan/${p.id}`}
                          target="_blank"
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-lg transition"
                        >
                          Nota
                        </Link>

                        <button
                          onClick={() => setConfirmId(p.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-lg transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandId === p.id && (
                    <tr key={`detail-${p.id}`} className="bg-white/3 border-b border-white/5">
                      <td colSpan={5} className="px-8 py-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-white/30 text-xs">
                              <th className="text-left pb-1">Barang</th>
                              <th className="text-left pb-1">Harga</th>
                              <th className="text-left pb-1">Qty</th>
                              <th className="text-left pb-1">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.detailPenjualans.map((d, j) => (
                              <tr key={j}>
                                <td className="text-white py-0.5">{d.barang.nama_barang}</td>
                                <td className="text-white/60">{formatRupiah(d.barang.harga)}</td>
                                <td className="text-white/60">{d.jumlah}</td>
                                <td className="text-green-300">{formatRupiah(d.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Transaksi Baru */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a3260] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-white font-semibold text-lg mb-5">Transaksi Penjualan Baru</h3>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {/* Tambah item */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedBarang}
                onChange={(e) => setSelectedBarang(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] transition"
              >
                <option value="" className="bg-[#1a3260]">Pilih barang</option>
                {barangs.filter((b) => b.stok > 0).map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#1a3260]">
                    {b.nama_barang} — stok: {b.stok} — {formatRupiah(b.harga)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] transition"
              />
              <button
                onClick={addToCart}
                className="bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                + Tambah
              </button>
            </div>

            {/* Keranjang */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
              {cart.length === 0 ? (
                <p className="text-center text-white/30 py-6 text-sm">Keranjang kosong</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs">
                      <th className="text-left px-4 py-2">Barang</th>
                      <th className="text-left px-4 py-2">Qty</th>
                      <th className="text-left px-4 py-2">Subtotal</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c) => (
                      <tr key={c.barang.id} className="border-b border-white/5">
                        <td className="px-4 py-2 text-white">{c.barang.nama_barang}</td>
                        <td className="px-4 py-2 text-white/60">{c.jumlah}</td>
                        <td className="px-4 py-2 text-green-300">{formatRupiah(c.barang.harga * c.jumlah)}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeFromCart(c.barang.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Total */}
            {cart.length > 0 && (
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg px-4 py-3 mb-4">
                <p className="text-white/50 text-xs">Total Pembayaran</p>
                <p className="text-[#d4af37] font-bold text-xl">{formatRupiah(totalCart)}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading || cart.length === 0}
                className="flex-1 bg-[#d4af37] hover:bg-[#f0d060] text-[#152847] font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Selesaikan Penjualan"}
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
            <p className="text-white/50 text-sm mb-6">Stok barang akan dikembalikan otomatis.</p>
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