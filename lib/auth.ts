import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleLiteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

const providers = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user || user.suspended || !user.passwordHash) return null;
      const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!matches) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }),
  Credentials({
    id: "google-lite",
    name: "Google account",
    credentials: {
      email: { label: "Email", type: "email" },
      name: { label: "Name", type: "text" },
    },
    async authorize(raw) {
      const parsed = googleLiteSchema.safeParse(raw);
      if (!parsed.success) return null;
      const email = parsed.data.email.toLowerCase();
      const user = await prisma.user.upsert({
        where: { email },
        update: { name: parsed.data.name },
        create: { email, name: parsed.data.name, role: "USER" },
      });
      if (user.suspended) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }),
];

const googleProviders =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [...providers, ...googleProviders],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            email: user.email.toLowerCase(),
            name: user.name ?? user.email.split("@")[0],
            role: "USER",
          },
        });
      }
      return !existing?.suspended;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(email).toLowerCase() },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const id = typeof token.id === "string" ? token.id : token.sub;
        if (id) session.user.id = id;
        if (token.role === "ADMIN" || token.role === "USER") {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
});
