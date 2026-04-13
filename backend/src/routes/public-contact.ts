import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendMail } from "../lib/mailer.js";

const CONTACT_TO = "contato@wpsconsult.com.br";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas mensagens. Tente novamente em alguns minutos." },
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const publicContactRouter = Router();
publicContactRouter.use(limiter);

publicContactRouter.post("/contact", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!firstName || firstName.length > 120) {
    res.status(400).json({ error: "Nome inválido." });
    return;
  }
  if (!lastName || lastName.length > 120) {
    res.status(400).json({ error: "Sobrenome inválido." });
    return;
  }
  if (!email || !isValidEmail(email) || email.length > 254) {
    res.status(400).json({ error: "E-mail inválido." });
    return;
  }
  if (!message || message.length < 10) {
    res.status(400).json({ error: "A mensagem deve ter pelo menos 10 caracteres." });
    return;
  }
  if (message.length > 8000) {
    res.status(400).json({ error: "Mensagem muito longa." });
    return;
  }

  const subject = `[Site WPS One] Contato de ${firstName} ${lastName}`;
  const html = `
    <p><strong>Nome:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
    <p><strong>E-mail do visitante:</strong> ${escapeHtml(email)}</p>
    <p><strong>Mensagem:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
  `;

  try {
    const result = await sendMail({ to: CONTACT_TO, subject, html });
    if ("skipped" in result && result.skipped) {
      res.status(503).json({
        error:
          "Envio de e-mail não configurado no servidor. Entre em contato por telefone ou e-mail direto.",
      });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[public-contact]", err);
    res.status(500).json({ error: "Não foi possível enviar sua mensagem. Tente novamente mais tarde." });
  }
});
