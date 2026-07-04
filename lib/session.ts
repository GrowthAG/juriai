import { cookies } from "next/headers";
import {
  createSessionToken,
  IMPERSONATOR_COOKIE,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";

// Sentinela usada quando o admin estava no contexto dev (sem sessão real)
// antes de entrar num escritório. Ao sair, isso significa "volte pro fallback".
const DEV_ADMIN = "__DEV__";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const IMPERSONATION_MAX_AGE = 60 * 60 * 24;

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, "session");
}

/* Impersonation: quando um admin "Acessa" um escritório, guardamos aqui quem
   ele era, pra conseguir voltar. É o que faz a faixa "você está dentro". */
export async function getImpersonatorUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(
    store.get(IMPERSONATOR_COOKIE)?.value,
    "impersonator",
  );
}

export async function setImpersonator(userId: string) {
  const store = await cookies();
  const token = await createSessionToken(
    userId || DEV_ADMIN,
    "impersonator",
    IMPERSONATION_MAX_AGE,
  );
  store.set(IMPERSONATOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: IMPERSONATION_MAX_AGE,
  });
}

export async function clearImpersonator() {
  const store = await cookies();
  store.delete(IMPERSONATOR_COOKIE);
}

export const DEV_ADMIN_SENTINEL = DEV_ADMIN;

export async function setSession(userId: string) {
  const store = await cookies();
  const token = await createSessionToken(
    userId,
    "session",
    SESSION_MAX_AGE,
  );
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
