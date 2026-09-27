import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track the films you want to see, rate what you have seen.",
};

// Lets the page run under the iPhone home indicator and notch, so env(safe-area-inset-*) has values
// to pad by: the tab bar and rating drawer at the bottom, the body at the sides in landscape.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
