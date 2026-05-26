import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ firstSetup: count === 0 });
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "Admin sudah ada" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed, role: "admin" },
  });

  return NextResponse.json({ success: true });
}