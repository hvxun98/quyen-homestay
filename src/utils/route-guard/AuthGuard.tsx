'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import Loader from 'components/Loader';
import type { GuardProps } from 'types/auth';

export default function AuthGuard({ children }: GuardProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  console.log('status', status);
  console.log('data', session);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      const cb = encodeURIComponent(pathname || '/');
      router.push(`/login?callbackUrl=${cb}`);
      Cookies.remove('accessToken', { path: '/' });
      return;
    }

    if (status === 'authenticated') {
      const accessToken = (session as any)?.accessToken as string | undefined;
      if (accessToken) {
        if (Cookies.get('accessToken') !== accessToken) {
          Cookies.set('accessToken', accessToken, {
            path: '/',
            sameSite: 'strict',
            secure: true
            // có thể thêm expires: 1 (1 ngày) nếu muốn
          });
        }
      } else {
        // không có token -> đảm bảo không giữ token cũ
        Cookies.remove('accessToken', { path: '/' });
      }
    }
  }, [status, session, router, pathname]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
