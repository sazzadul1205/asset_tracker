// api/auth/[...nextauth]/route.js
// MongoDB Connect
import { connectDB } from "@/lib/connectDB";

// Next Auth
import NextAuth from "next-auth";

// Credentials Provider
import CredentialsProvider from "next-auth/providers/credentials";

// Bcrypt
import bcrypt from "bcrypt";

const handler = NextAuth({
  // Secret
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your Password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) throw new Error("Email and password required");

        const db = await connectDB();
        const user = await db.collection("Users").findOne({ email });

        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        // Return email and role
        return {
          email: user.email,
          employee_id: user.employee_id,
          access_level: user.access_level || "Employee",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/Auth/Login",
  },

  callbacks: {
    // Store info in JWT
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.employee_id = user.employee_id;
        token.role = user.access_level || "Employee"; // FIXED
      }
      return token;
    },

    // Expose JWT info in session
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          email: token.email,
          employee_id: token.employee_id,
          role: token.role || "Employee", // FIXED
        },
      };
    },
  },
});

export { handler as GET, handler as POST };
