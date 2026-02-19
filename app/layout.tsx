import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Client Ask Formatter',
  description: 'Convert raw client asks into structured delivery artifacts.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
