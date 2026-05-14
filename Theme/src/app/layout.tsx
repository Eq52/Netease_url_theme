import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Aural",
  description: "Aural — 沉浸式音乐体验",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        <script src="/config.js" defer></script>
        <link rel="stylesheet" href="/aplayer.min.css" />
        <script src="/aplayer.min.js" defer></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground aural-bg`}>
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
