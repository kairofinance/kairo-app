import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import Spinner from "@/components/Spinner";
import ViewClient from "./ViewClient";
import { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// Fetch teams server-side
async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        profilePicture: true,
        treasuryAddress: true,
        owner: {
          select: {
            address: true,
          },
        },
      },
    });
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

// Fetch initial activities server-side
async function getInitialActivities(
  address: string | null,
  teamId: string | null
) {
  if (!address) return [];

  try {
    const flows = await prisma.flow.findMany({
      where: {
        AND: [
          { recipientAddress: address.toLowerCase() },
          teamId ? { teamId } : {},
          { status: "ACTIVE" },
          { type: "STREAM" },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return flows.map((flow) => ({
      id: flow.id,
      type: flow.type.toLowerCase(),
      amount: flow.amount,
      tokenAddress: flow.tokenAddress,
      status: flow.status.toLowerCase(),
      counterpartyAddress: flow.senderAddress,
      endDate: flow.endDate?.toISOString(),
      streamRate: flow.streamRate,
      isIncoming: true,
      teamId: flow.teamId,
    }));
  } catch (error) {
    console.error("Error fetching initial activities:", error);
    return [];
  }
}

export default async function ViewPage() {
  const headersList = headers();
  const userAgent = (await headersList).get("user-agent");
  const address = (await headersList).get("x-address"); // You'll need to set this in your auth middleware
  const teamId = (await headersList).get("x-team-id"); // You'll need to set this in your team context middleware

  // Fetch data in parallel
  const [teams, initialActivities] = await Promise.all([
    getTeams(),
    getInitialActivities(address, teamId),
  ]);

  // Get initial view state based on user agent (mobile vs desktop)
  const initialView = userAgent?.includes("Mobile") ? "incoming" : "outgoing";

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
          <ViewClient
            initialTeams={teams}
            initialActivities={initialActivities}
            initialView={initialView}
          />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Active Flows | Kairo",
    description: "View all your active financial flows",
    openGraph: {
      title: "Active Flows | Kairo",
      description: "View all your active financial flows",
    },
  };
}

export const dynamic = "force-dynamic";
