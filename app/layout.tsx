import type { Metadata } from "next";

import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // 1. Import AuthProvider

export const metadata: Metadata = {
  title: "Temala Coffee",
  description: "Temala Coffee - Nikmati Kopi Terbaik",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`antialiased font-sans`}
      >
        {/* 2. Bungkus aplikasi dengan AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}