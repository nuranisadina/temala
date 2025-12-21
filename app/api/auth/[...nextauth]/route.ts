import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { role: true }
          });

          if (!user || !user.password) return null;

          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) return null;

          const roleFromDB = (user.role as any)?.role_name || "Pelanggan";

          console.log("LOGIN BERHASIL - User:", user.email, "| Role:", roleFromDB, "| ID:", user.id);

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: roleFromDB
          };
        } catch (error) {
          console.error("Database Error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - Menyimpan ID dan role ke token JWT
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - Menambahkan ID dan role ke session
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only",
  debug: true,
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };