// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import Navbar from "@/components/NavBar";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KSP Projects',
  description: 'Empowering students with cutting-edge IoT and ML solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}