import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function cekAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "admin";
}

export async function GET() {
  const isAdmin = await cekAdmin();
  if (!isAdmin) {
    return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
    );
 }
  const users = await prisma.user.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json(users);
}



export async function POST(req: Request) {
  try {
    const { username, email, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Username atau email sudah digunakan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        password: hashedPassword,
        role: role || "kasir",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menambahkan user" },
      { status: 500 }
    );
  }
}