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
      // Provider
      name: "Credentials",

      // Credentials
      credentials: {
        // email
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
          requires: true,
        },

        // password
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your Password",
          requires: true,
        },
      },

      // Authorization
      async authorize(credentials) {
        // Destructure credentials
        const { email, password } = credentials;

        // Basic required fields validation
        if (!email || !password) throw new Error("Email and password required");

        // Connect to MongoDB
        const db = await connectDB();

        // Fetch full user document
        const user = await db.collection("Users").findOne({ email });

        // Check if user exists
        if (!user) throw new Error("User not found");

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Check if password is valid
        if (!isPasswordValid) throw new Error("Invalid password");

        // Return user & role
        return { email: user.email, role: user.role || "Employee" };
      },
    }),
  ],

  // Session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    // maxAge: 10,
  },

  // Pages
  pages: {
    signIn: "/Auth/Login",
  },

  // JWT & Session callbacks
  callbacks: {
    // JWT
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = user.role || "Employee";
      }
      return token;
    },

    // Session
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          email: token.email,
          role: token.role || "Employee",
        },
      };
    },
  },
});

export { handler as GET, handler as POST };
