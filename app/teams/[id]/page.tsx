import { Suspense } from "react";
import { cookies } from "next/headers";
import SpinningLogo from "@/components/SpinningLogo";
import TeamClient from "./TeamClient";
import { getCacheHeaders } from "@/utils/cache-headers";

interface TeamPageProps {
  params: {
    id: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const [teamId, cookieStore] = await Promise.all([
    Promise.resolve(params.id),
    cookies(),
  ]);

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <SpinningLogo />
          </div>
        }
      >
        <TeamClient teamId={teamId} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: TeamPageProps) {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  const teamId = await Promise.resolve(params.id);

  return {
    title: `Team Details | Plasma`,
    description: "View and manage team details",
    other: {
      headers,
    },
  };
}

export const dynamic = "force-dynamic";
