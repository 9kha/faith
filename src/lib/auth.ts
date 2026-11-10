import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { verify as verifyArgon2 } from "@node-rs/argon2";
import { db } from "./db";

/** Supports both argon2 (seeded hashes) and legacy bcryptjs hashes. */
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    if (hash.startsWith("$argon2")) return await verifyArgon2(hash, password);
    return await compare(password, hash);
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400", 10),
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.passwordHash || user.status !== "ACTIVE") return null;

        const isValid = await verifyPassword(user.passwordHash, credentials.password);

        if (!isValid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleId: user.roleId,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: unknown }).role;
        token.roleId = (user as { roleId?: unknown }).roleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: unknown }).role = token.role;
        (session.user as { roleId?: string }).roleId = token.roleId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAuthSession = () => getServerSession(authOptions);
