import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serviceSchema } from "@/lib/validations";

export async function GET() {
  const data = await prisma.service.findMany({
    include: { customer: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

const parsed = serviceSchema.safeParse(body);

if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0]?.message || "Input tidak valid" },
    { status: 400 }
  );
}

const {
  customer_id,
  tanggal_masuk,
  jenis_barang,
  keluhan,
  status,
} = parsed.data;
}