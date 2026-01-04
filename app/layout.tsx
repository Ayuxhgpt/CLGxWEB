import type { Metadata } from 'next';
import '@fontsource/inter'; // Use local font to avoid build network errors
import './globals.css';

import Providers from '@/components/Providers';

// const inter = Inter({ subsets: ['latin'] }); // Removed due to network timeouts

export const metadata: Metadata = {
  title: 'PharmaElevate — Elevating Pharma Education',
  description: 'A student-led B.Pharmacy project.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
