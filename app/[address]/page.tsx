import { Suspense } from "react";
import { cookies } from "next/headers";
import SpinningLogo from "@/components/SpinningLogo";
import ProfileClient from "./ProfileClient";
import { getCacheHeaders } from "@/utils/cache-headers";
import type { Metadata } from "next";

export default async function ProfilePage({ params }: any) {
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
        <ProfileClient address={params.address} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  return {
    title: `Profile ${params.address.slice(0, 6)}... | Plasma`,
    description: `View profile and activity for ${params.address}`,
  };
}

export const dynamic = "force-dynamic";
