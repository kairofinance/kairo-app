import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/teams/[id] - Get a single team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const teamId = await params.id;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    if (!team) {
      return new Response(JSON.stringify({ error: "Team not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ team }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch team" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/teams/[id] - Update team details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const teamId = await params.id;

  try {
    const body = await request.json();

    // Destructure with default values to prevent null/undefined
    const {
      name = undefined,
      description = undefined,
      website = undefined,
      treasuryAddress = undefined,
    } = body;

    // Get current team to check lastNameChange
    const currentTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!currentTeam) {
      return new Response(JSON.stringify({ error: "Team not found" }), {
        status: 404,
      });
    }

    // Check if name is being changed
    const nameUpdate =
      name && name !== currentTeam.name
        ? {
            name,
            lastNameChange: new Date(),
          }
        : {};

    // Create update data object with only defined values
    const updateData = {
      ...nameUpdate,
      ...(description !== undefined && { description }),
      ...(website !== undefined && { website }),
      ...(treasuryAddress !== undefined && { treasuryAddress }),
    };

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    return new Response(JSON.stringify({ team }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update team",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const teamId = await params.id;

  try {
    // Delete all team members first
    await prisma.teamMember.deleteMany({
      where: { teamId },
    });

    // Then delete the team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return new Response(JSON.stringify({ error: "Failed to delete team" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
