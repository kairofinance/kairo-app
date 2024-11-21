import { NextRequest } from "next/server";
import { PrismaClient, InviteStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address")?.toLowerCase();
    const status = searchParams.get("status");

    if (!address) {
      return Response.json({ error: "Address is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { address },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ invites: [] });
    }

    const invites = await prisma.teamInvite.findMany({
      where: {
        inviteeId: user.id,
        status: status ? (status as InviteStatus) : undefined,
      },
      include: {
        team: true,
        inviter: true,
      },
    });

    return Response.json({ invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return Response.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teamId, inviteeAddress, inviterAddress } = await request.json();

    const [invitee, inviter] = await Promise.all([
      prisma.user.findUnique({
        where: { address: inviteeAddress.toLowerCase() },
      }),
      prisma.user.findUnique({
        where: { address: inviterAddress.toLowerCase() },
      }),
    ]);

    if (!invitee || !inviter) {
      return Response.json({ error: "Invalid addresses" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.create({
      data: {
        team: { connect: { id: teamId } },
        invitee: { connect: { id: invitee.id } },
        inviter: { connect: { id: inviter.id } },
      },
      include: {
        team: true,
        invitee: true,
        inviter: true,
      },
    });

    return Response.json({ invite });
  } catch (error) {
    console.error("Error creating invite:", error);
    return Response.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
