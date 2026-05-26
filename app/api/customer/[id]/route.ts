import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { nama, no_hp, alamat } = await req.json();

  if (!nama || !no_hp || !alamat)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const data = await prisma.customer.update({
    where: { id: Number(id) },
    data: { nama, no_hp, alamat },
  });
  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal hapus — customer masih punya data service" },
      { status: 400 }
    );
  }
}