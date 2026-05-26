import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { customer_id, tanggal_masuk, jenis_barang, keluhan, status } = await req.json();

  const data = await prisma.service.update({
    where: { id: Number(id) },
    data: { customer_id: Number(customer_id), tanggal_masuk, jenis_barang, keluhan, status },
  });
  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.service.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal hapus data service" }, { status: 400 });
  }
}