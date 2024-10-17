import { NextResponse } from "next/server";
import { initialize } from "zokrates-js";
import fs from "fs";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { token, issuer, client, amount, dueDate, nextInvoiceId } =
      await request.json();

    if (!token || !issuer || !client || !amount || !dueDate || !nextInvoiceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Inputs:", {
      token,
      issuer,
      client,
      amount,
      dueDate,
      nextInvoiceId,
    });

    const zokratesProvider = await initialize();
    console.log("ZoKrates initialized");

    const source = fs.readFileSync(
      path.join(process.cwd(), "circuits", "invoice_creation.zok"),
      "utf-8"
    );
    console.log("ZoKrates source loaded");

    const artifacts = zokratesProvider.compile(source);
    console.log("Compilation successful");

    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
      token,
      issuer,
      client,
      amount,
      dueDate,
      nextInvoiceId,
    ]);
    console.log("Witness computed, output:", output);

    // Read the proving key as a buffer
    const provingKey = fs.readFileSync(path.join(process.cwd(), "proving.key"));
    console.log("Proving key loaded");

    const proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      provingKey
    );
    console.log("Proof generated");

    return NextResponse.json({
      proof: {
        // @ts-ignore
        a: proof.proof.a,
        // @ts-ignore
        b: proof.proof.b,
        // @ts-ignore
        c: proof.proof.c,
        input: proof.inputs,
      },
      output,
    });
  } catch (error) {
    console.error("Error generating invoice creation proof:", error);
    return NextResponse.json(
      {
        error: "Failed to generate invoice creation proof",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
