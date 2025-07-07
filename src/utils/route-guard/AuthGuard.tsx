'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Loader from 'components/Loader';
import { GuardProps } from 'types/auth';
import Cookies from 'js-cookie';

export default function AuthGuard({ children }: GuardProps) {
  // const { data: session, status } = useSession();
  // const router = useRouter();
  const { status, data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (data?.accessToken) {
      Cookies.set('accessToken', data?.accessToken);
    }
  }, [status, router, data]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
