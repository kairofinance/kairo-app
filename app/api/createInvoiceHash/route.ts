import { NextResponse } from "next/server";
import { initialize } from "zokrates-js";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { token, issuer, client, amount, dueDate } = await request.json();

    // Validate inputs
    if (!token || !issuer || !client || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const zokratesProvider = await initialize();
    const source = fs.readFileSync(
      path.join(process.cwd(), "circuits", "invoice_creation.zok"),
      "utf-8"
    );
    const artifacts = zokratesProvider.compile(source);

    // Compute witness
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
      token,
      issuer,
      client,
      amount,
      dueDate,
    ]);

    // Generate proof
    const keypair = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "verification.key"), "utf-8")
    );
    const proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      keypair.pk
    );

    return NextResponse.json({ proof, output });
  } catch (error) {
    console.error("Error generating invoice creation proof:", error);
    return NextResponse.json(
      {
        error: "Failed to generate invoice creation proof",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
