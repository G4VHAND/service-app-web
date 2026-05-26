import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Kembalikan stok sebelum hapus
    const trx = await prisma.transaksiPenjualan.findUnique({
      where: { id: Number(id) },
      include: { detailPenjualans: true },
    });

    if (trx) {
      await prisma.$transaction(async (tx) => {
        for (const d of trx.detailPenjualans) {
          await tx.barang.update({
            where: { id: d.barang_id },
            data: { stok: { increment: d.jumlah } },
          });
        }
        await tx.transaksiPenjualan.delete({ where: { id: Number(id) } });
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal hapus transaksi" }, { status: 400 });
  }
}