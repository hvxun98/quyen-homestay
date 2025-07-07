import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

function useAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const { status, data } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      setIsAuthenticated(true);
      setUserName(data.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return { isAuthenticated, userName };
}

export default useAuthenticated;
