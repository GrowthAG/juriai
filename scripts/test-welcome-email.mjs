import { buildWelcomeEmailHtml, sendWelcomeEmail } from "../lib/email.ts";
import fs from "node:fs/promises";
import path from "node:path";

async function run() {
  console.log("=== TESTE DE TEMPLATE E ENVIO DE E-MAIL JURI AI ===");
  
  const testData = {
    to: "giulliano@usefunnels.io",
    name: "Dr. Giulliano Alves",
    password: "Advocacia@2026",
    phone: "(11) 98765-4321",
    firmName: "Alves & Dias Sociedade de Advogados",
  };

  const html = buildWelcomeEmailHtml(testData);
  const outPath = path.join(process.cwd(), "tmp", "welcome_email_preview.html");
  await fs.mkdir(path.join(process.cwd(), "tmp"), { recursive: true });
  await fs.writeFile(outPath, html, "utf8");

  console.log("1. Preview HTML gerado com sucesso em:", outPath);

  const result = await sendWelcomeEmail(testData);
  console.log("2. Resultado do disparo:", result);
}

run().catch(console.error);
