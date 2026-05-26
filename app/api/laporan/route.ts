import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get("bulan") || new Date().toISOString().slice(0, 7);

  const [transaksiService, transaksiPenjualan] = await Promise.all([
    prisma.transaksi.findMany({
      where: { tanggal: { startsWith: bulan } },
      include: { service: { include: { customer: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.transaksiPenjualan.findMany({
      where: { tanggal: { startsWith: bulan } },
      include: { detailPenjualans: { include: { barang: true } } },
      orderBy: { id: "desc" },
    }),
  ]);

  const totalService = transaksiService.reduce((sum, t) => sum + t.total, 0);
  const totalPenjualan = transaksiPenjualan.reduce((sum, t) => sum + t.total, 0);

  return NextResponse.json({
    bulan,
    totalService,
    totalPenjualan,
    grandTotal: totalService + totalPenjualan,
    transaksiService,
    transaksiPenjualan,
  });
}