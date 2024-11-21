import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PATCH /api/teams/[id]/members/[memberId] - Update member role
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { id: teamId, memberId } = context.params;
    const { role } = await request.json();

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
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/teams/[id]/members/[memberId] - Remove a member
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { id: teamId, memberId } = context.params;

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
  } finally {
    await prisma.$disconnect();
  }
}
