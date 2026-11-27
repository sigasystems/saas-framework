import nodemailer, { type Transporter } from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SendAuthEmailParams = {
  to: string;
  subject: string;
  heading: string;
  description: string;
  actionLabel: string;
  url: string;
};

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });

  return cachedTransporter;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Send a transactional email via the configured SMTP server.
 * Falls back to a server warning in non-production when `SMTP_HOST` is unset.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST is not configured");
    }

    console.warn("[Email] SMTP_HOST is not set; skipping send.", {
      to,
      subject,
      text,
    });
    return;
  }

  const from = process.env.EMAIL_FROM || "no-reply@localhost";

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send a standard authentication action email (verification, password reset, etc.).
 */
export async function sendAuthEmail({
  to,
  subject,
  heading,
  description,
  actionLabel,
  url,
}: SendAuthEmailParams) {
  const safeHeading = escapeHtml(heading);
  const safeDescription = escapeHtml(description);
  const safeActionLabel = escapeHtml(actionLabel);
  const safeUrl = escapeHtml(url);

  const text = `${heading}\n\n${description}\n\n${actionLabel}: ${url}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 12px;">${safeHeading}</h2>
      <p style="margin-bottom: 20px;">${safeDescription}</p>
      <p style="margin-bottom: 20px;">
        <a href="${safeUrl}" style="display: inline-block; padding: 10px 18px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
          ${safeActionLabel}
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">
        If the button does not work, copy and paste this link: ${safeUrl}
      </p>
    </div>
  `.trim();

  await sendEmail({ to, subject, text, html });
}
