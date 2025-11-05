'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Loader from 'components/Loader';
import type { GuardProps } from 'types/auth';

export default function AuthGuard({ children }: GuardProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  console.log('status', status);
  console.log('session', session);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
