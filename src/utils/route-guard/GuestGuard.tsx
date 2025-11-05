'use client';

import { useEffect } from 'react';

// next
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project-imports
import Loader from 'components/Loader';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard/default');
    }
  }, [status]);

  if (status === 'loading') return <Loader />;

  return <>{children}</>;
}
