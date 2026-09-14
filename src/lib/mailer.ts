import nodemailer from "nodemailer";
import { getSiteSettings } from "@/lib/settings-repo";
import type { Transporter } from "nodemailer";

// Sends mail through Hostinger's own SMTP service (or any SMTP server) —
// no third-party email API. Configure with these environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
// Locally, put them in .env.local. On Hostinger, set them under the
// deployment's "Environment variables" panel.
//
// If SMTP isn't configured, registration must not be blocked — the caller
// falls back to showing the verification link directly on the confirmation
// page, the same "graceful degradation" pattern used for the database.

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 = implicit TLS; 587/25 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

export function mailerConfigured(): boolean {
  return getTransporter() !== null;
}

type SendResult = { sent: boolean; error?: string };

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<SendResult> {
  const t = getTransporter();
  if (!t) return { sent: false, error: "SMTP not configured" };

  const settings = await getSiteSettings();
  const hotel = settings.hotelName;
  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";

  try {
    await t.sendMail({
      from: `"${hotel}" <${from}>`,
      to,
      subject: `Confirm your ${hotel} account`,
      text: `Hi ${name},\n\nPlease confirm your email address to activate your ${hotel} account:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— ${hotel}`,
      html: `<p>Hi ${name},</p><p>Please confirm your email address to activate your ${hotel} account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p><p>— ${hotel}</p>`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] failed to send verification email:", err);
    return { sent: false, error: "send failed" };
  }
}
