import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SpinningLogo from "@/components/SpinningLogo";
import InvoicesClient from "./InvoicesClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pending Invoices | Kairo",
    description: "View your pending invoices",
    openGraph: {
      title: "Pending Invoices | Kairo",
      description: "View your pending invoices",
    },
  };
}

export default function InvoicesPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <SpinningLogo />
            </div>
          }
        >
          <InvoicesClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
