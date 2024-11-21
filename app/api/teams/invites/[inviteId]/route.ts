import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE /api/teams/invites/[inviteId] - Cancel an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const inviteId = params.inviteId;

    await prisma.teamInvite.delete({
      where: { id: inviteId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error canceling invite:", error);
    return Response.json({ error: "Failed to cancel invite" }, { status: 500 });
  }
}

// PATCH /api/teams/invites/[inviteId] - Accept/Decline an invite
export async function PATCH(
  request: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const inviteId = params.inviteId;
    const { status } = await request.json();

    const invite = await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status },
      include: {
        team: true,
        invitee: true,
      },
    });

    // If the invite is accepted, create a team member
    if (status === "ACCEPTED") {
      await prisma.teamMember.create({
        data: {
          team: { connect: { id: invite.team.id } },
          user: { connect: { id: invite.invitee.id } },
          role: "MEMBER",
        },
      });
    }

    return Response.json({ invite });
  } catch (error) {
    console.error("Error updating invite:", error);
    return Response.json({ error: "Failed to update invite" }, { status: 500 });
  }
}
