import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SpinningLogo from "@/components/SpinningLogo";
import ManageVestingClient from "./ManageVestingClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Manage Vesting | Kairo",
    description: "View and manage your token vesting schedules",
    openGraph: {
      title: "Manage Vesting | Kairo",
      description: "View and manage your token vesting schedules",
    },
  };
}

export default function ManageVestingPage() {
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
          <ManageVestingClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
