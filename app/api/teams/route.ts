import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TeamResponse {
  id: string;
  name: string;
  description: string | null;
  profilePicture: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
  lastActivity: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address")?.toLowerCase();

    if (!address) {
      return Response.json({ error: "Address is required" }, { status: 400 });
    }

    // Get user with teams
    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        teams: {
          include: {
            members: true,
          },
        },
        teamMemberships: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      // Create user if they don't exist
      await prisma.user.create({
        data: {
          address,
          lastSignIn: new Date(),
        },
      });

      return Response.json({ teams: [] });
    }

    // Format owned teams
    const ownedTeams: TeamResponse[] = user.teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      profilePicture: team.profilePicture,
      role: "OWNER",
      memberCount: team.members.length,
      lastActivity: team.updatedAt,
    }));

    // Format member teams (excluding owned teams)
    const memberTeams: TeamResponse[] = user.teamMemberships
      .filter(
        (membership) =>
          !user.teams.some((team) => team.id === membership.team.id)
      )
      .map((membership) => ({
        id: membership.team.id,
        name: membership.team.name,
        description: membership.team.description,
        profilePicture: membership.team.profilePicture,
        role: membership.role,
        memberCount: membership.team.members.length,
        lastActivity: membership.team.updatedAt,
      }));

    // Combine and sort teams
    const teams = [...ownedTeams, ...memberTeams].sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
    );

    return Response.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return Response.json(
      {
        error: "Failed to fetch teams",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, ownerAddress } = body;

    if (!name || !ownerAddress) {
      return Response.json(
        { error: "Name and owner address are required" },
        { status: 400 }
      );
    }

    // First, get or create user outside the transaction
    const user = await prisma.user.upsert({
      where: { address: ownerAddress.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: {
        address: ownerAddress.toLowerCase(),
        lastSignIn: new Date(),
      },
    });

    // Then create team in a separate transaction
    const result = await prisma.$transaction(
      async (tx) => {
        const team = await tx.team.create({
          data: {
            name,
            description,
            owner: {
              connect: { id: user.id },
            },
            members: {
              create: {
                user: {
                  connect: { id: user.id },
                },
                role: "OWNER",
              },
            },
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
            owner: true,
          },
        });

        return team;
      },
      {
        timeout: 20000, // Increased timeout to 20 seconds
        maxWait: 10000, // Increased maximum wait time to 10 seconds
        isolationLevel: "ReadCommitted", // Changed to a less strict isolation level
      }
    );

    return Response.json({ team: result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Failed to create team", details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
