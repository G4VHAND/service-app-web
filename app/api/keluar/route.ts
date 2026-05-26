import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.barangKeluar.findMany({
    include: {
      service: { include: { customer: true } },
      customer: true,
    },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { service_id, customer_id } = await req.json();
  if (!service_id || !customer_id)
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });

  // Cek apakah sudah pernah keluar
  const existing = await prisma.barangKeluar.findUnique({
    where: { service_id: Number(service_id) },
  });
  if (existing)
    return NextResponse.json({ error: "Barang ini sudah dicatat keluar" }, { status: 400 });

  const tanggal_keluar = new Date().toISOString().split("T")[0];
  const data = await prisma.barangKeluar.create({
    data: {
      service_id: Number(service_id),
      customer_id: Number(customer_id),
      tanggal_keluar,
    },
  });
  return NextResponse.json(data);
}