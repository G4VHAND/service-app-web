import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Akses ditolak" },
      { status: 403 }
    );
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          username: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(logs);
}