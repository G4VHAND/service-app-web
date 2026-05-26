import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { barangSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

const parsed = barangSchema.safeParse(body);

if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0]?.message || "Input tidak valid" },
    { status: 400 }
  );
}

const { nama_barang, stok, harga } = parsed.data;
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