import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
  where: {
    email,
  },
});

    if (!user) {
      return NextResponse.json(
        { message: "Email tidak ditemukan" },
        { status: 404 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(email, resetLink);

    return NextResponse.json({
      message: "Link reset password sudah dikirim ke email Anda",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengirim link reset password" },
      { status: 500 }
    );
  }
}