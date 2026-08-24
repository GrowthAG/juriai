"use server";

import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { clearImpersonator, clearSession, setSession } from "@/lib/session";
import { findAuthUserByEmail, findOrCreateAuthUserByGoogle, resolvePostLoginPath } from "@/lib/auth-user";
import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { isDevBypassEnabled } from "@/lib/dev-bypass";
import { sendWelcomeEmail } from "@/lib/email";

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

export async function registerWithEmailAndPassword(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !name) {
    redirect(`/login?tab=register&error=${encodeURIComponent("Informe seu nome completo e e-mail corporativo.")}`);
  }

  if (password && password.length < 6) {
    redirect(`/login?tab=register&error=${encodeURIComponent("A senha deve ter pelo menos 6 caracteres.")}`);
  }

  let user = await findAuthUserByEmail(email);

  if (!user) {
    user = await findOrCreateAuthUserByGoogle({
      email,
      name,
    });
  }

  if (!user) {
    redirect(`/login?tab=register&error=${encodeURIComponent("Não foi possível criar sua conta. Tente novamente.")}`);
  }

  // Dispara o e-mail de boas-vindas com os dados de acesso
  try {
    await sendWelcomeEmail({
      to: email,
      name,
      phone,
      password: password || "Definida no seu cadastro",
    });
  } catch (e) {
    console.warn("[Welcome Email Send Failed]", e);
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
