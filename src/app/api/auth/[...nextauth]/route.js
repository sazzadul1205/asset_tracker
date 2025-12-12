// src/app/api/auth/[...nextauth]/route.js

/**
 * NEXT-AUTH ROUTE (App Router)
 * ---------------------------
 * This file handles all authentication requests:
 *  - /api/auth/signin
 *  - /api/auth/signout
 *  - /api/auth/session
 *  - /api/auth/callback/credentials
 *
 * If this file fails or returns HTML instead of JSON,
 * the frontend will throw:
 *
 *   Unexpected token '<', "<!DOCTYPE..." is not valid JSON
 *
 * That means this route is broken or unreachable.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Custom MongoDB connector
import { connectDB } from "@/lib/connectDB";

// Bcrypt module for password verification
import bcrypt from "bcrypt";

// ----------------------------------------------------
// AUTH HANDLER
// ----------------------------------------------------
export const authOptions = {
  /**
   * IMPORTANT:
   * Never use NEXT_PUBLIC_ for secrets — it exposes them to the browser.
   * Use:
   *
   *   AUTH_SECRET="your-random-secret"
   *
   * in your .env file.
   */
  secret: process.env.AUTH_SECRET,

  // ----------------------------------------------------
  // AUTH PROVIDERS
  // ----------------------------------------------------
  providers: [
    CredentialsProvider({
      name: "Credentials",

      // These fields appear in the default NextAuth login form
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your Password",
        },
      },

      /**
       * AUTHORIZE FUNCTION
       * ------------------
       * This runs when a user attempts to sign in.
       * If you return a user object → login success.
       * If you return null or throw → login fails.
       */
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!email || !password) throw new Error("Email and password required");

        const db = await connectDB();

        // Find user using your real schema
        const user = await db
          .collection("users")
          .findOne({ "credentials.email": email });

        if (!user) throw new Error("User not found");

        // Compare password with credentials.password
        const passwordMatch = await bcrypt.compare(
          password,
          user.credentials.password
        );

        if (!passwordMatch) throw new Error("Invalid password");

        // Update last login
        await db
          .collection("users")
          .updateOne(
            { "credentials.email": email },
            { $set: { "credentials.lastLogin": new Date() } }
          );

        // Return safe info for JWT
        return {
          email: user.credentials.email,
          userId: user.personal.userId,
          name: user.personal.name,
          role: user.employment.role,
          position: user.employment.position,
          departmentId: user.employment.departmentId,
        };
      },
    }),
  ],

  // ----------------------------------------------------
  // SESSION CONFIG
  // ----------------------------------------------------
  session: {
    strategy: "jwt", // use JWT session instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ----------------------------------------------------
  // CUSTOM PAGES
  // ----------------------------------------------------
  /**
   * MUST MATCH YOUR REAL PATH:
   *
   * Your directory:
   *   src/app/auth/login/page.jsx
   *
   * So the correct route is:
   *   /auth/login
   */
  pages: {
    signIn: "/auth/login",
  },

  // ----------------------------------------------------
  // CALLBACKS
  // ----------------------------------------------------
  callbacks: {
    /**
     * JWT CALLBACK
     * Runs whenever a token is created or updated.
     */
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.userId = user.userId;
        token.name = user.name;
        token.role = user.role;
        token.position = user.position;
        token.departmentId = user.departmentId;
      }
      return token;
    },

    /**
     * SESSION CALLBACK
     * Controls what's returned to the client during getSession().
     */
    async session({ session, token }) {
      session.user = {
        email: token.email,
        userId: token.userId,
        name: token.name,
        role: token.role,
        position: token.position,
        departmentId: token.departmentId,
      };

      return session;
    },
  },
};

// Export GET and POST handlers for the App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
