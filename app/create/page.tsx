import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SpinningLogo from "@/components/SpinningLogo";
import CreateClient from "./CreateClient";
import { Metadata } from "next";
import PageTransition from "@/components/PageTransition";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create | Kairo",
    description: "Create invoices, streams, and vesting schedules",
    openGraph: {
      title: "Create | Kairo",
      description: "Create invoices, streams, and vesting schedules",
    },
  };
}

export default function CreatePage() {
  return (
    <PageTransition>
      <AuthWrapper>
        <div className="min-h-screen">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <SpinningLogo />
              </div>
            }
          >
            <CreateClient />
          </Suspense>
        </div>
      </AuthWrapper>
    </PageTransition>
  );
}

export const dynamic = "force-dynamic";
