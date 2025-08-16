import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkWork",
  description: "The ultimate marketplace for Web3 and AI products - discover, buy, and sell innovative digital solutions",
  icons: {
    icon: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    shortcut: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    apple: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
