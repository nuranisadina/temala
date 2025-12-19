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

          // Kita ambil role dari database (tulisannya "Admin")
          const roleFromDB = (user.role as any)?.role_name || "Pelanggan";

          console.log("LOGIN BERHASIL - User:", user.email, "| Role dari DB:", roleFromDB);

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: roleFromDB // Ini mengirim string "Admin"
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
      // Auto redirect based on role after successful login
      return true; // Allow sign in, redirect handled in other callback
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting after sign in, check the user's role from the URL params
      // This is a workaround since we can't access the session here directly

      // If already on a specific page, stay there
      if (url.startsWith(baseUrl)) return url;

      // Default to home page, client-side will handle role-based redirect
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