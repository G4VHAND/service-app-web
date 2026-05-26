import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const transaksi = await prisma.transaksiPenjualan.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      user: true,
      detailPenjualans: {
        include: {
          barang: true,
        },
      },
    },
  });

  if (!transaksi) {
    return NextResponse.json(
      { message: "Transaksi tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(transaksi);
}