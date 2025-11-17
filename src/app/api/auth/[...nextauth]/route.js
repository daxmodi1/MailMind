import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token) {
  try {
    const url = "https://oauth2.googleapis.com/token";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await res.json();

    if (!res.ok) {
      console.error("Failed to refresh token:", refreshed);
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    
    // Mark token as invalid - forces re-login
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessToken: null,
      refreshToken: null,
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://mail.google.com/",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // Initial Login - save all tokens
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: Date.now() + account.expires_in * 1000,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
        };
      }

      // Token still valid
      if (Date.now() < token.expiresAt) {
        return token;
      }

      // Token expired - refresh it
      console.log("Token expired, refreshing...");
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      // If no valid tokens, mark session as invalid but still return it
      if (!token.accessToken || !token.refreshToken || token.error) {
        console.log("No valid tokens or error present");
        return {
          ...session,
          error: token.error || "NoTokens",
          accessToken: null,
          refreshToken: null,
        };
      }

      // Pass token data to session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      
      // Pass user data to session
      if (token.user) {
        session.user = token.user;
      }
      
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };