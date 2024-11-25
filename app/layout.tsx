import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import "react-loading-skeleton/dist/skeleton.css";
import Context from "./Context";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Plasma - Web3 Billing Platform",
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
  authors: [{ name: "Plasma" }],
  creator: "Plasma",
  publisher: "Plasma",
  icons: {
    icon: "./favicon.ico",
  },
  openGraph: {
    title: "Plasma - Web3 Billing Platform",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions",
    url: "https://plasma.finance",
    siteName: "Plasma",
    images: [
      {
        url: "https://plasma.finance/preview.png",
        width: 1200,
        height: 630,
        alt: "Plasma Web3 Billing Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plasma - Web3 Billing Platform",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions.",
    images: ["https://plasma.finance/preview.png"],
    creator: "@PlasmaFinance",
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
      <body className="bg-[#060606]">
        <Context cookies={cookieHeader || ""}>
          <Navbar />
          <div className="flex min-h-screen relative">
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col flex-1">
                <main className="flex-grow">
                  <Suspense fallback={null}>{children}</Suspense>
                </main>
              </div>
            </div>
          </div>
          <Footer />
        </Context>
        <Analytics />
      </body>
    </html>
  );
}
