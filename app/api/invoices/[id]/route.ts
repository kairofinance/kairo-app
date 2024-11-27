import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const userAddress = request.headers.get("x-user-address");

    if (!userAddress) {
      return NextResponse.json(
        { error: "Wallet not connected" },
        { status: 401 }
      );
    }

    console.log("Searching for invoice with ID:", id);

    // Try to find the invoice by database ID first
    let invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    // If not found by ID, try finding by invoiceId
    if (!invoice) {
      invoice = await prisma.invoice.findFirst({
        where: { invoiceId: id },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      });
    }

    if (!invoice) {
      console.log("Invoice not found for ID:", id);
      return NextResponse.json(
        { error: "Invoice not found", debug: { searchedId: id } },
        { status: 404 }
      );
    }

    console.log("Found invoice:", invoice);

    // Convert all addresses to lowercase for comparison
    const userAddressLower = userAddress.toLowerCase();
    const issuerAddressLower = invoice.issuerAddress.toLowerCase();
    const clientAddressLower = invoice.clientAddress.toLowerCase();

    const isAuthorized =
      userAddressLower === issuerAddressLower ||
      userAddressLower === clientAddressLower;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "You must be either the invoice issuer or recipient to view this invoice",
          debug: {
            userAddress: userAddressLower,
            issuerAddress: issuerAddressLower,
            clientAddress: clientAddressLower,
          },
        },
        { status: 403 }
      );
    }

    // Extract numeric value from transaction hash and convert to decimal
    const chainId = invoice?.creationTransactionHash
      ? parseInt(invoice.creationTransactionHash.slice(-10), 16).toString()
      : null;

    // Format the response with chainId
    const formattedInvoice = {
      ...invoice,
      chainId,
      paidDate:
        invoice?.paid && invoice?.payments[0]
          ? invoice.payments[0].createdAt.toISOString()
          : null,
    };

    return NextResponse.json(formattedInvoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
