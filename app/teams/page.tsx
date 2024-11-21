import { Suspense } from "react";
import { cookies } from "next/headers";
import SpinningLogo from "@/components/SpinningLogo";
import TeamsClient from "./TeamsClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function TeamsPage() {
  const cookieStore = cookies();

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <SpinningLogo />
          </div>
        }
      >
        <TeamsClient />
      </Suspense>
    </div>
  );
}

export async function generateMetadata() {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  return {
    title: "Teams | Kairo",
    description: "Manage your teams and memberships",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
