import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userCreateSchema } from "@/lib/validations";

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
    const isAdmin = await cekAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const parsed = userCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "Input tidak valid",
        },
        { status: 400 }
      );
    }

    const { username, email, password, role } = parsed.data;

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
        role,
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