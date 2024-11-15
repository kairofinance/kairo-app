import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import Spinner from "@/components/Spinner";
import CreateClient from "./CreateClient";
import { Metadata } from "next";

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
    <AuthWrapper>
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Spinner />
            </div>
          }
        >
          <CreateClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
