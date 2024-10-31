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
  title: "Kairo",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions.",
  icons: "./favicon.ico",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await headers()).get("cookie");

  return (
    <html>
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
