import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { i18n, Locale } from "@/utils/i18n-config";
import { cookies } from "next/headers";
import AlertMessage from "@/components/AlertMessage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kairo",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions.",
  icons: "./favicon.ico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("NEXT_LOCALE");
  const lang = langCookie ? (langCookie.value as Locale) : i18n.defaultLocale;

  return (
    <html lang={lang}>
      <body className={`${inter.className} dark:bg-zinc-900 bg-gradient-to-t `}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar currentLang={lang} />
            <div
              id="alert-container"
              className="fixed top-16 left-0 right-0 z-50"
            ></div>
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
