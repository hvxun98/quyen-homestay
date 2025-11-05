import type { Metadata } from 'next';

import './globals.scss';

// project-imports
import ProviderWrapper from './ProviderWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from 'utils/authOptions';

export const metadata: Metadata = {
  title: '1MT Homestay',
  description: 'Welcome to 1MT Homestay ^^!'
};

export default async function RootLayout({ children }: { children: React.ReactElement }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="vi">
      <body>
        <ProviderWrapper session={session}>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
