import type { Metadata } from 'next';

import './globals.scss';

// project-imports
import ProviderWrapper from './ProviderWrapper';

export const metadata: Metadata = {
  title: 'Sieulab Pro',
  description: 'Welcome to Sieulab ^^!'
};

export default function RootLayout({ children }: { children: React.ReactElement }) {
  return (
    <html lang="vi">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
