// eslint-disable-next-line
import NextAuth from 'next-auth';
import NextAuth, { DefaultUser } from 'next-auth';
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    id: any;
    provider: any;
    token: any;
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
    accessToken?: string;
    id?: string;
    provider?: string;
  }
}
