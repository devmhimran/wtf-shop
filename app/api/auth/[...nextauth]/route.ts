import { authApi } from '@/lib/api-helper';
import NextAuth, { SessionStrategy, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { jwtDecode } from 'jwt-decode';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}

interface DecodedToken {
  exp?: number;
  userId?: string;
}

let isRefreshing = false;
let refreshPromise: Promise<import('next-auth/jwt').JWT> | null = null;

async function refreshAccessToken(token: import('next-auth/jwt').JWT) {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await authApi.refreshToken(token.refreshToken as string);
      const refreshedTokens = response.data;

      let accessTokenExpires;
      try {
        const decoded = jwtDecode<DecodedToken>(refreshedTokens.accessToken);
        accessTokenExpires = decoded?.exp
          ? decoded.exp * 1000
          : Date.now() + 15 * 60 * 1000;
      } catch {
        accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }

      const newToken = {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
        accessTokenExpires,
        error: undefined,
      };

      return newToken;
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

const authOptions = {
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Record<'email' | 'password', string> | undefined
      ): Promise<User | null> {
        if (!credentials) {
          throw new Error('Missing credentials');
        }

        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await authApi.signIn({ email, password });

          if (response.data) {
            return {
              id: response.data.user.id.toString(),
              role: response.data.user.role,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error('Sign in error:', error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: import('next-auth/jwt').JWT;
      user?: import('next-auth').User;
      account?: import('next-auth').Account | null;
    }) {
      // Decode and set token expiration
      if (token.accessToken) {
        const decodedToken = jwtDecode<DecodedToken>(
          token.accessToken as string
        );

        token.accessTokenExpires = decodedToken?.exp
          ? decodedToken.exp * 1000
          : Date.now() + 3600000;
      }

      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user,
        };
      }

      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({
      session,
      token,
    }: {
      session: import('next-auth').Session;
      token: import('next-auth/jwt').JWT;
    }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        const user = token.user as User;
        session.user = {
          id: user.id,
          role: user.role,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
