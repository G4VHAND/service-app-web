import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.customer.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { nama, no_hp, alamat } = await req.json();
  if (!nama || !no_hp || !alamat)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const data = await prisma.customer.create({ data: { nama, no_hp, alamat } });
  return NextResponse.json(data);
}