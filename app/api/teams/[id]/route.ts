import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCacheHeaders } from "@/utils/cache-headers";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  try {
    const userAddress = request.headers.get("x-user-address")?.toLowerCase();
    if (!userAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        invites: {
          include: {
            invitee: true,
          },
        },
      },
    });

    if (!team) {
      return Response.json(
        { error: "Team not found" },
        { status: 404, headers }
      );
    }

    // Check if user is a member
    const isMember = team.members.some(
      (member) => member.user.address.toLowerCase() === userAddress
    );

    if (!isMember) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    return Response.json(team, { headers });
  } catch (error) {
    console.error("Error fetching team:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  try {
    const userAddress = request.headers.get("x-user-address")?.toLowerCase();
    if (!userAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const body = await request.json();
    const { name, description, website, treasuryAddress } = body;

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      return Response.json(
        { error: "Team not found" },
        { status: 404, headers }
      );
    }

    // Check if user is the owner
    if (team.owner.address.toLowerCase() !== userAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    // Check if name can be changed (7 days cooldown)
    if (name && name !== team.name) {
      const lastNameChange = team.lastNameChange || team.createdAt;
      const weekSince = new Date(
        lastNameChange.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      if (new Date() < weekSince) {
        return Response.json(
          { error: "Name can only be changed once every 7 days" },
          { status: 400, headers }
        );
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name && { name, lastNameChange: new Date() }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(treasuryAddress !== undefined && { treasuryAddress }),
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return Response.json(updatedTeam, { headers });
  } catch (error) {
    console.error("Error updating team:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const headers = getCacheHeaders({
    maxAge: 3600,
    staleWhileRevalidate: 300,
  });

  try {
    const userAddress = request.headers.get("x-user-address")?.toLowerCase();
    if (!userAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
      },
    });

    if (!team) {
      return Response.json(
        { error: "Team not found" },
        { status: 404, headers }
      );
    }

    // Check if user is the owner
    if (team.owner.address.toLowerCase() !== userAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    await prisma.team.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true }, { headers });
  } catch (error) {
    console.error("Error deleting team:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
