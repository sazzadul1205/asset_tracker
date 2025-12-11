// api/auth/[...nextauth]/route.js

// MongoDB Connect
import { connectDB } from "@/lib/connectDB";

// Next Auth
import NextAuth from "next-auth";

// Credentials Provider
import CredentialsProvider from "next-auth/providers/credentials";

// Bcrypt for password hashing
import bcrypt from "bcrypt";

const handler = NextAuth({
  // Secret key for JWT
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

  // Auth Providers
  providers: [
    CredentialsProvider({
      // Provider name
      name: "Credentials",

      // Fields for login form
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your Password",
        },
      },

      // Authorization function
      async authorize(credentials) {
        const { email, password } = credentials;

        // Validate input
        if (!email || !password) throw new Error("Email and password required");

        // Connect to DB
        const db = await connectDB();

        // Find user by email (nested field)
        const user = await db
          .collection("Users")
          .findOne({ "identity.email": email });

        if (!user) throw new Error("User not found");

        // Compare password
        const isPasswordValid = await bcrypt.compare(
          password,
          user.security.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");

        // Update last_login timestamp
        await db
          .collection("Users")
          .updateOne(
            { "identity.email": email },
            { $set: { last_login: new Date() } }
          );

        // Return safe fields for session
        return {
          email: user.identity.email,
          employee_id: user.identity.employee_id,
          access_level: user.employment.access_level || "Employee",
          full_name: user.identity.full_name,
        };
      },
    }),
  ],

  // Session settings
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: "/Auth/Login",
  },

  // Callbacks
  callbacks: {
    // Store info in JWT
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.employee_id = user.employee_id;
        token.role = user.access_level || "Employee";
        token.full_name = user.full_name;
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
          role: token.role || "Employee",
          full_name: token.full_name,
        },
      };
    },
  },
});

// Export handler for GET and POST
export { handler as GET, handler as POST };
