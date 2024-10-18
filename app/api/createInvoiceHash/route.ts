import { NextResponse } from "next/server";
import { initialize } from "zokrates-js";
import fs from "fs";
import path from "path";
import { isAddress, getAddress } from "viem";
import { keccak256, toHex } from "viem";

function hexToDecimal(hex: string): string {
  try {
    // Remove '0x' prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    // Ensure the hex string is valid
    if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
      throw new Error(`Invalid hexadecimal string: ${hex}`);
    }
    // Convert hex to decimal
    return BigInt(`0x${cleanHex}`).toString();
  } catch (error) {
    console.error(`Error converting hex to decimal: ${hex}`, error);
    throw error;
  }
}

function ensToNumeric(ens: string): string {
  // Convert ENS name to a numeric representation using keccak256 hash
  const hash = keccak256(toHex(ens));
  return hexToDecimal(hash);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { token, issuer, client, amount, dueDate, nextInvoiceId } =
      await request.json();

    console.log("Raw inputs:", {
      token,
      issuer,
      client,
      amount,
      dueDate,
      nextInvoiceId,
    });

    if (!token || !issuer || !client || !amount || !dueDate || !nextInvoiceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate token address
    if (!isAddress(token)) {
      return NextResponse.json(
        { error: "Invalid token address" },
        { status: 400 }
      );
    }

    // Convert hexadecimal addresses to decimal
    const tokenDecimal = hexToDecimal(getAddress(token));
    const issuerDecimal = hexToDecimal(getAddress(issuer));
    const clientDecimal = client.endsWith(".eth")
      ? ensToNumeric(client)
      : hexToDecimal(getAddress(client));

    console.log("Converted inputs:", {
      token: tokenDecimal,
      issuer: issuerDecimal,
      client: clientDecimal,
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
      tokenDecimal,
      issuerDecimal,
      clientDecimal,
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
        a: proof.proof.a, // @ts-ignore
        b: proof.proof.b, // @ts-ignore
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
