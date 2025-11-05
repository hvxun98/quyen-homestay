'use client';

import { useEffect } from 'react';

// next
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project-imports
import Loader from 'components/Loader';
import { useIspValue } from 'hooks/useIspValue';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const ispValueAvailable = useIspValue();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(ispValueAvailable ? '/dashboard/default?isp=1' : '/dashboard/default');
    }
  }, [status]);

  if (status === 'loading' || session?.user) return <Loader />;

  return <>{children}</>;
}
