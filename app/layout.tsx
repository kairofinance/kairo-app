import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import "react-loading-skeleton/dist/skeleton.css";
import Providers from "./providers/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import RouteTransition from "@/components/shared/ui/RouteTransition";

export const metadata: Metadata = {
  title: "Kairo - Web3 Billing Platform",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions. Streamline your crypto payments and invoicing with enterprise-grade security.",
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
      "Secure Web3 billing with real-time insights and seamless transactions. Streamline your crypto payments and invoicing with enterprise-grade security.",
    url: "https://kairo.finance", // Replace with your actual domain
    siteName: "Kairo",
    images: [
      {
        url: "/preview.png",
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
      "Secure Web3 billing with real-time insights and seamless transactions. Streamline your crypto payments and invoicing.",
    images: ["/preview.png"],
    creator: "@KairoFinance", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body className="bg-kairo-black">
        <Providers cookies={cookieHeader || ""}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <RouteTransition />
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
