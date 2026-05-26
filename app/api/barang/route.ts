import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { barangSchema } from "@/lib/validations";

export async function GET() {
  const data = await prisma.barang.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
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