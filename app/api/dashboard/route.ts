import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [totalCustomer, serviceAktif, transaksiService, transaksiPenjualan, stokHabis] =
    await Promise.all([
      prisma.customer.count(),
      prisma.service.count({ where: { status: { in: ["Menunggu", "Proses"] } } }),
      prisma.transaksi.findMany({ where: { tanggal: { startsWith: bulanIni } } }),
      prisma.transaksiPenjualan.findMany({ where: { tanggal: { startsWith: bulanIni } } }),
      prisma.barang.count({ where: { stok: { lte: 3 } } }),
    ]);

  const totalPemasukan =
    transaksiService.reduce((sum, t) => sum + t.total, 0) +
    transaksiPenjualan.reduce((sum, t) => sum + t.total, 0);

  return NextResponse.json({ totalCustomer, serviceAktif, totalPemasukan, stokHabis });
}