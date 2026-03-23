import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import "./globals.css";

// This sets up our "Space-Age" fonts
const sans = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Closerr | AI Sales Coach",
  description: "Train like a champion. Close like a pro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}