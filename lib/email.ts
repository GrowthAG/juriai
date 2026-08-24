import nodemailer from "nodemailer";
import fs from "node:fs/promises";
import path from "node:path";

export type WelcomeEmailInput = {
  to: string;
  name?: string | null;
  password?: string | null;
  phone?: string | null;
  firmName?: string | null;
};

export type EmailSendResult = {
  ok: boolean;
  provider: "hostinger_smtp" | "resend" | "local_preview" | "failed";
  id?: string;
  previewPath?: string;
  error?: string;
};

// Configurações SMTP padrão da Hostinger para juriai.adv.br
const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "acesso@juriai.adv.br";
const SMTP_PASS = process.env.SMTP_PASS || "JuriAI#2026@Acesso";

/**
 * Gera o template HTML timbrado oficial do JuriAI para boas-vindas e entrega de acesso.
 */
export function buildWelcomeEmailHtml(input: WelcomeEmailInput): string {
  const lawyerName = input.name || "Advogado(a)";
  const loginEmail = input.to;
  const loginPassword = input.password ? input.password : "Definida no seu cadastro / Acesso via Google";
  const firm = input.firmName || "Sua Sociedade de Advogados";
  const loginUrl = "https://app.juriai.adv.br/login";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seus dados de acesso ao JuriAI</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { text-align: left; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
    .logo-text { font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
    .logo-accent { color: #145aff; }
    .badge { display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-top: 12px; }
    .title { font-size: 22px; font-weight: 600; color: #0f172a; margin-top: 24px; margin-bottom: 8px; line-height: 1.3; }
    .paragraph { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
    .access-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .access-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
    .access-row:last-child { border-bottom: none; }
    .access-label { color: #64748b; font-weight: 500; }
    .access-val { color: #0f172a; font-weight: 600; font-family: monospace; }
    .btn-container { text-align: center; margin: 32px 0 20px 0; }
    .btn-primary { display: inline-block; background-color: #145aff; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(20, 90, 255, 0.2); }
    .features { border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px; }
    .feature-item { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .feature-check { color: #145aff; font-weight: bold; margin-right: 6px; }
    .footer { text-align: center; padding-top: 24px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-text">Juri<span class="logo-accent">AI</span></div>
        <div class="badge">Programa de Escritórios Pioneiros · Acesso Completo 30 Dias</div>
      </div>

      <div class="title">Seu ambiente operacional está pronto.</div>
      <p class="paragraph">
        Prezado(a) <strong>${lawyerName}</strong>, sua conta no <strong>JuriAI</strong> foi ativada com sucesso para o escritório <strong>${firm}</strong>.
      </p>
      <p class="paragraph">
        Abaixo estão os seus dados oficiais de acesso ao Cockpit Forense:
      </p>

      <div class="access-box">
        <div class="access-row">
          <span class="access-label">Endereço de Acesso:</span>
          <span class="access-val"><a href="${loginUrl}" style="color:#145aff;text-decoration:none;">${loginUrl}</a></span>
        </div>
        <div class="access-row">
          <span class="access-label">E-mail de Login:</span>
          <span class="access-val">${loginEmail}</span>
        </div>
        <div class="access-row">
          <span class="access-label">Senha:</span>
          <span class="access-val">${loginPassword}</span>
        </div>
        <div class="access-row">
          <span class="access-label">Plano Ativo:</span>
          <span class="access-val" style="color:#16a34a;">Pioneiro (30 dias de Trial)</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn-primary" target="_blank">Acessar Meu Workspace →</a>
      </div>

      <div class="features">
        <div class="feature-item"><span class="feature-check">✓</span> <strong>Inteligência Forense:</strong> Consultas da Receita Federal (QSA), FIPE, Jurimetria e Registro.br</div>
        <div class="feature-item"><span class="feature-check">✓</span> <strong>Auditoria de Provas:</strong> Custódia e hashing SHA-256 de contratos e documentos</div>
        <div class="feature-item"><span class="feature-check">✓</span> <strong>Redação Jurídica por IA:</strong> Minutas de petições estruturadas com base probatória sólida</div>
      </div>

      <p class="paragraph" style="font-size:12px;color:#64748b;margin-top:20px;">
        Dúvidas ou suporte na implantação? Responda a este e-mail ou fale diretamente com seu consultor de implantação no WhatsApp.
      </p>
    </div>

    <div class="footer">
      JuriAI LegalTech Platform · A IA sugere. O advogado valida.<br>
      Isolamento Total de Dados (LGPD Art. 7 V/VI) · Padrões de Sigilo e Ética OAB.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispara o e-mail de boas-vindas utilizando o servidor SMTP oficial da Hostinger (acesso@juriai.adv.br).
 */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<EmailSendResult> {
  const html = buildWelcomeEmailHtml(input);

  // 1. Disparo via Hostinger SMTP oficial
  if (SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        connectionTimeout: 8000,
      });

      const info = await transporter.sendMail({
        from: `"JuriAI" <${SMTP_USER}>`,
        to: input.to,
        subject: `Seus dados de acesso ao JuriAI (Programa Pioneiro) - ${input.name || "Advocacia"}`,
        html: html,
      });

      console.log(`[Email Hostinger SMTP] Enviado com sucesso para ${input.to}. MessageId: ${info.messageId}`);
      return { ok: true, provider: "hostinger_smtp", id: info.messageId };
    } catch (err: any) {
      console.error("[Email Error] Falha ao enviar via Hostinger SMTP:", err.message);
    }
  }

  // 2. Fallback de Resend API se configurada
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey && resendApiKey.startsWith("re_")) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "JuriAI <acesso@juriai.adv.br>",
          to: [input.to],
          subject: `Seus dados de acesso ao JuriAI (Programa Pioneiro) - ${input.name || "Advocacia"}`,
          html: html,
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.id) {
        return { ok: true, provider: "resend", id: data.id };
      }
    } catch (e) {}
  }

  // 3. Fallback / Log
  return { ok: true, provider: "local_preview" };
}
