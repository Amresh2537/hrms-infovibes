import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !Number.isFinite(port) || !user || !pass || !from) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  return { host, port, secure, user, pass, from };
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const cfg = getSmtpConfig();

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  return cachedTransporter;
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const cfg = getSmtpConfig();
  const transporter = getTransporter();

  await transporter.sendMail({
    from: cfg.from,
    to: toEmail,
    subject: "Reset your password",
    text: `We received a password reset request for your account.\n\nOpen this link to set a new password:\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p>We received a password reset request for your account.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;">Reset Password</a>
        </p>
        <p style="margin-top:12px">Or paste this URL in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="margin-top:12px">This link expires in 30 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
