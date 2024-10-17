import { NextResponse } from "next/server";
import { initialize } from "zokrates-js";
import fs from "fs";
import path from "path";

interface Proof {
  proof: {
    a: string[];
    b: string[][];
    c: string[];
  };
  inputs: string[];
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { invoiceHash, amount, token } = await request.json();

    if (!invoiceHash || !amount || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Inputs:", { invoiceHash, amount, token });

    const zokratesProvider = await initialize();
    console.log("ZoKrates initialized");

    const source = fs.readFileSync(
      path.join(process.cwd(), "circuits", "invoice_payment.zok"),
      "utf-8"
    );
    console.log("ZoKrates source loaded");

    const artifacts = zokratesProvider.compile(source);
    console.log("Compilation successful");

    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
      invoiceHash,
      amount,
      token,
    ]);
    console.log("Witness computed, output:", output);

    const provingKeyPath = path.join(process.cwd(), "proving.key");
    const provingKey = fs.readFileSync(provingKeyPath);
    console.log("Proving key loaded");

    const proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      provingKey
    ) as Proof;
    console.log("Proof generated");

    return NextResponse.json({
      proof: {
        a: proof.proof.a,
        b: proof.proof.b,
        c: proof.proof.c,
        input: proof.inputs,
      },
      output,
    });
  } catch (error) {
    console.error("Error generating invoice payment proof:", error);
    return NextResponse.json(
      {
        error: "Failed to generate invoice payment proof",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
