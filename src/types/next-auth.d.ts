// eslint-disable-next-line
import NextAuth from 'next-auth';
import NextAuth, { DefaultUser } from 'next-auth';
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    id?: string;
    accessToken?: string;
    role?: string;
    provider?: string;
    user: DefaultSession['user'];
  }
}

declare module 'next-auth' {
  interface Session {
    id?: string;
    provider?: string;
    accessToken?: string;
  }

  interface User extends DefaultUser {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    role?: string;
    provider?: string;
    email?: string;
  }
}
