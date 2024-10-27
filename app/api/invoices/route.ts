import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createPublicClient, http, Address } from "viem";
import { sepolia } from "viem/chains";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";

const prisma = new PrismaClient();
const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Define the type for the blockchain invoice
interface BlockchainInvoice {
  issuer: Address;
  client: Address;
  amount: bigint;
  dueDate: bigint;
  token: Address;
  paid: boolean;
}

// Define a type for the raw invoice data returned by the contract
type RawInvoiceData = [Address, Address, bigint, bigint, Address, boolean];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch invoices from the database
    const dbInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { issuerAddress: address.toLowerCase() },
          { clientAddress: address.toLowerCase() },
        ],
      },
      orderBy: {
        issuedDate: "desc", // Order by issued date instead of invoiceId
      },
      include: {
        payments: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Get the latest invoice ID from the database
    const latestDbInvoiceId =
      dbInvoices.length > 0 ? parseInt(dbInvoices[0].invoiceId) : 0;

    // Fetch the next invoice ID from the blockchain
    const nextInvoiceId = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: InvoiceManagerABI,
      functionName: "nextInvoiceId",
    })) as bigint;

    // Only fetch new invoices from the blockchain
    if (BigInt(latestDbInvoiceId) < nextInvoiceId - BigInt(1)) {
      const newInvoices = await Promise.all(
        Array.from(
          { length: Number(nextInvoiceId) - latestDbInvoiceId - 1 },
          async (_, i) => {
            const id = latestDbInvoiceId + i + 1;
            try {
              const invoice = (await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: InvoiceManagerABI,
                functionName: "invoices",
                args: [BigInt(id)],
              })) as RawInvoiceData;

              console.log(`Fetched new invoice ${id}:`, invoice);

              const parsedInvoice: BlockchainInvoice = {
                issuer: invoice[0],
                client: invoice[1],
                amount: invoice[2],
                dueDate: invoice[3],
                token: invoice[4],
                paid: invoice[5],
              };

              return { id, data: parsedInvoice };
            } catch (error) {
              console.error(`Error fetching invoice ${id}:`, error);
              return null;
            }
          }
        )
      );

      // Filter out null values and sort
      const validNewInvoices = newInvoices
        .filter(
          (invoice): invoice is { id: number; data: BlockchainInvoice } =>
            invoice !== null
        )
        .sort((a, b) => a.id - b.id);

      // Sync new invoices to the database
      for (const { id, data: blockchainInvoice } of validNewInvoices) {
        if (
          !blockchainInvoice.issuer ||
          !blockchainInvoice.client ||
          blockchainInvoice.issuer ===
            "0x0000000000000000000000000000000000000000" ||
          blockchainInvoice.client ===
            "0x0000000000000000000000000000000000000000"
        ) {
          console.log(`Skipping invalid invoice data for ID ${id}`);
          continue;
        }

        try {
          // Ensure the issuer exists
          await prisma.user.upsert({
            where: { address: blockchainInvoice.issuer.toLowerCase() },
            update: { lastSignIn: new Date() },
            create: {
              address: blockchainInvoice.issuer.toLowerCase(),
              lastSignIn: new Date(),
            },
          });

          // Ensure the client exists
          await prisma.user.upsert({
            where: { address: blockchainInvoice.client.toLowerCase() },
            update: { lastSignIn: new Date() },
            create: {
              address: blockchainInvoice.client.toLowerCase(),
              lastSignIn: new Date(),
            },
          });

          // Create the new invoice
          await prisma.invoice.create({
            data: {
              invoiceId: id.toString(),
              issuerAddress: blockchainInvoice.issuer.toLowerCase(),
              clientAddress: blockchainInvoice.client.toLowerCase(),
              tokenAddress: blockchainInvoice.token,
              amount: blockchainInvoice.amount.toString(),
              dueDate: new Date(Number(blockchainInvoice.dueDate) * 1000),
              issuedDate: new Date(),
              creationTransactionHash: "", // You should fetch this from the blockchain if available
              paid: blockchainInvoice.paid,
            },
          });
        } catch (error) {
          console.error(`Error creating invoice ${id}:`, error);
        }
      }
    }

    // Fetch updated invoices from the database
    const updatedInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { issuerAddress: address.toLowerCase() },
          { clientAddress: address.toLowerCase() },
        ],
      },
      include: {
        payments: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const formattedInvoices = updatedInvoices.map((invoice) => ({
      ...invoice,
      paidDate: invoice.paid
        ? invoice.payments[0]?.createdAt.toISOString()
        : null,
      status: invoice.paid ? "Paid" : "Created",
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      issuerAddress,
      clientAddress,
      tokenAddress,
      amount,
      dueDate,
      creationTransactionHash,
      invoiceId,
    } = await request.json();

    console.log("Received data:", {
      issuerAddress,
      clientAddress,
      tokenAddress,
      amount,
      dueDate,
      creationTransactionHash,
      invoiceId,
    });

    // Check for missing required parameters
    const missingParams = [];
    if (!issuerAddress) missingParams.push("issuerAddress");
    if (!clientAddress) missingParams.push("clientAddress");
    if (!tokenAddress) missingParams.push("tokenAddress");
    if (!amount) missingParams.push("amount");
    if (!dueDate) missingParams.push("dueDate");
    if (!creationTransactionHash) missingParams.push("creationTransactionHash");
    if (!invoiceId) missingParams.push("invoiceId");

    if (missingParams.length > 0) {
      return NextResponse.json(
        { error: `Missing required parameters: ${missingParams.join(", ")}` },
        { status: 400 }
      );
    }

    if (issuerAddress.toLowerCase() === clientAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Client cannot be the issuer" },
        { status: 400 }
      );
    }

    // Ensure both issuer and client exist
    try {
      await prisma.user.upsert({
        where: { address: issuerAddress.toLowerCase() },
        update: { lastSignIn: new Date() },
        create: {
          address: issuerAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      });

      await prisma.user.upsert({
        where: { address: clientAddress.toLowerCase() },
        update: { lastSignIn: new Date() },
        create: {
          address: clientAddress.toLowerCase(),
          lastSignIn: new Date(),
        },
      });
    } catch (error) {
      console.error("Error upserting users:", error);
      throw new Error("Failed to upsert users");
    }

    // Create new invoice
    try {
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceId,
          issuerAddress: issuerAddress.toLowerCase(),
          clientAddress: clientAddress.toLowerCase(),
          tokenAddress,
          amount,
          dueDate: new Date(dueDate),
          issuedDate: new Date(),
          creationTransactionHash,
          paid: false,
        },
      });

      console.log("Created invoice:", newInvoice);

      return NextResponse.json({ invoice: newInvoice });
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw new Error("Failed to create invoice in database");
    }
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
