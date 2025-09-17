import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// auth-options for the OAuthFLow (from next Auth)
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://mail.google.com/",
          access_type: "offline",
          // ensures that refresh_token is returened usefull for long term
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // called when token is created or updated
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    //add the data into the current session
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;

      // Add user info explicitly
      session.user = {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url.startsWith(baseUrl + '/auth')) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  // key for sign cookies 
  secret: process.env.NEXTAUTH_SECRET,
};
// Next Auth Handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
