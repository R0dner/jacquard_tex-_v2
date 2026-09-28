import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/auth",
  cookies: {
    sessionToken: {
      name: "cliente-session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    callbackUrl: {
      name: "cliente-callback-url",
      options: { sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    csrfToken: {
      name: "cliente-csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
  },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const cliente = await prisma.cliente.findUnique({ where: { email: creds.email as string } });
        if (!cliente || !cliente.passwordHash || cliente.bloqueado) return null;
        const valido = await bcrypt.compare(creds.password as string, cliente.passwordHash);
        if (!valido) return null;
        return { id: String(cliente.id), email: cliente.email, name: cliente.nombre };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existente = await prisma.cliente.findUnique({ where: { email: user.email } });
        if (!existente) {
          await prisma.cliente.create({
            data: { email: user.email, nombre: user.name, confirmado: true },
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const cliente = await prisma.cliente.findUnique({ where: { email: user.email } });
        if (cliente) token.id = String(cliente.id);
      } else if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.id;
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});