import NextAuth, { SessionStrategy } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';

import { authApi } from '@/lib/api-helper';

interface DecodedToken {
  exp?: number;
  userId?: string;
}

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: { id: string; role: string };
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: { id: string; role: string };
    error?: string;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<import('next-auth/jwt').JWT> | null = null;

// ----------------------------------------------------------------------------------------
// REFRESH FUNCTION
// ----------------------------------------------------------------------------------------
async function refreshAccessToken(token: import('next-auth/jwt').JWT) {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await authApi.refreshToken(token.refreshToken as string);
      const refreshed = response.data;

      const decoded = jwtDecode<DecodedToken>(refreshed.accessToken);

      // --------------------------------------------------------
      // 🔥 REPLACE THIS RETURN BLOCK WITH THE NEW ONE
      // --------------------------------------------------------
      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? token.refreshToken,
        accessTokenExpires: decoded?.exp
          ? decoded.exp * 1000
          : Date.now() + 15 * 60 * 1000,

        // 🔥 ADD THIS — forces NextAuth to rewrite cookie every refresh
        token_version: ((token.token_version as number) || 1) + 1,
      };
    } catch (err) {
      console.error('refreshAccessToken error', err);
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ----------------------------------------------------------------------------------------
// NEXTAUTH CONFIG
// ----------------------------------------------------------------------------------------
const authOptions = {
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing credentials');
        }

        const res = await authApi.signIn(credentials);

        if (!res.data) return null;

        const user = res.data.user;
        const decoded = jwtDecode<DecodedToken>(res.data.accessToken);
        console.log({ decoded });
        return {
          id: user.id.toString(),
          role: user.role,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          accessTokenExpires: decoded?.exp
            ? decoded.exp * 1000
            : Date.now() + 15 * 60 * 1000,
        };
      },
    }),
  ],

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

  callbacks: {
    // ----------------------------------------------------------------------------------
    // JWT CALLBACK
    // ----------------------------------------------------------------------------------
    async jwt({
      token,
      user,
    }: {
      token: import('next-auth/jwt').JWT;
      user?: import('next-auth').User;
    }) {
      // Initial login — store tokens
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          user: { id: user.id, role: user.role },
          token_version: 1, // 🔥 NEW: forces cookie update after login
        };
      }

      // Access token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access expired — try refresh
      return await refreshAccessToken(token);
    },

    // ----------------------------------------------------------------------------------
    // SESSION CALLBACK
    // ----------------------------------------------------------------------------------
    async session({
      session,
      token,
    }: {
      session: import('next-auth').Session;
      token: import('next-auth/jwt').JWT;
    }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      session.user = {
        id: (token.user as { id: string; role: string }).id,
        role: (token.user as { id: string; role: string }).role,
      };

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
