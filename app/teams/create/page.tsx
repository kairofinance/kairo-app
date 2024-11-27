import { Suspense } from "react";
import { cookies } from "next/headers";
import SpinningLogo from "@/components/SpinningLogo";
import CreateTeamClient from "./CreateTeamClient";
import { getCacheHeaders } from "@/utils/cache-headers";

export default async function CreateTeamPage() {
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
        <CreateTeamClient />
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
    title: "Create Team | Kairo",
    description: "Create a new team",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
