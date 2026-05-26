import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const data = await prisma.transaksi.findMany({
    include: { service: { include: { customer: true } } },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { service_id, biaya_service, total } = await req.json();
  if (!service_id || biaya_service === undefined)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const tanggal = new Date().toISOString().split("T")[0];

  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  // Buat transaksi
  const data = await prisma.transaksi.create({
    data: {
      service_id: Number(service_id),
      biaya_service: Number(biaya_service),
      total: Number(total),
      tanggal,
      userId: userId || null,
    },
  });

  // Update status service jadi Selesai
  await prisma.service.update({
    where: { id: Number(service_id) },
    data: { status: "Selesai" },
  });

  return NextResponse.json(data);
}