import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/teams/[id]/members - Add a new member
export async function POST(request: NextRequest, context: any) {
  try {
    const { address, role = "MEMBER" } = await request.json();
    const teamId = context.params.id;

    if (!address) {
      return Response.json(
        { error: "Member address is required" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { address: address.toLowerCase() },
      update: { lastSignIn: new Date() },
      create: {
        address: address.toLowerCase(),
        lastSignIn: new Date(),
      },
    });

    // Add member to team
    const member = await prisma.teamMember.create({
      data: {
        role,
        team: { connect: { id: teamId } },
        user: { connect: { id: user.id } },
      },
      include: {
        user: true,
      },
    });

    return Response.json({ member });
  } catch (error) {
    console.error("Error adding team member:", error);
    return Response.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id]/members/[memberId] - Update member role
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { role } = await request.json();
    const { memberId } = context.params;

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: true,
      },
    });

    return Response.json({ member });
  } catch (error) {
    console.error("Error updating team member:", error);
    return Response.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members/[memberId] - Remove a member
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { memberId } = context.params;

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return Response.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
