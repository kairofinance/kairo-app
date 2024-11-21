import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import { cookies } from "next/headers";
import SpinningLogo from "@/components/SpinningLogo";
import OverviewClient from "./OverviewClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function DashboardPage() {
  const cookieStore = cookies();

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
          <OverviewClient />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

// Add metadata with cache headers
export async function generateMetadata() {
  const headers = getCacheHeaders({
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300,
  });

  return {
    title: "Dashboard | Kairo",
    description: "View your dashboard and recent activity",
    other: {
      headers,
    },
  };
}

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";
