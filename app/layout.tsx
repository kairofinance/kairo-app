import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import "react-loading-skeleton/dist/skeleton.css";
import { ContextProvider } from "../components/context";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "../components/Navbar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Kairo - Web3 Billing Platform",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions.",
  keywords: [
    "Web3 billing",
    "crypto payments",
    "blockchain invoicing",
    "cryptocurrency",
    "payment solutions",
    "Web3 payments",
  ],
  authors: [{ name: "Kairo" }],
  creator: "Kairo",
  publisher: "Kairo",
  icons: {
    icon: "./favicon.ico",
  },
  openGraph: {
    title: "Kairo - Web3 Billing Platform",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions",
    url: "https://kairo.finance",
    siteName: "Kairo",
    images: [
      {
        url: "https://kairo.finance/preview.png",
        width: 1200,
        height: 630,
        alt: "Kairo Web3 Billing Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairo - Web3 Billing Platform",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions.",
    images: ["https://kairo.finance/preview.png"],
    creator: "@KairoFinance",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body className="bg-[#0d0d0d]">
        <ContextProvider cookies={cookies}>
          <Suspense fallback={null}>
            <div className="flex min-h-screen relative flex-col">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </Suspense>
          <Analytics />
        </ContextProvider>
      </body>
    </html>
  );
}
