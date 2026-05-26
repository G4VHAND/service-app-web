import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Venus Computer" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Password Admin",
    html: `
      <h2>Reset Password</h2>
      <p>Klik link berikut untuk mengganti password akun Anda:</p>
      <p>
        <a href="${resetLink}" target="_blank">
          Reset Password
        </a>
      </p>
      <p>Link ini hanya berlaku selama 15 menit.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  });
}