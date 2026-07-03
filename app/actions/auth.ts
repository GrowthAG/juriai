"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, setSession } from "@/lib/session";

/* Login de desenvolvimento por e-mail (sem senha, ver lib/session.ts).
   O destino final depende da camada do usuário: Console JuriAI ou Escritório. */
export async function loginAsEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Informe seu e-mail.")}`);
  }

  // Guarda de segurança server-side para o login de desenvolvimento.
  if (email.endsWith("@juriai.local") && process.env.NODE_ENV !== "development") {
    redirect(
      `/login?error=${encodeURIComponent(
        "Login de desenvolvimento está desabilitado neste ambiente.",
      )}`,
    );
  }

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      isSuperAdmin: boolean;
      workspaceKind: "MASTER" | "SUBCONTA";
    }>
  >`
    SELECT
      u."id",
      u."isSuperAdmin",
      w."kind" AS "workspaceKind"
    FROM "User" u
    JOIN "Workspace" w ON w."id" = u."workspaceId"
    WHERE LOWER(u."email") = ${email}
    LIMIT 1
  `;
  const user = rows[0];

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "E-mail não encontrado. Peça para um administrador criar seu acesso em Escritórios.",
      )}`,
    );
  }

  await setSession(user.id);
  if (user.isSuperAdmin || user.workspaceKind === "MASTER") {
    redirect("/admin");
  }
  redirect("/workspace");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
