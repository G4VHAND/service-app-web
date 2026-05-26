import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { penjualanSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const data = await prisma.transaksiPenjualan.findMany({
    include: { detailPenjualans: { include: { barang: true } } },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = penjualanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Input tidak valid",
      },
      { status: 400 }
    );
  }

  const { items } = parsed.data;

  // Validasi stok cukup
  for (const item of items) {
    const barang = await prisma.barang.findUnique({ where: { id: item.barang_id } });
    if (!barang) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 400 });
    if (barang.stok < item.jumlah)
      return NextResponse.json(
        { error: `Stok ${barang.nama_barang} tidak cukup (sisa: ${barang.stok})` },
        { status: 400 }
      );
  }

  const total = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
  const tanggal = new Date().toISOString().split("T")[0];

  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  // Buat transaksi + detail + kurangi stok
  const trx = await prisma.$transaction(async (tx) => {

    const penjualan = await tx.transaksiPenjualan.create({
      data: {
        total,
        tanggal,
        userId: userId || null,
        detailPenjualans: {
          create: items.map((i: any) => ({
            barang_id: i.barang_id,
            jumlah: i.jumlah,
            subtotal: i.subtotal,
          })),
        },
      },
    });

    // Kurangi stok setiap barang
    for (const item of items) {
      await tx.barang.update({
        where: { id: item.barang_id },
        data: { stok: { decrement: item.jumlah } },
      });
    }

    return penjualan;
  });

  await createAuditLog({
    userId: userId || null,
    action: "CREATE_PENJUALAN",
    detail: `Membuat transaksi penjualan ID ${trx.id}`,
  });

  return NextResponse.json(trx);
}