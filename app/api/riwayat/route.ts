import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get("bulan") || "";

  const [transaksiService, transaksiPenjualan] = await Promise.all([
    prisma.transaksi.findMany({
      where: bulan ? { tanggal: { startsWith: bulan } } : undefined,
      include: {
        user: true,
        service: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    }),

    prisma.transaksiPenjualan.findMany({
      where: bulan ? { tanggal: { startsWith: bulan } } : undefined,
      include: {
        user: true,
        detailPenjualans: {
          include: {
            barang: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    }),
  ]);

  const service = transaksiService.map((t: any) => ({
  id: `s-${t.id}`,
  jenis: "service" as const,
  tanggal: t.tanggal,
  nama: t.service.customer.nama,
  keterangan: t.service.jenis_barang,
  detail: t.service.keluhan,
  total: t.total,
  dibuatOleh: t.user?.username || "-",
}));

const penjualan = transaksiPenjualan.map((p: any) => ({
  id: `p-${p.id}`,
  jenis: "penjualan" as const,
  tanggal: p.tanggal,
  nama: p.detailPenjualans.map((d: any) => d.barang.nama_barang).join(", "),
  keterangan: `${p.detailPenjualans.length} item`,
  detail: p.detailPenjualans
    .map((d: any) => `${d.barang.nama_barang} x${d.jumlah}`)
    .join(", "),
  total: p.total,
  dibuatOleh: p.user?.username || "-",
}));

  const semua = [...service, ...penjualan].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return NextResponse.json(semua);
}