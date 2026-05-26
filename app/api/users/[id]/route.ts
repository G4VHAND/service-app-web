import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const currentUser = await getCurrentUser();

    if (currentUser?.id === Number(id)) {
      return NextResponse.json(
        { message: "Anda tidak bisa menghapus akun sendiri" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    await createAuditLog({
      userId: currentUser?.id,
      action: "DELETE_USER",
      detail: `Menghapus user ID ${id}`,
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
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { password, role, email } = await req.json();

    const data: any = {};

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password minimal 6 karakter" },
          { status: 400 }
        );
      }

      data.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      if (!["admin", "kasir"].includes(role)) {
        return NextResponse.json(
          { message: "Role tidak valid" },
          { status: 400 }
        );
      }

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

    const currentUser = await getCurrentUser();

    await createAuditLog({
      userId: currentUser?.id,
      action: "UPDATE_USER",
      detail: `Mengupdate user ID ${id}`,
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