import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/teams/[id] - Get a single team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

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
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    return Response.json({ team });
  } catch (error) {
    console.error("Error fetching team:", error);
    return Response.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

// PATCH /api/teams/[id] - Update team details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    const { name, description, website, treasuryAddress } =
      await request.json();

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description,
        website,
        treasuryAddress,
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

    return Response.json({ team });
  } catch (error) {
    console.error("Error updating team:", error);
    return Response.json({ error: "Failed to update team" }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

    // Delete all team members first
    await prisma.teamMember.deleteMany({
      where: { teamId },
    });

    // Then delete the team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return Response.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
