// ─────────────────────────────────────────────────────────────
// Email utility — password reset emails
//
// Uses nodemailer to send transactional emails via SMTP.
// nodemailer is loaded dynamically at runtime so the server
// can start even if the package is not installed — email
// features simply won't work in that case.
//
// Required env vars (all optional in development):
//   SMTP_HOST  — SMTP server hostname (default: smtp.gmail.com)
//   SMTP_PORT  — SMTP port (default: 587)
//   SMTP_SECURE — "true" for port 465 / SSL (default: false)
//   SMTP_USER  — SMTP account username / email
//   SMTP_PASS  — SMTP account password or app password
//   SMTP_FROM  — "From" address shown in the email
// ─────────────────────────────────────────────────────────────

// ── MailerModule type ─────────────────────────────────────────
// Minimal type definition for the nodemailer module so TypeScript
// can understand what we get back from the dynamic import below.
type MailerModule = {
  createTransport: (options: Record<string, unknown>) => {
    sendMail: (message: Record<string, unknown>) => Promise<unknown>;
  };
};

// ── loadMailer ────────────────────────────────────────────────
// Dynamically imports nodemailer at runtime instead of at module
// load time. This avoids a startup crash if nodemailer has not
// been installed — we only fail when someone actually tries to
// send an email.
async function loadMailer(): Promise<MailerModule> {
  try {
    const importer = new Function("specifier", "return import(specifier)") as (
      specifier: string
    ) => Promise<any>;
    const mod = await importer("nodemailer");
    return mod.default ?? mod;
  } catch {
    throw new Error(
      "Email support requires nodemailer. Run npm install in the backend before sending reset emails."
    );
  }
}

// ── hasSmtpCredentials ────────────────────────────────────────
// Returns true only if both SMTP_USER and SMTP_PASS are set.
// Used to decide whether to actually send email or just log the
// reset link to the console (handy during local development).
function hasSmtpCredentials() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// ── createTransport ───────────────────────────────────────────
// Builds a nodemailer transport configured from environment
// variables. Called once per email send — transports are cheap
// to create and this avoids holding a persistent connection.
async function createTransport() {
  const nodemailer = await loadMailer();
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── sendPasswordResetEmail ────────────────────────────────────
// Sends a password-reset email to the given address containing
// a magic link that includes the one-time token.
//
// Behaviour in development (no SMTP credentials set):
//   Prints the reset URL to the console instead of sending email.
//   This lets developers test the reset flow without any email config.
//
// Behaviour in production (SMTP credentials required):
//   Throws an error if credentials are missing so the bug is visible
//   immediately instead of silently failing to deliver the email.
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!hasSmtpCredentials()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_USER and SMTP_PASS must be configured to send password reset emails.");
    }
    console.info(`[email] SMTP is not configured. Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const from = process.env.SMTP_FROM || "FitAI Coach <noreply@fitai-coach.app>";
  const transport = await createTransport();

  // Send both HTML (rich email clients) and plain text (fallback).
  // The reset link expires in 1 hour — matching the database record's expiresAt.
  await transport.sendMail({
    from,
    to,
    subject: "Reset your FitAI Coach password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#10b981">FitAI Coach</h2>
        <p>Hi, we received a request to reset your password.</p>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">If you did not request this, ignore this email — your password will not change.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#aaa;font-size:12px">FitAI Coach &mdash; Your AI-powered fitness companion</p>
      </div>
    `,
    text: `Reset your FitAI Coach password\n\nVisit this link within 1 hour:\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  });
}
