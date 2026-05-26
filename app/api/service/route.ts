import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.service.findMany({
    include: { customer: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { customer_id, tanggal_masuk, jenis_barang, keluhan } = await req.json();
  if (!customer_id || !tanggal_masuk || !jenis_barang || !keluhan)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const data = await prisma.service.create({
    data: { customer_id: Number(customer_id), tanggal_masuk, jenis_barang, keluhan, status: "Menunggu" },
  });
  return NextResponse.json(data);
}