import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "./components/DynamicFavicon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bttrfly - Always-on-top Markdown Note",
  description: "Local-first Markdown notebook for seamless writing. Always stays on top of your screen.",
  icons: {
    icon: [
      { url: '/icon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/icon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/butterfly.png', type: 'image/png' }
    ],
    shortcut: '/butterfly.png',
    apple: '/butterfly.png',
  },
  openGraph: {
    title: "Bttrfly - Always-on-top Markdown Note",
    description: "Local-first Markdown notebook for seamless writing",
    images: ['/Group 5564.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bttrfly - Always-on-top Markdown Note",
    description: "Local-first Markdown notebook for seamless writing",
    images: ['/Group 5564.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
