import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SpinningLogo from "@/components/SpinningLogo";
import CreateVestingClient from "./CreateVestingClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Vesting Schedule | Kairo",
    description: "Set up a new token vesting schedule",
    openGraph: {
      title: "Create Vesting Schedule | Kairo",
      description: "Set up a new token vesting schedule",
    },
  };
}

export default function CreateVestingPage() {
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
          <CreateVestingClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
