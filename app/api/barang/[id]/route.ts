import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { nama_barang, stok, harga } = await req.json();

  const data = await prisma.barang.update({
    where: { id: Number(id) },
    data: { nama_barang, stok: Number(stok), harga: Number(harga) },
  });
  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.barang.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal hapus — barang masih digunakan di transaksi" },
      { status: 400 }
    );
  }
}