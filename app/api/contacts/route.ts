import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCacheHeaders } from "@/utils/cache-headers";

// Create a single PrismaClient instance and reuse it
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  const headers = getCacheHeaders({
    maxAge: 60,
    staleWhileRevalidate: 30,
  });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    console.log("Finding user with address:", address.toLowerCase());

    // First, ensure the user exists
    let user = await prisma.user.findUnique({
      where: {
        address: address.toLowerCase(),
      },
      include: {
        contacts: true,
      },
    });

    console.log("Found user:", user);

    // If user doesn't exist, create them
    if (!user) {
      console.log("Creating new user");
      try {
        user = await prisma.user.create({
          data: {
            address: address.toLowerCase(),
            lastSignIn: new Date(),
          },
          include: {
            contacts: true,
          },
        });
        console.log("Created user:", user);
      } catch (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }
    }

    return NextResponse.json({ contacts: user.contacts }, { headers });
  } catch (error) {
    console.error("Error in GET /api/contacts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contacts",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received POST request with body:", body);

    const { name, address: contactAddress, userAddress } = body;

    if (!name || !contactAddress || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Finding user with address:", userAddress.toLowerCase());

    // First, ensure the user exists
    let user = await prisma.user.findUnique({
      where: {
        address: userAddress.toLowerCase(),
      },
    });

    if (!user) {
      console.log("Creating new user");
      try {
        user = await prisma.user.create({
          data: {
            address: userAddress.toLowerCase(),
            lastSignIn: new Date(),
          },
        });
        console.log("Created user:", user);
      } catch (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }
    }

    // Check if contact already exists
    console.log("Checking for existing contact");
    const existingContact = await prisma.contact.findFirst({
      where: {
        AND: [{ userId: user.id }, { address: contactAddress.toLowerCase() }],
      },
    });

    if (existingContact) {
      console.log("Contact already exists:", existingContact);
      return NextResponse.json(
        { error: "This address is already in your contacts" },
        { status: 400 }
      );
    }

    // Create the contact
    console.log("Creating new contact");
    const contact = await prisma.contact.create({
      data: {
        name,
        address: contactAddress.toLowerCase(),
        userId: user.id,
      },
    });

    console.log("Created contact:", contact);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/contacts:", error);

    // Check for unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This address is already in your contacts" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create contact",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
