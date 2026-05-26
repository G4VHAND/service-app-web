import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  userId,
  action,
  detail,
}: {
  userId?: number | null;
  action: string;
  detail?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        detail,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}