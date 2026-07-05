"use server";

import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { clearSession, setSession } from "@/lib/session";
import { findAuthUserByEmail, resolvePostLoginPath } from "@/lib/auth-user";
import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { isDevBypassEnabled } from "@/lib/dev-bypass";

/* Login de desenvolvimento por e-mail (sem senha, ver lib/session.ts).
   O destino final depende da camada do usuário: Console JuriAI ou Escritório. */
export async function loginAsEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!isDevBypassEnabled()) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Login de desenvolvimento está desabilitado neste ambiente.",
      )}`,
    );
  }

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Informe seu e-mail.")}`);
  }

  // Garante o usuário bootstrap antes da primeira autenticação local.
  await getActorContext();

  const user = await findAuthUserByEmail(email);

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "E-mail não encontrado. Peça para um administrador criar seu acesso em Escritórios.",
      )}`,
    );
  }

  await setSession(user.id);
  redirect(resolvePostLoginPath(user));
}

// Ponte para o Auth.js: dispara o handshake OAuth do Google. A resolução do
// usuário e o setSession() acontecem no callback signIn (ver lib/auth.ts).
export async function loginWithGoogle() {
  await authSignIn("google");
}

export async function logout() {
  // Limpa também o cookie de sessão próprio do Auth.js (se existir), sem
  // deixar que ele controle o redirect — quem decide o destino é o JuriAI.
  await authSignOut({ redirect: false });
  await clearSession();
  redirect("/login");
}
