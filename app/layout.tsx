import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { i18n, Locale } from "@/utils/i18n-config";
import { cookies, headers } from "next/headers";
import "react-loading-skeleton/dist/skeleton.css";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersInstance = await headers();
  const cookies = headersInstance.get("cookie");
  const langCookie = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("NEXT_LOCALE="));
  const lang = langCookie
    ? (langCookie.split("=")[1] as Locale)
    : i18n.defaultLocale;

  return (
    <html lang={lang}>
      <body className={`${inter.className} dark:bg-kairo-black bg-kairo-white`}>
        <LayoutContent lang={lang}>{children}</LayoutContent>
      </body>
    </html>
  );
}
