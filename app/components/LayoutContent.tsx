"use client";

import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Locale } from "@/utils/i18n-config";

const CustomErrorBoundary = dynamic(
  () => import("../../components/CustomErrorBoundary"),
  { ssr: false }
);

interface LayoutContentProps {
  children: React.ReactNode;
  lang: Locale;
}

export default function LayoutContent({ children, lang }: LayoutContentProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div
        id="alert-container"
        className="fixed top-16 left-0 right-0 z-50"
      ></div>
      <main className="flex-grow m-auto place-content-center">
        <CustomErrorBoundary>{children}</CustomErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
