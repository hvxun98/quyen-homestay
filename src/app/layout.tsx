import type { Metadata } from 'next';

import './globals.scss';

// project-imports
import ProviderWrapper from './ProviderWrapper';

export const metadata: Metadata = {
  title: '1MT Homestay',
  description: 'Welcome to 1MT Homestay ^^!'
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
