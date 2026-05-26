import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function cekAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "admin";
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const isAdmin = await cekAdmin();

if (!isAdmin) {
  return NextResponse.json(
    { message: "Akses ditolak" },
    { status: 403 }
  );
}

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password, role, email } = await req.json();

    const data: any = {};
    const isAdmin = await cekAdmin();

if (!isAdmin) {
  return NextResponse.json(
    { message: "Akses ditolak" },
    { status: 403 }
  );
}

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      data.role = role;
    }

    if (email !== undefined) {
      data.email = email || null;
    }

    await prisma.user.update({
      where: {
        id: Number(id),
      },
      data,
    });

    return NextResponse.json({
      message: "User berhasil diperbarui",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}