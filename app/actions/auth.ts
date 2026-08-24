"use server";

import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { clearImpersonator, clearSession, setSession } from "@/lib/session";
import { findAuthUserByEmail, findOrCreateAuthUserByGoogle, resolvePostLoginPath } from "@/lib/auth-user";
import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { isDevBypassEnabled } from "@/lib/dev-bypass";

/* Login de desenvolvimento por e-mail (sem senha, ver lib/session.ts).
   O destino final depende da camada do usuário: Console JuriAI ou Escritório. */
export async function loginAsEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Informe seu e-mail corporativo.")}`);
  }

  let user = await findAuthUserByEmail(email);

  // Se o usuário ainda não existe no workspace, cria automaticamente a conta de trial
  if (!user) {
    const rawName = email.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    user = await findOrCreateAuthUserByGoogle({
      email: email,
      name: `Dr(a). ${formattedName}`,
    });
  }

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Não foi possível inicializar seu workspace. Tente novamente.",
      )}`,
    );
  }

  await setSession(user.id);
  await clearImpersonator();
  redirect(resolvePostLoginPath(user));
}

// Ponte para o Auth.js: dispara o handshake OAuth do Google.
export async function loginWithGoogle() {
  await authSignIn("google", { redirectTo: "/workspace" });
}

export async function logout() {
  // Limpa também o cookie de sessão próprio do Auth.js (se existir), sem
  // deixar que ele controle o redirect: quem decide o destino é o JuriAI.
  await authSignOut({ redirect: false });
  await clearSession();
  await clearImpersonator();
  redirect("/login");
}
