import nodemailer from "nodemailer";

type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
};

function isMailConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );
}

export async function sendMail({ to, subject, html }: SendMailArgs) {
  if (!isMailConfigured()) {
    // Em produção, isso virava "silencioso" e dificultava suporte.
    // Não logamos conteúdo do e-mail por segurança.
    console.warn("[MAIL] SMTP não configurado. Envio ignorado.", {
      to,
      subject,
    });
    return { ok: false as const, skipped: true as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });

  return { ok: true as const };
}

