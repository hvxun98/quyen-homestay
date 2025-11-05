import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * Giả định API của bạn:
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * 200: { accessToken: string, ...optional user info }
 * 401/400: { error: "Invalid credentials" }
 */

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET_KEY,

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Quan trọng: gọi route nội bộ để nhận cookie refresh_token (nếu API set)
        // Dùng đường dẫn tương đối vì authorize chạy trên server
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? ''}/api/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Nếu login route của bạn set cookie HttpOnly, nên bật credentials:
            // credentials: "include",  // bật nếu cần cookie giữa các domain/subdomain
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          }
        );

        // Nếu API trả lỗi
        if (!res.ok) {
          let message = 'Đăng nhập không thành công';
          try {
            const data = await res.json();
            message = data?.error || data?.message || message;
          } catch {}
          throw new Error(message);
        }

        const data = await res.json();

        // Kỳ vọng có accessToken
        if (!data?.accessToken) {
          throw new Error('Thiếu accessToken từ API');
        }

        // Trả về "user" cho NextAuth (sẽ được nhét vào JWT callback)
        return {
          id: data?.user?.id ?? credentials.email, // nếu API có id thì dùng, không thì tạm dùng email
          email: credentials.email,
          name: data?.user?.name ?? undefined,
          accessToken: data.accessToken,
          // bạn có thể đưa thêm info khác nếu API trả về (role, avatar, ...)
          role: data?.user?.role
        } as any;
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Lần đầu đăng nhập
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.provider = account?.provider ?? 'credentials';
      }
      return token;
    },

    async session({ session, token }) {
      // Đưa accessToken & info vào session client
      (session as any).id = token.id;
      (session as any).accessToken = token.accessToken;
      (session as any).role = token.role;
      (session as any).provider = token.provider;
      // đồng bộ email/name nếu cần
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email ?? undefined;
      }
      return session;
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || 60 * 60) // 1h mặc định
  },

  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET
  },

  pages: {
    signIn: '/login'
  }
};
