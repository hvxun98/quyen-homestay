// next
import axios from 'axios';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET_KEY,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        slug: { label: 'Company Slug', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        let error = '';
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/authenticate`, {
            username: credentials.username,
            password: credentials.password,
            rememberMe: true
          });

          if (response?.data?.id_token) {
            return {
              id: credentials.username,
              username: credentials.username,
              accessToken: response.data.id_token
            };
          }
          error = response?.data?.error?.message || 'Đăng nhập không thành công';
          throw new Error(response?.data?.error?.message || 'Đăng nhập không thành công');
        } catch (err) {
          console.error(err);
          throw new Error(error);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.id = token.id;
        session.provider = token.provider;
        session.accessToken = token.accessToken;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || 60 * 60)
  },
  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET
  },
  pages: {
    signIn: '/login'
  }
};
