import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    // Conditionally add Google provider if environment variables are set
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    // Conditionally add Microsoft Entra ID provider if environment variables are set
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
      ? [
          MicrosoftEntraIDProvider({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn({ user }) {
      // Check if the user is allowed to sign in
      if (!user.email) {
        return false; // Deny sign in if no email
      }

      const userEmail = user.email;
      const allowedEmails = (process.env.ALLOWED_SIGN_IN_EMAILS || "")
        .split(",")
        .filter(Boolean);

      if (allowedEmails.length === 0) {
        console.error(
          "Security: ALLOWED_SIGN_IN_EMAILS environment variable is not configured. Access denied."
        );
        return false; // Deny access if whitelist is empty for security
      }

      let isAllowed = false;
      for (const rule of allowedEmails) {
        if (rule.startsWith("*@")) {
          const domain = rule.substring(1);
          if (userEmail.endsWith(domain)) {
            isAllowed = true;
            break;
          }
        } else {
          if (userEmail === rule) {
            isAllowed = true;
            break;
          }
        }
      }

      return isAllowed;
    },
    async jwt({ token, user }) {
      // Add user id to the token on initial sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to the session
      (session.user as { id?: string }).id = token.id;
      return session;
    },
  },
} satisfies NextAuthConfig;
