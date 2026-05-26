import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.barang.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { nama_barang, stok, harga } = await req.json();
  if (!nama_barang || stok === undefined || harga === undefined)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const data = await prisma.barang.create({
    data: { nama_barang, stok: Number(stok), harga: Number(harga) },
  });
  return NextResponse.json(data);
}