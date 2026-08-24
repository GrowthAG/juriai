import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { setSession } from "@/lib/session";
import { findOrCreateAuthUserByGoogle, resolvePostLoginPath } from "@/lib/auth-user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET || "dev-secret-key-must-be-at-least-32-chars-long",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const resolvedUser = await findOrCreateAuthUserByGoogle({
        email: user.email,
        name: user.name,
      });

      if (!resolvedUser) {
        return false;
      }

      try {
        await setSession(resolvedUser.id);
      } catch (e) {}

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (e) {}
      return `${baseUrl}/workspace`;
    },
  },
});
