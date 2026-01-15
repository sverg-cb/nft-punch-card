import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Stamp Cards',
  description: 'Collect stamps and unlock rewards from your favorite places',
  other: {
    'base:app_id': '69692a198b0e0e7315e206ee',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <Providers>{children}</Providers>
      </body>
    </html>
  );
}
