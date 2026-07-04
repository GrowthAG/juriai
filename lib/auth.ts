import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { setSession } from "@/lib/session";
import { findAuthUserByEmail, resolvePostLoginPath } from "@/lib/auth-user";

/* Auth.js só cuida do handshake OAuth com o Google. Quem manda na sessão do
   app continua sendo o cookie próprio do JuriAI (ver lib/session.ts) — o
   callback abaixo resolve o usuário e chama setSession() antes de decidir
   para onde redirecionar, no mesmo padrão de loginAsEmail. */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const found = await findAuthUserByEmail(user.email);
      if (!found) {
        return `/login?error=${encodeURIComponent(
          "E-mail não encontrado. Peça para um administrador criar seu acesso em Escritórios.",
        )}`;
      }

      await setSession(found.id);
      return resolvePostLoginPath(found);
    },
  },
});
