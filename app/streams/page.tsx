import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SpinningLogo from "@/components/SpinningLogo";
import ManageStreamsClient from "./ManageStreamsClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Manage Streams | Plasma",
    description: "View and manage your active token streams",
    openGraph: {
      title: "Manage Streams | Plasma",
      description: "View and manage your active token streams",
    },
  };
}

export default function ManageStreamsPage() {
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
          <ManageStreamsClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
