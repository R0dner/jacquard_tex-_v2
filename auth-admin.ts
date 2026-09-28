import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers: adminHandlers, auth: adminAuth, signIn: adminSignIn, signOut: adminSignOut } = NextAuth({
  basePath: "/api/auth-admin",
  cookies: {
    sessionToken: {
      name: "admin-session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    callbackUrl: {
      name: "admin-callback-url",
      options: { sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    csrfToken: {
      name: "admin-csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
  },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const usuario = await prisma.usuario.findUnique({ where: { email: creds.email as string } });
        if (!usuario || !usuario.activo) return null;
        const valido = await bcrypt.compare(creds.password as string, usuario.passwordHash);
        if (!valido) return null;
        return { id: String(usuario.id), email: usuario.email, name: usuario.nombre, role: usuario.rol };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const usuario = await prisma.usuario.findUnique({ where: { email: user.email! } });
        if (!usuario || !usuario.activo) return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const usuario = await prisma.usuario.findUnique({ where: { email: user.email } });
        if (usuario) {
          token.id = String(usuario.id);
          token.role = usuario.rol;
        }
      } else if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).id = token.id;
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
});