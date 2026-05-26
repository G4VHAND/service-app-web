import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { forgotPasswordLimiter } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Email tidak valid" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    try {
      await forgotPasswordLimiter.consume(email);
    } catch {
      return NextResponse.json(
        { message: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
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
      where: {
        id: user.id,
      },
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